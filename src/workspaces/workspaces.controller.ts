import { Controller, Get, Query, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { isAuthenticated, toNumber } from '../common/utils';

@ApiExcludeController()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @Render('workspaces/index')
  async findAll(
    @Query('auth') auth?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const [workspaces, usersPage] = await Promise.all([
      this.workspacesService.findAll(),
      this.workspacesService.getUsersPage(search, {
        page: toNumber(page),
        pageSize: toNumber(pageSize),
      }),
    ]);
    return {
      title: 'WorkSpaces - ReadFinder',
      styles: ['/styles/template.css', '/styles/workspaces.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      workspaces,
      users: usersPage.data,
      search: search || '',
      pagination: usersPage.pagination,
    };
  }
}
