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

@ApiTags('Favorites')
@Controller('api/users/:userId/favorites')
@UsePipes(ApiValidationPipe)
export class FavoritesApiController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Получить избранные книги пользователя' })
  @ApiParam({ name: 'userId', example: 'demo-user-id' })
  @ApiOkResponse({ type: PaginatedFavoritesDto })
  @ApiBadRequestResponse({ description: 'Некорректные параметры пагинации' })
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
  @ApiOperation({ summary: 'Получить конкретную избранную книгу пользователя' })
  @ApiParam({ name: 'userId', example: 'demo-user-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  findOne(@Param('userId') userId: string, @Param('bookId') bookId: string) {
    return this.favoritesService.findOne(userId, bookId);
  }

  @Post()
  @ApiOperation({ summary: 'Добавить книгу в избранное' })
  @ApiParam({ name: 'userId', example: 'demo-user-id' })
  @ApiCreatedResponse({ type: FavoriteResponseDto })
  @ApiOkResponse({ type: FavoriteResponseDto })
  @ApiBadRequestResponse({ description: 'Некорректные данные' })
  @ApiNotFoundResponse({ description: 'Пользователь или книга не найдены' })
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateFavoriteDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { favorite, created } = await this.favoritesService.create(
      dto,
      userId,
    );
    if (!created) res.status(HttpStatus.OK);
    return favorite;
  }

  @Delete(':bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Удалить книгу из избранного' })
  @ApiParam({ name: 'userId', example: 'demo-user-id' })
  @ApiParam({ name: 'bookId', example: 'book-id' })
  @ApiNoContentResponse({ description: 'Книга удалена из избранного' })
  @ApiNotFoundResponse({
    description: 'Пользователь или избранная книга не найдены',
  })
  async remove(
    @Param('userId') userId: string,
    @Param('bookId') bookId: string,
  ) {
    await this.favoritesService.remove(bookId, userId);
  }
}
