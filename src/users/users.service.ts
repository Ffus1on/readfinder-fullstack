import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto, resolvePagination } from '../common/pagination';

export const MAX_NAME_LENGTH = 50;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return user;
  }

  async findByIdOrNull(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createWithId(id: string, data: { name: string; email: string }) {
    return this.prisma.user.create({
      data: {
        id,
        name: data.name,
        email: data.email,
      },
    });
  }

  async updateName(id: string, name: string) {
    return this.prisma.user.update({
      where: { id },
      data: { name },
    });
  }
}
