import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Render,
  Redirect,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { DEMO_USER_ID } from '../common/constants';
import { authSuffix, isAuthenticated } from '../common/utils';

@ApiExcludeController()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @Render('favorites/index')
  async findAll(@Query('auth') auth?: string) {
    const favorites = await this.favoritesService.findAll(DEMO_USER_ID);
    return {
      title: 'Избранные книги - ReadFinder',
      styles: ['/styles/template.css', '/styles/favorites.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      favorites,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateFavoriteDto, @Query('auth') auth?: string) {
    await this.favoritesService.create(dto, DEMO_USER_ID);
    return { url: `/favorites${authSuffix(auth)}` };
  }

  @Delete(':bookId')
  @Redirect()
  async remove(@Param('bookId') bookId: string, @Query('auth') auth?: string) {
    await this.favoritesService.remove(bookId, DEMO_USER_ID);
    return { url: `/favorites${authSuffix(auth)}` };
  }
}
