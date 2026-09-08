import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { DEMO_USER_ID } from '../common/constants';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string = DEMO_USER_ID) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateFavoriteDto, userId: string = DEMO_USER_ID) {
    return this.prisma.favorite.upsert({
      where: { userId_bookId: { userId, bookId: dto.bookId } },
      create: { userId, bookId: dto.bookId },
      update: {},
      include: { book: true },
    });
  }

  async remove(bookId: string, userId: string = DEMO_USER_ID) {
    return this.prisma.favorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }
}
