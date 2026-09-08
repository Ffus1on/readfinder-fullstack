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
import { BookRatingService } from '../books/book-rating.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiExcludeController()
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly bookRatingService: BookRatingService,
  ) {}

  @Get()
  @Render('favorites/index')
  async findAll(@Req() req: Request) {
    const user = requireUser(req);
    const favorites = await this.favoritesService.findAll(user.id);
    const bookIds = favorites.map((f) => f.bookId);
    const ratings = await this.bookRatingService.getSummaries(bookIds);
    const enriched = favorites.map((f) => {
      const s = ratings.get(f.bookId) ?? { average: null, count: 0 };
      return {
        ...f,
        book: { ...f.book, rating: s.average, ratingCount: s.count },
      };
    });
    return {
      title: 'Избранные книги - ReadFinder',
      styles: ['/styles/template.css', '/styles/favorites.css'],
      user: viewUser(user),
      favorites: enriched,
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
