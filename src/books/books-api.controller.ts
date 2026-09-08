import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from '../generated/prisma-class/book';
import { PaginatedBooksDto } from './dto/paginated-books.dto';
import { PaginatedBookLibrariesDto } from './dto/paginated-book-libraries.dto';
import { BookLibraryDto } from './dto/book-library.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';

@ApiTags('Books')
@Controller('api/books')
@UsePipes(ApiValidationPipe)
export class BooksApiController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список книг с пагинацией' })
  @ApiOkResponse({ type: PaginatedBooksDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.booksService.findAllPaginated(query);
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
  @ApiOperation({ summary: 'Получить книгу по id' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: Book })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Get(':id/libraries')
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
  @ApiOperation({ summary: 'Получить конкретную связь книги и библиотеки' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiParam({ name: 'libraryId', example: 'library-id' })
  @ApiOkResponse({ type: BookLibraryDto })
  @ApiNotFoundResponse({ description: 'Связь не найдена' })
  findLibrary(@Param('id') id: string, @Param('libraryId') libraryId: string) {
    return this.booksService.findLibraryRelation(id, libraryId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать книгу' })
  @ApiCreatedResponse({ type: Book })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить книгу' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiOkResponse({ type: Book })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.booksService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить книгу' })
  @ApiParam({ name: 'id', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Книга удалена' })
  @ApiNotFoundResponse({ description: 'Книга не найдена' })
  async remove(@Param('id') id: string) {
    await this.booksService.remove(id);
  }
}
