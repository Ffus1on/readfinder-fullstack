import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Render,
  Redirect,
  Sse,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { SseService, SseMessage } from './sse.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Observable } from 'rxjs';
import { authSuffix, isAuthenticated } from '../common/utils';

@ApiExcludeController()
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly sseService: SseService,
  ) {}

  @Get()
  @Render('books/index')
  async findAll(@Query('auth') auth?: string) {
    const books = await this.booksService.findAll();
    return {
      title: 'Каталог книг - ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/catalog.css',
        'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css',
      ],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      books,
      scripts: [
        'https://code.jquery.com/jquery-3.7.1.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js',
        '/javascript/sse-books.js',
      ],
    };
  }

  @Get('add')
  @Render('books/add')
  addForm(@Query('auth') auth?: string) {
    return {
      title: 'Добавить книгу - ReadFinder',
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
    };
  }

  @Sse('sse')
  sse(): Observable<SseMessage> {
    return this.sseService.getEvents();
  }

  @Get(':id')
  @Render('books/show')
  async findOne(@Param('id') id: string, @Query('auth') auth?: string) {
    const book = await this.booksService.findOne(id);
    return {
      title: `${book.title} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      book,
    };
  }

  @Get(':id/edit')
  @Render('books/edit')
  async editForm(@Param('id') id: string, @Query('auth') auth?: string) {
    const book = await this.booksService.findOne(id);
    return {
      title: 'Редактировать книгу - ReadFinder',
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      book,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateBookDto, @Query('auth') auth?: string) {
    const book = await this.booksService.create(dto);
    this.sseService.emit('book-created', book);
    return { url: `/books/${book.id}${authSuffix(auth)}` };
  }

  @Patch(':id')
  @Redirect()
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @Query('auth') auth?: string,
  ) {
    const book = await this.booksService.update(id, dto);
    this.sseService.emit('book-updated', book);
    return { url: `/books/${id}${authSuffix(auth)}` };
  }

  @Delete(':id')
  @Redirect()
  async remove(@Param('id') id: string, @Query('auth') auth?: string) {
    const book = await this.booksService.remove(id);
    this.sseService.emit('book-deleted', book);
    return { url: `/books${authSuffix(auth)}` };
  }
}
