import { Controller, Get, Query, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { isAuthenticated } from './common/utils';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  async getIndex(@Query('auth') auth?: string) {
    const { recentFavorites, topBooks, libraries } =
      await this.appService.getIndexData();

    return {
      title: 'ReadFinder',
      styles: [
        '/styles/template.css',
        '/styles/index.css',
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
      ],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      recentFavorites: recentFavorites.map((f) => f.book),
      bookStats: topBooks.map((b) => ({
        title: b.title,
        author: b.author,
        pages: String(b.pages ?? ''),
        rating: String(b.rating ?? ''),
      })),
      libraries,
      scripts: [
        'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
        '/javascript/map.js',
      ],
    };
  }

  @Get('library-card')
  @Render('library-card')
  getLibraryCard(@Query('auth') auth?: string) {
    return {
      title: 'Читательский билет - ReadFinder',
      styles: ['/styles/template.css', '/styles/library-card.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
    };
  }
}
