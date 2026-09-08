import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { toNumber } from '../common/utils';

@Injectable()
export class LibrariesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.library.findMany();
  }

  async findOne(id: string) {
    return this.prisma.library.findUnique({ where: { id } });
  }

  async create(dto: CreateLibraryDto) {
    return this.prisma.library.create({
      data: {
        name: dto.name,
        address: dto.address,
        lat: toNumber(dto.lat),
        lng: toNumber(dto.lng),
      },
    });
  }

  async update(id: string, dto: UpdateLibraryDto) {
    return this.prisma.library.update({
      where: { id },
      data: this.toData(dto),
    });
  }

  async remove(id: string) {
    return this.prisma.library.delete({ where: { id } });
  }

  private toData(dto: UpdateLibraryDto) {
    return {
      name: dto.name,
      address: dto.address,
      lat: toNumber(dto.lat),
      lng: toNumber(dto.lng),
    };
  }
}
