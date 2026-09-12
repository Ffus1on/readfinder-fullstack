import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Request } from 'express';
import { getUser, viewUser } from '../auth/auth-user';
import { PublicAccess } from '../auth/public.decorator';
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
    const [workspaces, usersPage] = await Promise.all([
      this.workspacesService.findAll(),
      this.workspacesService.getUsersPage(search, {
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      }),
    ]);

    const user = getUser(req);
    return {
      title: 'WorkSpaces - ReadFinder',
      styles: ['/styles/template.css', '/styles/workspaces.css'],
      user: viewUser(user),
      workspaces,
      users: usersPage.data,
      search: search || '',
      pagination: usersPage.pagination,
    };
  }
}
