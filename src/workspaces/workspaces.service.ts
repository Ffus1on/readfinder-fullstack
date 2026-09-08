import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.workspace.findMany({
      include: { library: true },
    });
  }

  async findAllUsers(search?: string) {
    const where = search
      ? { name: { contains: search, mode: 'insensitive' as const } }
      : {};
    return this.prisma.user.findMany({ where, orderBy: { name: 'asc' } });
  }
}
