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
  paginate,
} from '../common/pagination';

export const MAX_NAME_LENGTH = 50;

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

  async getUsersPage(query: PaginationDto): Promise<{
    data: Awaited<ReturnType<UsersService['findAllPaginated']>>['data'];
    pagination: PaginationView;
  }> {
    const first = await this.findAllPaginated(query);
    return {
      data: first.data,
      pagination: buildPaginationView(query, first.total),
    };
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
