import { Controller, Get, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, viewUser } from './auth/auth-user';
import { PublicAccess } from './auth/public.decorator';
import { AppService } from './app.service';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @PublicAccess()
  @Render('index')
  async getIndex(@Req() req: Request) {
    const { recentFavorites, topBooks, libraries } =
      await this.appService.getIndexData();

    const user = getUser(req);
    return {
      title: 'ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/index.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      ],
      user: viewUser(user),
      recentFavorites: recentFavorites.map((f) => f.book),
      bookStats: topBooks.map((b) => ({
        title: b.title,
        author: b.author,
        pages: String(b.pages ?? ''),
        rating: String(b.average ?? ''),
      })),
      libraries,
      scripts: [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        '/javascript/map.js',
      ],
    };
  }

  @Get('library-card')
  @PublicAccess()
  @Render('library-card')
  getLibraryCard(@Req() req: Request) {
    const user = getUser(req);
    return {
      title: 'Читательский билет - ReadFinder',
      styles: ['/styles/template.css', '/styles/library-card.css'],
      user: viewUser(user),
    };
  }
}
