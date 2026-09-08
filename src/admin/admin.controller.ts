import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, viewUser } from '../auth/auth-user';
import { Roles } from '../auth/roles.decorator';
import { toNumber } from '../common/utils';
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
    const pageSizeNum = Math.min(50, Math.max(1, toNumber(pageSize) ?? 10));
    let pageNum = Math.max(1, toNumber(page) ?? 1);

    const { data, total } = await this.usersService.findAllPaginated({
      page: pageNum,
      pageSize: pageSizeNum,
    });

    const totalPages = Math.max(1, Math.ceil(total / pageSizeNum));
    if (pageNum > totalPages) {
      pageNum = totalPages;
      const last = await this.usersService.findAllPaginated({
        page: pageNum,
        pageSize: pageSizeNum,
      });
      data.length = 0;
      data.push(...last.data);
    }

    const user = getUser(req);
    return {
      title: 'Пользователи - ReadFinder',
      styles: ['/styles/template.css', '/styles/admin.css'],
      user: viewUser(user),
      users: data,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        hasPages: totalPages > 1,
        prevPage: pageNum > 1 ? pageNum - 1 : 0,
        nextPage: pageNum < totalPages ? pageNum + 1 : 0,
        searchQuery: '',
      },
    };
  }
}
