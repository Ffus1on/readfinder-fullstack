import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { toNumber, rejectNullFields } from '../common/utils';
import {
  PaginationDto,
  PaginationView,
  buildPaginationView,
  paginate,
} from '../common/pagination';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workspace.findMany({
      include: { library: true },
    });
  }

  async findAllPaginated(query: PaginationDto) {
    return paginate(
      query,
      () => this.prisma.workspace.count(),
      (skip, take) =>
        this.prisma.workspace.findMany({
          skip,
          take,
          include: { library: true },
          orderBy: { type: 'asc' },
        }),
    );
  }

  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: { library: true },
    });
    if (!workspace) throw new NotFoundException('Рабочее место не найдено');
    return workspace;
  }

  async create(dto: CreateWorkspaceDto) {
    const library = await this.prisma.library.findUnique({
      where: { id: dto.libraryId },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return this.prisma.workspace.create({
      data: {
        type: dto.type,
        capacity: toNumber(dto.capacity) ?? 1,
        isAvailable: dto.isAvailable ?? true,
        libraryId: dto.libraryId,
      },
      include: { library: true },
    });
  }

  async update(id: string, dto: UpdateWorkspaceDto) {
    rejectNullFields(dto, ['type', 'libraryId', 'isAvailable', 'capacity']);
    try {
      return await this.prisma.workspace.update({
        where: { id },
        data: {
          type: dto.type,
          capacity:
            dto.capacity === undefined ? undefined : toNumber(dto.capacity),
          isAvailable: dto.isAvailable,
          libraryId: dto.libraryId,
        },
        include: { library: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Рабочее место не найдено');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.workspace.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Рабочее место не найдено');
      }
      throw error;
    }
  }

  async findAllUsersPaginated(
    search: string | undefined,
    query: PaginationDto,
  ) {
    const where: Prisma.UserWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    return paginate(
      query,
      () => this.prisma.user.count({ where }),
      (skip, take) =>
        this.prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { name: 'asc' },
        }),
    );
  }

  async getUsersPage(
    search: string | undefined,
    query: PaginationDto,
  ): Promise<{
    data: Awaited<
      ReturnType<WorkspacesService['findAllUsersPaginated']>
    >['data'];
    pagination: PaginationView;
  }> {
    const first = await this.findAllUsersPaginated(search, query);
    return {
      data: first.data,
      pagination: buildPaginationView(query, first.total, search),
    };
  }
}
