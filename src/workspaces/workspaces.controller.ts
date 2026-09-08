import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, viewUser } from '../auth/auth-user';
import { PublicAccess } from '../auth/public.decorator';
import { toNumber } from '../common/utils';
import { WorkspacesService } from './workspaces.service';

@ApiExcludeController()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @PublicAccess()
  @Render('workspaces/index')
  async findAll(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const workspaces = await this.workspacesService.findAll();
    const pageSizeNum = Math.min(50, Math.max(1, toNumber(pageSize) ?? 10));
    let pageNum = Math.max(1, toNumber(page) ?? 1);

    const { data, total } = await this.workspacesService.findAllUsersPaginated(
      search,
      { page: pageNum, pageSize: pageSizeNum },
    );

    const totalPages = Math.max(1, Math.ceil(total / pageSizeNum));
    if (pageNum > totalPages) {
      pageNum = totalPages;
      const last = await this.workspacesService.findAllUsersPaginated(search, {
        page: pageNum,
        pageSize: pageSizeNum,
      });
      data.length = 0;
      data.push(...last.data);
    }

    const user = getUser(req);
    return {
      title: 'WorkSpaces - ReadFinder',
      styles: ['/styles/template.css', '/styles/workspaces.css'],
      user: viewUser(user),
      workspaces,
      users: data,
      search: search || '',
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        hasPages: totalPages > 1,
        prevPage: pageNum > 1 ? pageNum - 1 : 0,
        nextPage: pageNum < totalPages ? pageNum + 1 : 0,
        searchQuery: search ? encodeURIComponent(search) : '',
      },
    };
  }
}
