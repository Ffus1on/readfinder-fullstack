import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Render,
  Req,
  Res,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { requireUser, requireUserId, viewUser } from '../auth/auth-user';
import { MAX_NAME_LENGTH, UsersService } from './users.service';

@ApiExcludeController()
@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Render('profile')
  async profile(@Req() req: Request) {
    const user = requireUser(req);
    const { favoritesCount, eventsCount } =
      await this.usersService.getProfileStats(user.id);
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
      maxNameLength: MAX_NAME_LENGTH,
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
    try {
      await this.usersService.updateName(requireUserId(req), body.name ?? '');
    } catch (error) {
      if (error instanceof BadRequestException) {
        return res.redirect('/profile?error=name');
      }
      throw error;
    }
    return res.redirect('/profile?updated=1');
  }
}
