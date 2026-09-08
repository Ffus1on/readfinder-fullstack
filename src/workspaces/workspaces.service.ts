import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { toNumber, rejectNullFields } from '../common/utils';
import { PaginationDto, resolvePagination } from '../common/pagination';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workspace.findMany({
      include: { library: true },
    });
  }

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.workspace.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { library: true },
        orderBy: { type: 'asc' },
      }),
      this.prisma.workspace.count(),
    ]);
    return { data, total };
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

  async setAvailability(id: string, isAvailable: boolean) {
    try {
      return await this.prisma.workspace.update({
        where: { id },
        data: { isAvailable },
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
    const { page, pageSize } = resolvePagination(query);
    const where: Prisma.UserWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total };
  }
}
