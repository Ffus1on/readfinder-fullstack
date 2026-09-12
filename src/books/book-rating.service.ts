import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';

export const RATING_MIN = 1;
export const RATING_MAX = 10;
export const RATING_ERROR = 'Оценка книги должна быть от 1 до 10';

export interface BookRatingSummary {
  average: number | null;
  count: number;
}

@Injectable()
export class BookRatingService {
  constructor(
    private prisma: PrismaService,
    private readonly booksService: BooksService,
  ) {}

  private assertValue(value: number): void {
    if (value < RATING_MIN || value > RATING_MAX) {
      throw new BadRequestException(RATING_ERROR);
    }
  }

  private async requireBook(bookId: string): Promise<void> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Книга не найдена');
  }

  async setRating(bookId: string, userId: string, value: number) {
    this.assertValue(value);
    await this.requireBook(bookId);
    await this.prisma.bookRating.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId, value },
      update: { value },
    });
    await this.booksService.invalidateCache();
  }

  async removeRating(bookId: string, userId: string) {
    await this.prisma.bookRating
      .delete({ where: { userId_bookId: { userId, bookId } } })
      .catch(() => undefined);
    await this.booksService.invalidateCache();
  }

  async myRating(bookId: string, userId: string): Promise<number | null> {
    const rating = await this.prisma.bookRating.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { value: true },
    });
    return rating?.value ?? null;
  }

  async getSummary(bookId: string): Promise<BookRatingSummary> {
    const agg = await this.prisma.bookRating.aggregate({
      where: { bookId },
      _avg: { value: true },
      _count: { value: true },
    });
    return {
      average: agg._avg.value,
      count: agg._count.value,
    };
  }

  async getSummaries(
    bookIds: string[],
  ): Promise<Map<string, BookRatingSummary>> {
    if (bookIds.length === 0) return new Map();
    const rows = await this.prisma.bookRating.groupBy({
      by: ['bookId'],
      where: { bookId: { in: bookIds } },
      _avg: { value: true },
      _count: { value: true },
    });
    const map = new Map<string, BookRatingSummary>();
    for (const row of rows) {
      map.set(row.bookId, { average: row._avg.value, count: row._count.value });
    }
    return map;
  }

  async withRatingSummaries<T extends { id: string }>(
    books: T[],
  ): Promise<(T & { rating: number | null; ratingCount: number })[]> {
    const summaries = await this.getSummaries(books.map((b) => b.id));
    return books.map((b) => {
      const s = summaries.get(b.id) ?? { average: null, count: 0 };
      return { ...b, rating: s.average, ratingCount: s.count };
    });
  }
}
