import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { DEMO_USER_ID } from '../common/constants';

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

  async findOne(id: string) {
    return this.prisma.libraryEvent.findUnique({
      where: { id },
      include: { library: true, creator: true },
    });
  }

  async create(dto: CreateEventDto) {
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
    return this.prisma.libraryEvent.update({
      where: { id },
      data: {
        libraryId: dto.libraryId,
        title: dto.title,
        description: dto.description || undefined,
        startTime: dto.startTime ? new Date(dto.startTime) : undefined,
        endTime: dto.endTime ? new Date(dto.endTime) : null,
      },
      include: { library: true, creator: true },
    });
  }

  async remove(id: string) {
    return this.prisma.libraryEvent.delete({ where: { id } });
  }
}
