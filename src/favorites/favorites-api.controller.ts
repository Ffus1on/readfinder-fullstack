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
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
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
import { UsersService } from '../users/users.service';
import { assertOwnerOrAdmin } from '../auth/ownership';
import { requireUserId } from '../auth/auth-user';

@ApiTags('Favorites')
@Controller('api/users/:userId/favorites')
@UsePipes(ApiValidationPipe)
export class FavoritesApiController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Получить избранные книги пользователя' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiOkResponse({ type: PaginatedFavoritesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
  @ApiNotFoundResponse({ description: 'Пользователь не найден' })
  async findAll(
    @Param('userId') userId: string,
    @Query() query: PaginationDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    await assertOwnerOrAdmin(
      this.usersService,
      userId,
      requireUserId(req),
      'Недостаточно прав для просмотра чужого избранного',
    );
    const { data, total } = await this.favoritesService.findAllPaginated(
      userId,
      query,
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
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  async findOne(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Req() req: Request,
  ) {
    await assertOwnerOrAdmin(
      this.usersService,
      userId,
      requireUserId(req),
      'Недостаточно прав для просмотра чужого избранного',
    );
    return this.favoritesService.findOne(userId, bookId);
  }

  @Post()
  @ApiCookieAuth('sessionAuth')
  @ApiOperation({ summary: 'Добавить книгу в избранное' })
  @ApiParam({ name: 'userId', example: 'user-id' })
  @ApiCreatedResponse({ type: FavoriteResponseDto })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Пользователь или книга не найдены' })
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateFavoriteDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    await assertOwnerOrAdmin(
      this.usersService,
      userId,
      requireUserId(req),
      'Недостаточно прав для изменения чужого избранного',
    );
    const { favorite, created } = await this.favoritesService.create(
      dto,
      userId,
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
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  async remove(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
    @Req() req: Request,
  ) {
    await assertOwnerOrAdmin(
      this.usersService,
      userId,
      requireUserId(req),
      'Недостаточно прав для изменения чужого избранного',
    );
    await this.favoritesService.remove(bookId, userId);
  }
}
