import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Book, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { toNumber, nullableNumber, rejectNullFields } from '../common/utils';
import { PaginationDto, resolvePagination } from '../common/pagination';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    private prisma: PrismaService,
    private readonly storage: StorageService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll() {
    return this.prisma.book.findMany();
  }

  async findAllPaginated(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const [data, total] = await this.prisma.$transaction([
      this.prisma.book.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { title: 'asc' },
      }),
      this.prisma.book.count(),
    ]);
    return { data, total };
  }

  async findAllPaginatedCached(query: PaginationDto) {
    const { page, pageSize } = resolvePagination(query);
    const cacheKey = `books:list:${page}:${pageSize}`;

    const cached = await this.cacheManager.get<{
      data: Book[];
      total: number;
    }>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    const result = await this.findAllPaginated(query);
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
    const { page, pageSize } = resolvePagination(query);
    const [book, data, total] = await this.prisma.$transaction([
      this.prisma.book.findUnique({ where: { id: bookId } }),
      this.prisma.libraryBook.findMany({
        where: { bookId },
        include: { library: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { libraryId: 'asc' },
      }),
      this.prisma.libraryBook.count({ where: { bookId } }),
    ]);
    if (!book) throw new NotFoundException('Книга не найдена');
    return { data, total };
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
        title: dto.title,
        author: dto.author,
        description: dto.description || undefined,
        image: dto.image || undefined,
        pages: toNumber(dto.pages),
        rating: toNumber(dto.rating),
        category: dto.category || undefined,
      },
    });
    await this.clearBooksCache();
    return book;
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
      title: dto.title,
      author: dto.author,
      description:
        dto.description === undefined ? undefined : dto.description || null,
      image: dto.image === undefined ? undefined : dto.image || null,
      pages: nullableNumber(dto.pages),
      rating: nullableNumber(dto.rating),
      category: dto.category === undefined ? undefined : dto.category || null,
    };
  }
}
