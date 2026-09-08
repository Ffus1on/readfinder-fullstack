import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { toNumber, nullableNumber, rejectNullFields } from '../common/utils';
import { PaginationDto, resolvePagination } from '../common/pagination';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

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
    return this.prisma.book.create({
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
  }

  async update(id: string, dto: UpdateBookDto) {
    rejectNullFields(dto, ['title', 'author']);
    try {
      return await this.prisma.book.update({
        where: { id },
        data: this.toData(dto),
      });
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
      return await this.prisma.book.delete({ where: { id } });
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
