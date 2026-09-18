import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { toNumber, nullableNumber, rejectNullFields } from '../common/utils';
import {
  PaginationDto,
  clampPage,
  paginate,
  resolvePagination,
} from '../common/pagination';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private prisma: PrismaService,
    private readonly storage: StorageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(search?: string) {
    const where = this.searchWhere(search);
    return this.prisma.book.findMany({ where, orderBy: { title: 'asc' } });
  }

  private searchWhere(search?: string): Prisma.BookWhereInput {
    if (!search) return {};
    return {
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  async findAllPaginated(query: PaginationDto) {
    return paginate(
      query,
      () => this.prisma.book.count(),
      (skip, take) =>
        this.prisma.book.findMany({
          skip,
          take,
          orderBy: { title: 'asc' },
        }),
    );
  }

  async findAllPaginatedCached(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const total = await this.prisma.book.count();
    const current = clampPage(page, total, pageSize);
    const cacheKey = `books:list:${current}:${pageSize}`;

    const cached = await this.cacheManager.get<{
      data: Book[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const data = await this.prisma.book.findMany({
      skip: (current - 1) * pageSize,
      take: pageSize,
      orderBy: { title: 'asc' },
    });
    const result = { data, total };
    await this.cacheManager.set(cacheKey, result, 5000);
    return { ...result, cached: false };
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Книга не найдена');
    return book;
  }

  async findLibrariesByBook(bookId: string) {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      include: { libraryBooks: { include: { library: true } } },
    });
    if (!book) throw new NotFoundException('Книга не найдена');
    return book.libraryBooks;
  }

  async findLibrariesPaginated(bookId: string, query: PaginationDto) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Книга не найдена');
    return paginate(
      query,
      () => this.prisma.libraryBook.count({ where: { bookId } }),
      (skip, take) =>
        this.prisma.libraryBook.findMany({
          where: { bookId },
          include: { library: true },
          skip,
          take,
          orderBy: { libraryId: 'asc' },
        }),
    );
  }

  async findLibraryRelation(bookId: string, libraryId: string) {
    const relation = await this.prisma.libraryBook.findUnique({
      where: { bookId_libraryId: { bookId, libraryId } },
      include: { library: true },
    });
    if (!relation)
      throw new NotFoundException('Связь книги и библиотеки не найдена');
    return relation;
  }

  async create(dto: CreateBookDto) {
    const book = await this.prisma.book.create({
      data: {
        title: this.requireText(dto.title, 'Название'),
        author: this.requireText(dto.author, 'Автор'),
        description: dto.description || undefined,
        image: dto.image || undefined,
        pages: this.requirePages(toNumber(dto.pages)),
        category: dto.category || undefined,
      },
    });
    await this.clearBooksCache();
    return book;
  }

  async createWithImage(dto: CreateBookDto, file?: Express.Multer.File) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storage.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      return await this.create(dto);
    } catch (error) {
      if (uploadedUrl) {
        await this.storage.delete(uploadedUrl).catch(() => undefined);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateBookDto) {
    rejectNullFields(dto, ['title', 'author']);
    try {
      const existing = await this.prisma.book.findUnique({ where: { id } });
      const updated = await this.prisma.book.update({
        where: { id },
        data: this.toData(dto),
      });
      await this.clearBooksCache();
      if (existing?.image && existing.image !== updated.image) {
        await this.deleteImage(existing.image);
      }
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Книга не найдена');
      }
      throw error;
    }
  }

  async updateWithImage(
    id: string,
    dto: UpdateBookDto,
    file?: Express.Multer.File,
  ) {
    let uploadedUrl: string | undefined;
    if (file) {
      uploadedUrl = await this.storage.upload(file);
      dto.image = uploadedUrl;
    }
    try {
      return await this.update(id, dto);
    } catch (error) {
      if (uploadedUrl) {
        await this.storage.delete(uploadedUrl).catch(() => undefined);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const book = await this.prisma.book.delete({ where: { id } });
      await this.clearBooksCache();
      await this.deleteImage(book.image);
      return book;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Книга не найдена');
      }
      throw error;
    }
  }

  private async clearBooksCache(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.warn(
        `Не удалось сбросить серверный кэш: ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  async invalidateCache(): Promise<void> {
    await this.clearBooksCache();
  }

  private async deleteImage(image: string | null): Promise<void> {
    if (!image) return;
    try {
      await this.storage.delete(image);
    } catch (error) {
      this.logger.warn(
        `Не удалось удалить объект хранилища (${image}): ${
          error instanceof Error ? error.message : error
        }`,
      );
    }
  }

  private toData(dto: UpdateBookDto) {
    return {
      title:
        dto.title === undefined
          ? undefined
          : this.requireText(dto.title, 'Название'),
      author:
        dto.author === undefined
          ? undefined
          : this.requireText(dto.author, 'Автор'),
      description:
        dto.description === undefined ? undefined : dto.description || null,
      image: dto.image === undefined ? undefined : dto.image || null,
      pages: this.requirePages(nullableNumber(dto.pages)),
      category: dto.category === undefined ? undefined : dto.category || null,
    };
  }

  private requireText(value: string | null | undefined, label: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) {
      throw new BadRequestException(`${label} не может быть пустым`);
    }
    return trimmed;
  }

  private requirePages(
    value: number | null | undefined,
  ): number | null | undefined {
    if (value === null || value === undefined) return value;
    if (!Number.isInteger(value) || value < 1) {
      throw new BadRequestException(
        'Количество страниц должно быть целым числом не меньше 1',
      );
    }
    return value;
  }
}
