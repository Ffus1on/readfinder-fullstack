import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
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
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { PaginatedFavoritesDto } from './dto/paginated-favorites.dto';
import { ApiValidationPipe } from '../common/api-validation.pipe';
import {
  buildOrigin,
  buildPaginatedResponse,
  PaginationDto,
} from '../common/pagination';
import { requireUserId } from '../auth/auth-user';

@ApiTags('Favorites')
@Controller('api/users/:userId/favorites')
@UsePipes(ApiValidationPipe)
export class FavoritesApiController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить избранные книги пользователя' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiOkResponse({ type: PaginatedFavoritesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для просмотра' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findAll(
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { data, total } = await this.favoritesService.findAllPaginated(
      userId,
      query,
      requireUserId(req),
    );
    return buildPaginatedResponse(
      res,
      buildOrigin(req),
      `/api/users/${userId}/favorites`,
      query,
      data,
      total,
    );
  }

  @Get(':bookId')
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить конкретную избранную книгу пользователя' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для просмотра' })
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  async findOne(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Req() req: Request,
  ) {
    return this.favoritesService.findOne(userId, bookId, requireUserId(req));
  }

  @Post()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Добавить книгу в избранное' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiCreatedResponse({ type: FavoriteResponseDto })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для изменения' })
  @ApiNotFoundResponse({ description: 'Пользователь или книга не найдены' })
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateFavoriteDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const { favorite, created } = await this.favoritesService.create(
      dto,
      userId,
      requireUserId(req),
    );
    if (!created) res.status(HttpStatus.OK);
    return favorite;
  }

  @Delete(':bookId')
  @ApiCookieAuth('sessionAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить книгу из избранного' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Книга удалена из избранного' })
  @ApiUnauthorizedResponse({ description: 'Требуется аутентификация' })
  @ApiForbiddenResponse({ description: 'Недостаточно прав для изменения' })
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  async remove(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Req() req: Request,
  ) {
    await this.favoritesService.remove(bookId, userId, requireUserId(req));
  }
}
