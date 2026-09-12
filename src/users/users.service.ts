import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationDto,
  PaginationView,
  buildPaginationView,
  resolvePage,
} from '../common/pagination';

export const MAX_NAME_LENGTH = 50;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePage(query);
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

  async getUsersPage(query: PaginationDto): Promise<{
    data: Awaited<ReturnType<UsersService['findAllPaginated']>>['data'];
    pagination: PaginationView;
  }> {
    const { page, pageSize } = resolvePage(query);
    const first = await this.findAllPaginated({ page, pageSize });
    const pagination = buildPaginationView(query, first.total);

    if (pagination.page === page) {
      return { data: first.data, pagination };
    }

    const last = await this.findAllPaginated({
      page: pagination.page,
      pageSize,
    });
    return { data: last.data, pagination };
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
    const trimmed = name?.trim() || '';
    if (!trimmed || trimmed.length > MAX_NAME_LENGTH) {
      throw new BadRequestException('Некорректное имя');
    }
    return this.prisma.user.update({
      where: { id },
      data: { name: trimmed },
    });
  }

  async getProfileStats(userId: string) {
    const [favoritesCount, eventsCount] = await Promise.all([
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.libraryEvent.count({ where: { creatorId: userId } }),
    ]);
    return { favoritesCount, eventsCount };
  }
}
