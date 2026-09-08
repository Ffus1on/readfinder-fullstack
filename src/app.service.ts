import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { BookRatingService } from './books/book-rating.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private readonly bookRatingService: BookRatingService,
  ) {}

  async getIndexData() {
    const recentFavorites = await this.prisma.favorite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { book: true },
    });

    const allBooks = await this.prisma.book.findMany();
    const summaries = await this.bookRatingService.getSummaries(
      allBooks.map((b) => b.id),
    );
    const topBooks = allBooks
      .map((b) => ({
        ...b,
        average: summaries.get(b.id)?.average ?? null,
      }))
      .filter((b) => b.average !== null)
      .sort((a, b) => (b.average as number) - (a.average as number))
      .slice(0, 3);

    const libraries = await this.prisma.library.findMany();

    return { recentFavorites, topBooks, libraries };
  }
}
