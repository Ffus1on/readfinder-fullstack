import { Body, Controller, Get, Patch, Render, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { requireUser, requireUserId, viewUser } from '../auth/auth-user';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService, MAX_NAME_LENGTH } from './users.service';

@ApiExcludeController()
@Controller('profile')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @Render('profile')
  async profile(@Req() req: Request) {
    const user = requireUser(req);
    const [favoritesCount, eventsCount] = await Promise.all([
      this.prisma.favorite.count({ where: { userId: user.id } }),
      this.prisma.libraryEvent.count({ where: { creatorId: user.id } }),
    ]);
    return {
      title: 'Профиль - ReadFinder',
      styles: ['/styles/template.css', '/styles/profile.css'],
      user: viewUser(user),
      profile: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      favoritesCount,
      eventsCount,
      error: typeof req.query.error === 'string' ? req.query.error : '',
      updated: typeof req.query.updated === 'string' ? req.query.updated : '',
    };
  }

  @Patch()
  async updateName(
    @Body() body: { name?: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const name = body.name?.trim() || '';
    if (!name || name.length > MAX_NAME_LENGTH) {
      return res.redirect('/profile?error=name');
    }
    await this.usersService.updateName(requireUserId(req), name);
    return res.redirect('/profile?updated=1');
  }
}
