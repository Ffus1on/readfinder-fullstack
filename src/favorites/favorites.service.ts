import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { PaginationDto, resolvePagination } from '../common/pagination';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllPaginated(userId: string, query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [user, data, total] = await this.prisma.$transaction([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.favorite.findMany({
        where: { userId },
        include: { book: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ]);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return { data, total };
  }

  async findOne(userId: string, bookId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
      include: { book: true },
    });
    if (!favorite) throw new NotFoundException('Избранная книга не найдена');
    return favorite;
  }

  async create(dto: CreateFavoriteDto, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const book = await this.prisma.book.findUnique({
      where: { id: dto.bookId },
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    const { count } = await this.prisma.favorite.createMany({
      data: { userId, bookId: dto.bookId },
      skipDuplicates: true,
    });
    const favorite = await this.prisma.favorite.findUniqueOrThrow({
      where: { userId_bookId: { userId, bookId: dto.bookId } },
      include: { book: true },
    });
    return { favorite, created: count === 1 };
  }

  async remove(bookId: string, userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    if (!favorite) throw new NotFoundException('Избранная книга не найдена');
    return this.prisma.favorite.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }
}
