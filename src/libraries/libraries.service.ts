import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { CreateLibraryBookDto } from './dto/create-library-book.dto';
import { UpdateLibraryBookDto } from './dto/update-library-book.dto';
import { toNumber, nullableNumber, rejectNullFields } from '../common/utils';
import { PaginationDto, resolvePagination } from '../common/pagination';

@Injectable()
export class LibrariesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.library.findMany();
  }

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.library.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.library.count(),
    ]);
    return { data, total };
  }

  async findOne(id: string) {
    const library = await this.prisma.library.findUnique({ where: { id } });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return library;
  }

  async findBooksByLibrary(libraryId: string) {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
      include: { libraryBooks: { include: { book: true } } },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return library.libraryBooks;
  }

  async findBooksPaginated(libraryId: string, query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [library, data, total] = await this.prisma.$transaction([
      this.prisma.library.findUnique({ where: { id: libraryId } }),
      this.prisma.libraryBook.findMany({
        where: { libraryId },
        include: { book: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { bookId: 'asc' },
      }),
      this.prisma.libraryBook.count({ where: { libraryId } }),
    ]);
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return { data, total };
  }

  async findBookRelation(libraryId: string, bookId: string) {
    const relation = await this.prisma.libraryBook.findUnique({
      where: { bookId_libraryId: { bookId, libraryId } },
      include: { book: true },
    });
    if (!relation)
      throw new NotFoundException('Связь книги и библиотеки не найдена');
    return relation;
  }

  async addBook(libraryId: string, dto: CreateLibraryBookDto) {
    const [library, book] = await this.prisma.$transaction([
      this.prisma.library.findUnique({ where: { id: libraryId } }),
      this.prisma.book.findUnique({ where: { id: dto.bookId } }),
    ]);
    if (!library) throw new NotFoundException('Библиотека не найдена');
    if (!book) throw new NotFoundException('Книга не найдена');
    const { count } = await this.prisma.libraryBook.createMany({
      data: { libraryId, bookId: dto.bookId, quantity: dto.quantity ?? 1 },
      skipDuplicates: true,
    });
    if (count === 0) throw new ConflictException('Книга уже есть в библиотеке');
    return this.prisma.libraryBook.findUniqueOrThrow({
      where: { bookId_libraryId: { bookId: dto.bookId, libraryId } },
      include: { book: true },
    });
  }

  async updateBookRelation(
    libraryId: string,
    bookId: string,
    dto: UpdateLibraryBookDto,
  ) {
    rejectNullFields(dto, ['quantity']);
    const relation = await this.prisma.libraryBook.findUnique({
      where: { bookId_libraryId: { bookId, libraryId } },
    });
    if (!relation)
      throw new NotFoundException('Связь книги и библиотеки не найдена');
    return this.prisma.libraryBook.update({
      where: { bookId_libraryId: { bookId, libraryId } },
      data: { quantity: dto.quantity },
      include: { book: true },
    });
  }

  async removeBook(libraryId: string, bookId: string) {
    try {
      return await this.prisma.libraryBook.delete({
        where: { bookId_libraryId: { bookId, libraryId } },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Связь книги и библиотеки не найдена');
      }
      throw error;
    }
  }

  async findWorkspacesByLibrary(libraryId: string) {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
      include: { workspaces: { include: { library: true } } },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return library.workspaces;
  }

  async findWorkspacesPaginated(libraryId: string, query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [library, data, total] = await this.prisma.$transaction([
      this.prisma.library.findUnique({ where: { id: libraryId } }),
      this.prisma.workspace.findMany({
        where: { libraryId },
        include: { library: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { type: 'asc' },
      }),
      this.prisma.workspace.count({ where: { libraryId } }),
    ]);
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return { data, total };
  }

  async findWorkspaceRelation(libraryId: string, workspaceId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, libraryId },
      include: { library: true },
    });
    if (!workspace) throw new NotFoundException('Рабочее место не найдено');
    return workspace;
  }

  async findEventsByLibrary(libraryId: string) {
    const library = await this.prisma.library.findUnique({
      where: { id: libraryId },
      include: { events: { include: { library: true, creator: true } } },
    });
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return library.events;
  }

  async findEventsPaginated(libraryId: string, query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [library, data, total] = await this.prisma.$transaction([
      this.prisma.library.findUnique({ where: { id: libraryId } }),
      this.prisma.libraryEvent.findMany({
        where: { libraryId },
        include: { library: true, creator: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { startTime: 'desc' },
      }),
      this.prisma.libraryEvent.count({ where: { libraryId } }),
    ]);
    if (!library) throw new NotFoundException('Библиотека не найдена');
    return { data, total };
  }

  async findEventRelation(libraryId: string, eventId: string) {
    const event = await this.prisma.libraryEvent.findFirst({
      where: { id: eventId, libraryId },
      include: { library: true, creator: true },
    });
    if (!event) throw new NotFoundException('Мероприятие не найдено');
    return event;
  }

  async create(dto: CreateLibraryDto) {
    return this.prisma.library.create({
      data: {
        name: this.requireText(dto.name, 'Название'),
        address: this.requireText(dto.address, 'Адрес'),
        lat: this.requireCoord(toNumber(dto.lat), 'Широта', -90, 90),
        lng: this.requireCoord(toNumber(dto.lng), 'Долгота', -180, 180),
      },
    });
  }

  async update(id: string, dto: UpdateLibraryDto) {
    rejectNullFields(dto, ['name', 'address']);
    try {
      return await this.prisma.library.update({
        where: { id },
        data: this.toData(dto),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Библиотека не найдена');
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.library.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Библиотека не найдена');
      }
      throw error;
    }
  }

  private toData(dto: UpdateLibraryDto) {
    return {
      name:
        dto.name === undefined
          ? undefined
          : this.requireText(dto.name, 'Название'),
      address:
        dto.address === undefined
          ? undefined
          : this.requireText(dto.address, 'Адрес'),
      lat: this.requireCoord(nullableNumber(dto.lat), 'Широта', -90, 90),
      lng: this.requireCoord(nullableNumber(dto.lng), 'Долгота', -180, 180),
    };
  }

  private requireText(value: string | null | undefined, label: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      throw new BadRequestException(`${label} не может быть пустым`);
    }
    return trimmed;
  }

  private requireCoord(
    value: number | null | undefined,
    label: string,
    min: number,
    max: number,
  ): number | null | undefined {
    if (value === null || value === undefined) return value;
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new BadRequestException(
        `${label} должна быть числом в диапазоне от ${min} до ${max}`,
      );
    }
    return value;
  }
}
