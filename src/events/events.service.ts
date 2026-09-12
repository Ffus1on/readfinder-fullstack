import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { assertOwnerOrAdmin } from '../auth/ownership';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { assertDateRange } from './event-date.rule';
import { rejectNullFields } from '../common/utils';
import { PaginationDto, paginate } from '../common/pagination';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

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
    return paginate(
      query,
      () => this.prisma.libraryEvent.count(),
      (skip, take) =>
        this.prisma.libraryEvent.findMany({
          skip,
          take,
          include: { library: true, creator: true },
          orderBy: { startTime: 'desc' },
        }),
    );
  }

  async findOne(id: string) {
    const event = await this.prisma.libraryEvent.findUnique({
      where: { id },
      include: { library: true, creator: true },
    });
    if (!event) throw new NotFoundException('Мероприятие не найдено');
    return event;
  }

  async findOneForEdit(id: string, sessionUserId: string | undefined) {
    const event = await this.findOne(id);
    await assertOwnerOrAdmin(
      this.usersService,
      event.creatorId,
      sessionUserId,
      'Недостаточно прав для редактирования чужого мероприятия',
    );
    return event;
  }

  async findEventsByUserPaginated(
    userId: string,
    query: PaginationDto,
    sessionUserId?: string,
  ) {
    if (sessionUserId !== undefined) {
      await assertOwnerOrAdmin(
        this.usersService,
        userId,
        sessionUserId,
        'Недостаточно прав для просмотра чужих мероприятий',
      );
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return paginate(
      query,
      () => this.prisma.libraryEvent.count({ where: { creatorId: userId } }),
      (skip, take) =>
        this.prisma.libraryEvent.findMany({
          where: { creatorId: userId },
          include: { library: true, creator: true },
          orderBy: { startTime: 'desc' },
          skip,
          take,
        }),
    );
  }

  async findEventRelationForUser(
    userId: string,
    eventId: string,
    sessionUserId?: string,
  ) {
    if (sessionUserId !== undefined) {
      await assertOwnerOrAdmin(
        this.usersService,
        userId,
        sessionUserId,
        'Недостаточно прав для просмотра чужих мероприятий',
      );
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    const event = await this.prisma.libraryEvent.findFirst({
      where: { id: eventId, creatorId: userId },
      include: { library: true, creator: true },
    });
    if (!event) throw new NotFoundException('Мероприятие не найдено');
    return event;
  }

  async create(dto: CreateEventDto, creatorId: string) {
    const library = await this.prisma.library.findUnique({
      where: { id: dto.libraryId },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    const startTime = new Date(dto.startTime);
    const endTime = dto.endTime ? new Date(dto.endTime) : null;
    assertDateRange(startTime, endTime);
    return this.prisma.libraryEvent.create({
      data: {
        libraryId: dto.libraryId,
        title: this.requireText(dto.title, 'Название'),
        description: dto.description || undefined,
        startTime,
        endTime,
        creatorId,
      },
      include: { library: true, creator: true },
    });
  }

  async update(id: string, dto: UpdateEventDto, sessionUserId?: string) {
    rejectNullFields(dto, ['title', 'libraryId', 'startTime']);
    try {
      const existing = await this.findOne(id);
      if (sessionUserId !== undefined) {
        await assertOwnerOrAdmin(
          this.usersService,
          existing.creatorId,
          sessionUserId,
          'Недостаточно прав для изменения чужого мероприятия',
        );
      }
      const startTime = dto.startTime
        ? new Date(dto.startTime)
        : existing.startTime;
      const endTime =
        dto.endTime === undefined
          ? existing.endTime
          : dto.endTime
            ? new Date(dto.endTime)
            : null;
      assertDateRange(startTime, endTime);
      return await this.prisma.libraryEvent.update({
        where: { id },
        data: {
          libraryId: dto.libraryId,
          title:
            dto.title === undefined
              ? undefined
              : this.requireText(dto.title, 'Название'),
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

  private requireText(value: string | null | undefined, label: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      throw new BadRequestException(`${label} не может быть пустым`);
    }
    return trimmed;
  }
}
