import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { BookRatingService } from './book-rating.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '../generated/prisma-class/book';
import { SetBookRatingDto } from './dto/set-book-rating.dto';
import { BookRatingSummaryDto } from './dto/book-rating-summary.dto';
import { PaginatedBooksDto } from './dto/paginated-books.dto';
import { PaginatedBookLibrariesDto } from './dto/paginated-book-libraries.dto';
import { BookLibraryDto } from './dto/book-library.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import { EtagInterceptor } from '../common/etag.interceptor';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { PublicAccess } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { requireUserId } from '../auth/auth-user';

@ApiTags('Books')
@Controller('api/books')
@UsePipes(ApiValidationPipe)
@UseInterceptors(EtagInterceptor)
export class BooksApiController {
  constructor(
    private readonly booksService: BooksService,
    private readonly bookRatingService: BookRatingService,
  ) {}

  @Get()
  @PublicAccess()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить список книг с пагинацией' })
  @ApiOkResponse({ type: PaginatedBooksDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total, cached } =
      await this.booksService.findAllPaginatedCached(query);
    res.setHeader('X-Cache', cached ? 'HIT' : 'MISS');
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      '/api/books',
      query,
      data,
      total,
    );
  }

  @Get(':id')
  @PublicAccess()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить книгу по id' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: Book })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Get(':id/libraries')
  @PublicAccess()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить библиотеки, в которых есть книга' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: PaginatedBookLibrariesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  async findLibraries(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.booksService.findLibrariesPaginated(
      id,
      query,
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/books/${id}/libraries`,
      query,
      data,
      total,
    );
  }

  @Get(':id/libraries/:libraryId')
  @PublicAccess()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить конкретную связь книги и библиотеки' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiParam({ name: 'libraryId', example: 'library-id' })
  @ApiOkResponse({ type: BookLibraryDto })
  @ApiNotFoundResponse({ description: 'Связь не найдена' })
  findLibrary(@Param('id') id: string, @Param('libraryId') libraryId: string) {
    return this.booksService.findLibraryRelation(id, libraryId);
  }

  @Get(':id/rating')
  @PublicAccess()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить агрегированный рейтинг книги' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: BookRatingSummaryDto })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  getRating(@Param('id') id: string) {
    return this.bookRatingService.getSummary(id);
  }

  @Put(':id/rating')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Поставить или изменить свою оценку книги' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: BookRatingSummaryDto })
  @ApiBadRequestResponse({ description: 'Некорректная оценка' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  async setRating(
    @Param('id') id: string,
    @Body() dto: SetBookRatingDto,
    @Req() req: Request,
  ) {
    await this.bookRatingService.setRating(id, requireUserId(req), dto.value);
    return this.bookRatingService.getSummary(id);
  }

  @Delete(':id/rating')
  @ApiCookieAuth('sessionAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Снять свою оценку книги' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Оценка снята' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  async removeRating(@Param('id') id: string, @Req() req: Request) {
    await this.bookRatingService.removeRating(id, requireUserId(req));
  }

  @Post()
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Создать книгу' })
  @ApiCreatedResponse({ type: Book })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Доступно только администратору' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Обновить книгу' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: Book })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Доступно только администратору' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiCookieAuth('sessionAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить книгу' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Книга удалена' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Доступно только администратору' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  async remove(@Param('id') id: string) {
    await this.booksService.remove(id);
  }
}
