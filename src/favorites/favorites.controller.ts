import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  Render,
  Redirect,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { requireUser, requireUserId, viewUser } from '../auth/auth-user';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiExcludeController()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @Render('favorites/index')
  async findAll(@Req() req: Request) {
    const user = requireUser(req);
    const favorites = await this.favoritesService.findAllEnriched(user.id);
    return {
      title: 'Избранные книги - ReadFinder',
      styles: ['/styles/template.css', '/styles/favorites.css'],
      user: viewUser(user),
      favorites,
    };
  }

  @Post()
  @Redirect()
  async create(@Body() dto: CreateFavoriteDto, @Req() req: Request) {
    await this.favoritesService.create(dto, requireUserId(req));
    return { url: '/favorites' };
  }

  @Delete(':bookId')
  @Redirect()
  async remove(@Param('bookId') bookId: string, @Req() req: Request) {
    await this.favoritesService.remove(bookId, requireUserId(req));
    return { url: '/favorites' };
  }
}
