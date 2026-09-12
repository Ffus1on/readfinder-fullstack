import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, viewUser } from '../auth/auth-user';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from '../users/users.service';

@ApiExcludeController()
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  @Render('admin/users')
  async users(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const { data, pagination } = await this.usersService.getUsersPage({
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });

    const user = getUser(req);
    return {
      title: 'Пользователи - ReadFinder',
      styles: ['/styles/template.css', '/styles/admin.css'],
      user: viewUser(user),
      users: data,
      pagination,
    };
  }
}
