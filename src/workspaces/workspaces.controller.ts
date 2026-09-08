import { Controller, Get, Query, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { isAuthenticated } from '../common/utils';

@ApiExcludeController()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  @Render('workspaces/index')
  async findAll(
    @Query('auth') auth?: string,
    @Query('search') search?: string,
  ) {
    const workspaces = await this.workspacesService.findAll();
    const users = await this.workspacesService.findAllUsers(search);
    return {
      title: 'WorkSpaces - ReadFinder',
      styles: ['/styles/template.css', '/styles/workspaces.css'],
      user: isAuthenticated(auth) ? { name: 'Даниил' } : null,
      workspaces,
      users,
      search: search || '',
    };
  }
}
