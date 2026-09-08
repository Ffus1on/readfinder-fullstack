import {
  BadRequestException,
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
  Req,
  Query,
  Render,
  Redirect,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, requireUserId, viewUser } from '../auth/auth-user';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { BooksService } from './books.service';
import { BookRatingService } from './book-rating.service';
import { SseService, SseMessage } from './sse.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { StorageService } from '../storage/storage.service';
import { Observable } from 'rxjs';

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
    private readonly bookRatingService: BookRatingService,
    private readonly sseService: SseService,
    private readonly storageService: StorageService,
  ) {}

  @Get()
  @PublicAccess()
  @Render('books/index')
  async findAll(@Req() req: Request, @Query('search') search?: string) {
    const [found, user] = await Promise.all([
      this.booksService.findAll(search),
      Promise.resolve(getUser(req)),
    ]);
    const books = await this.bookRatingService.withRatingSummaries(found);
    return {
      title: 'Каталог книг - ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/catalog.css',
        'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.css',
      ],
      user: viewUser(user),
      books,
      search: search || '',
      scripts: [
        'https://code.jquery.com/jquery-3.7.1.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js',
        '/javascript/sse-books.js',
      ],
    };
  }

  @Get('add')
  @Roles('admin')
  @Render('books/add')
  addForm(@Req() req: Request) {
    const user = getUser(req);
    return {
      title: 'Добавить книгу - ReadFinder',
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: viewUser(user),
    };
  }

  @Sse('sse')
  @PublicAccess()
  sse(): Observable<SseMessage> {
    return this.sseService.getEvents();
  }

  @Get(':id')
  @PublicAccess()
  @Render('books/show')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const [book, rating, myRating, libraries] = await Promise.all([
      this.booksService.findOne(id),
      this.bookRatingService.getSummary(id),
      (async () => {
        const user = getUser(req);
        return user ? this.bookRatingService.myRating(id, user.id) : null;
      })(),
      this.booksService.findLibrariesByBook(id),
    ]);
    const user = getUser(req);
    return {
      title: `${book.title} - ReadFinder`,
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: viewUser(user),
      book,
      rating,
      myRating,
      libraries,
      scripts: ['/javascript/book-libraries.js', '/javascript/book-rating.js'],
    };
  }

  @Get(':id/edit')
  @Roles('admin')
  @Render('books/edit')
  async editForm(@Param('id') id: string, @Req() req: Request) {
    const book = await this.booksService.findOne(id);
    const user = getUser(req);
    return {
      title: 'Редактировать книгу - ReadFinder',
      styles: ['/styles/template.css', '/styles/catalog.css'],
      user: viewUser(user),
      book,
    };
  }

  @Post()
  @Roles('admin')
  @Redirect()
  @UseInterceptors(FileInterceptor('imageFile'))
  async create(
    @Body() dto: CreateBookDto,
    @UploadedFile(coverFilePipe) file: Express.Multer.File | undefined,
  ) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storageService.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      const book = await this.booksService.create(dto);
      this.sseService.emit('book-created', book);
      return { url: `/books/${book.id}` };
    } catch (e) {
      if (uploadedUrl) {
        await this.storageService.delete(uploadedUrl).catch(() => undefined);
      }
      throw e;
    }
  }

  @Patch(':id')
  @Roles('admin')
  @Redirect()
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @UploadedFile(coverFilePipe) file: Express.Multer.File | undefined,
  ) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storageService.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      const book = await this.booksService.update(id, dto);
      this.sseService.emit('book-updated', book);
      return { url: `/books/${id}` };
    } catch (e) {
      if (uploadedUrl) {
        await this.storageService.delete(uploadedUrl).catch(() => undefined);
      }
      throw e;
    }
  }

  @Post(':id/rating')
  @Redirect()
  async setRating(
    @Param('id') id: string,
    @Body() body: { value?: string },
    @Req() req: Request,
  ) {
    const userId = requireUserId(req);
    const value = Number(body.value);
    if (!Number.isInteger(value)) {
      throw new BadRequestException('Укажите целочисленную оценку');
    }
    await this.bookRatingService.setRating(id, userId, value);
    return { url: `/books/${id}` };
  }

  @Delete(':id/rating')
  @Redirect()
  async removeRating(@Param('id') id: string, @Req() req: Request) {
    await this.bookRatingService.removeRating(id, requireUserId(req));
    return { url: `/books/${id}` };
  }

  @Delete(':id')
  @Roles('admin')
  @Redirect()
  async remove(@Param('id') id: string) {
    const book = await this.booksService.remove(id);
    this.sseService.emit('book-deleted', book);
    return { url: `/books` };
  }
}
