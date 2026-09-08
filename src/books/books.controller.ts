import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  Render,
  Redirect,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { SseService, SseMessage } from './sse.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';
import { authSuffix, isAuthenticated } from '../common/utils';

const MAX_COVER_SIZE = 5 * 1024 * 1024;

const coverFilePipe = new ParseFilePipe({
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_COVER_SIZE }),
    new FileTypeValidator({ fileType: 'image/(jpeg|png|webp|gif)' }),
  ],
  fileIsRequired: false,
});

@ApiExcludeController()
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly sseService: SseService,
    private readonly storageService: StorageService,
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
  @UseInterceptors(FileInterceptor('imageFile'))
  async create(
    @Body() dto: CreateBookDto,
    @UploadedFile(coverFilePipe) file: Express.Multer.File | undefined,
    @Query('auth') auth?: string,
  ) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storageService.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      const book = await this.booksService.create(dto);
      this.sseService.emit('book-created', book);
      return { url: `/books/${book.id}${authSuffix(auth)}` };
    } catch (e) {
      if (uploadedUrl) {
        await this.storageService.delete(uploadedUrl).catch(() => undefined);
      }
      throw e;
    }
  }

  @Patch(':id')
  @Redirect()
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile(coverFilePipe) file: Express.Multer.File | undefined,
    @Query('auth') auth?: string,
  ) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storageService.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      const book = await this.booksService.update(id, dto);
      this.sseService.emit('book-updated', book);
      return { url: `/books/${id}${authSuffix(auth)}` };
    } catch (e) {
      if (uploadedUrl) {
        await this.storageService.delete(uploadedUrl).catch(() => undefined);
      }
      throw e;
    }
  }

  @Delete(':id')
  @Redirect()
  async remove(@Param('id') id: string, @Query('auth') auth?: string) {
    const book = await this.booksService.remove(id);
    this.sseService.emit('book-deleted', book);
    return { url: `/books${authSuffix(auth)}` };
  }
}
