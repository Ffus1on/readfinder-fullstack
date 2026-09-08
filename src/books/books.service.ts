import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { toNumber } from '../common/utils';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.book.findMany();
  }

  async findOne(id: string) {
    return this.prisma.book.findUnique({ where: { id } });
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
    const data = this.toData(dto);
    return this.prisma.book.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.book.delete({ where: { id } });
  }

  private toData(dto: UpdateBookDto) {
    return {
      title: dto.title,
      author: dto.author,
      description: dto.description || undefined,
      image: dto.image || undefined,
      pages: toNumber(dto.pages),
      rating: toNumber(dto.rating),
      category: dto.category || undefined,
    };
  }
}
