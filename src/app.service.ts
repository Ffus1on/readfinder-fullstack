import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getIndexData() {
    const recentFavorites = await this.prisma.favorite.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { book: true },
    });

    const topBooks = await this.prisma.book.findMany({
      orderBy: { rating: 'desc' },
      take: 3,
    });

    const libraries = await this.prisma.library.findMany();

    return { recentFavorites, topBooks, libraries };
  }
}
