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
  Query,
  Req,
  Res,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { LibrariesService } from './libraries.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { CreateLibraryBookDto } from './dto/create-library-book.dto';
import { UpdateLibraryBookDto } from './dto/update-library-book.dto';
import { Library } from '../generated/prisma-class/library';
import { PaginatedLibrariesDto } from './dto/paginated-libraries.dto';
import { PaginatedLibraryBooksDto } from './dto/paginated-library-books.dto';
import { PaginatedLibraryWorkspacesDto } from './dto/paginated-library-workspaces.dto';
import { PaginatedLibraryEventsDto } from './dto/paginated-library-events.dto';
import { LibraryBookDto } from './dto/library-book.dto';
import { WorkspaceResponseDto } from '../workspaces/dto/workspace-response.dto';
import { EventResponseDto } from '../events/dto/event-response.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import { EtagInterceptor } from '../common/etag.interceptor';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';

@ApiTags('Libraries')
@Controller('api/libraries')
@UsePipes(ApiValidationPipe)
@UseInterceptors(EtagInterceptor)
export class LibrariesApiController {
  constructor(private readonly librariesService: LibrariesService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить список библиотек с пагинацией' })
  @ApiOkResponse({ type: PaginatedLibrariesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  async findAll(
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.librariesService.findAllPaginated(query);
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      '/api/libraries',
      query,
      data,
      total,
    );
  }

  @Get(':id')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить библиотеку по id' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiOkResponse({ type: Library })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  findOne(@Param('id') id: string) {
    return this.librariesService.findOne(id);
  }

  @Get(':id/books')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить книги, доступные в библиотеке' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiOkResponse({ type: PaginatedLibraryBooksDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  async findBooks(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.librariesService.findBooksPaginated(
      id,
      query,
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/libraries/${id}/books`,
      query,
      data,
      total,
    );
  }

  @Get(':id/books/:bookId')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить конкретную связь библиотеки и книги' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiOkResponse({ type: LibraryBookDto })
  @ApiNotFoundResponse({ description: 'Связь не найдена' })
  findBook(@Param('id') id: string, @Param('bookId') bookId: string) {
    return this.librariesService.findBookRelation(id, bookId);
  }

  @Post(':id/books')
  @ApiOperation({ summary: 'Добавить книгу в библиотеку' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiCreatedResponse({ type: LibraryBookDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Библиотека или книга не найдены' })
  @ApiConflictResponse({ description: 'Книга уже добавлена в библиотеку' })
  createBook(@Param('id') id: string, @Body() dto: CreateLibraryBookDto) {
    return this.librariesService.addBook(id, dto);
  }

  @Patch(':id/books/:bookId')
  @ApiOperation({
    summary: 'Обновить количество экземпляров книги в библиотеке',
  })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiOkResponse({ type: LibraryBookDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Связь книги и библиотеки не найдена' })
  updateBook(
    @Param('id') id: string,
    @Param('bookId') bookId: string,
    @Body() dto: UpdateLibraryBookDto,
  ) {
    return this.librariesService.updateBookRelation(id, bookId, dto);
  }

  @Delete(':id/books/:bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Убрать книгу из библиотеки' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Книга убрана из библиотеки' })
  @ApiNotFoundResponse({ description: 'Связь книги и библиотеки не найдена' })
  async removeBook(@Param('id') id: string, @Param('bookId') bookId: string) {
    await this.librariesService.removeBook(id, bookId);
  }

  @Get(':id/workspaces')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить рабочие места библиотеки' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiOkResponse({ type: PaginatedLibraryWorkspacesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  async findWorkspaces(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.librariesService.findWorkspacesPaginated(
      id,
      query,
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/libraries/${id}/workspaces`,
      query,
      data,
      total,
    );
  }

  @Get(':id/workspaces/:workspaceId')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить конкретное рабочее место библиотеки' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiParam({ name: 'workspaceId', example: 'workspace-id' })
  @ApiOkResponse({ type: WorkspaceResponseDto })
  @ApiNotFoundResponse({ description: 'Рабочее место не найдено' })
  findWorkspace(
    @Param('id') id: string,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.librariesService.findWorkspaceRelation(id, workspaceId);
  }

  @Get(':id/events')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить мероприятия библиотеки' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiOkResponse({ type: PaginatedLibraryEventsDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  async findEvents(
    @Param('id') id: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.librariesService.findEventsPaginated(
      id,
      query,
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/libraries/${id}/events`,
      query,
      data,
      total,
    );
  }

  @Get(':id/events/:eventId')
  @Header('Cache-Control', 'public, max-age=3600')
  @ApiOperation({ summary: 'Получить конкретное мероприятие библиотеки' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiParam({ name: 'eventId', example: 'event-id' })
  @ApiOkResponse({ type: EventResponseDto })
  @ApiNotFoundResponse({ description: 'Мероприятие не найдено' })
  findEvent(@Param('id') id: string, @Param('eventId') eventId: string) {
    return this.librariesService.findEventRelation(id, eventId);
  }

  @Post()
  @ApiOperation({ summary: 'Создать библиотеку' })
  @ApiCreatedResponse({ type: Library })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  create(@Body() dto: CreateLibraryDto) {
    return this.librariesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить библиотеку' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiOkResponse({ type: Library })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  update(@Param('id') id: string, @Body() dto: UpdateLibraryDto) {
    return this.librariesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить библиотеку' })
  @ApiParam({ name: 'id', example: 'library-id' })
  @ApiNoContentResponse({ description: 'Библиотека удалена' })
  @ApiNotFoundResponse({ description: 'Библиотека не найдена' })
  async remove(@Param('id') id: string) {
    await this.librariesService.remove(id);
  }
}
