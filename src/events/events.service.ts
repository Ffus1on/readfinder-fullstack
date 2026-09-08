import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DEMO_USER_ID } from '../common/constants';
import { rejectNullFields } from '../common/utils';
import { PaginationDto, resolvePagination } from '../common/pagination';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findLibraries() {
    return this.prisma.library.findMany();
  }

  async findAll() {
    return this.prisma.libraryEvent.findMany({
      include: { library: true, creator: true },
      orderBy: { startTime: 'desc' },
    });
  }

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.libraryEvent.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { library: true, creator: true },
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.libraryEvent.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const event = await this.prisma.libraryEvent.findUnique({
      where: { id },
      include: { library: true, creator: true },
    });
    if (!event) throw new NotFoundException('Мероприятие не найдено');
    return event;
  }

  async findEventsByUserPaginated(userId: string, query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [user, data, total] = await this.prisma.$transaction([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.libraryEvent.findMany({
        where: { creatorId: userId },
        include: { library: true, creator: true },
        orderBy: { startTime: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.libraryEvent.count({ where: { creatorId: userId } }),
    ]);
    if (!user) throw new NotFoundException('Пользователь не найден');
    return { data, total };
  }

  async findEventRelationForUser(userId: string, eventId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const event = await this.prisma.libraryEvent.findFirst({
      where: { id: eventId, creatorId: userId },
      include: { library: true, creator: true },
    });
    if (!event) throw new NotFoundException('Мероприятие не найдено');
    return event;
  }

  async create(dto: CreateEventDto) {
    const library = await this.prisma.library.findUnique({
      where: { id: dto.libraryId },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return this.prisma.libraryEvent.create({
      data: {
        libraryId: dto.libraryId,
        title: dto.title,
        description: dto.description || undefined,
        startTime: new Date(dto.startTime),
        endTime: dto.endTime ? new Date(dto.endTime) : null,
        creatorId: DEMO_USER_ID,
      },
      include: { library: true, creator: true },
    });
  }

  async update(id: string, dto: UpdateEventDto) {
    rejectNullFields(dto, ['title', 'libraryId', 'startTime']);
    try {
      return await this.prisma.libraryEvent.update({
        where: { id },
        data: {
          libraryId: dto.libraryId,
          title: dto.title,
          description:
            dto.description === undefined ? undefined : dto.description || null,
          startTime: dto.startTime ? new Date(dto.startTime) : undefined,
          endTime:
            dto.endTime === undefined
              ? undefined
              : dto.endTime
                ? new Date(dto.endTime)
                : null,
        },
        include: { library: true, creator: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Мероприятие не найдено');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.libraryEvent.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Мероприятие не найдено');
      }
      throw error;
    }
  }
}
