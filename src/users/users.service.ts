import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, paginate } from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllPaginated(query: PaginationDto) {
    return paginate(
      query,
      () => this.prisma.user.count(),
      (skip, take) =>
        this.prisma.user.findMany({
          skip,
          take,
          orderBy: { name: 'asc' },
        }),
    );
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }
}
