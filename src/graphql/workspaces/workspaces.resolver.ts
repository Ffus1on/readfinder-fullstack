import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { WorkspacesService } from '../../workspaces/workspaces.service';
import { LibrariesService } from '../../libraries/libraries.service';
import { Workspace } from './workspace.object';
import { CreateWorkspaceInput, UpdateWorkspaceInput } from './workspace.inputs';
import { PaginatedWorkspaces } from './paginated-workspaces.object';
import { Library } from '../libraries/library.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';

@Resolver(() => Workspace)
export class WorkspacesResolver {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly librariesService: LibrariesService,
  ) {}

  @Query(() => Workspace, {
    description: 'Получить рабочее место по идентификатору',
  })
  async workspace(
    @Args('id', {
      type: () => ID,
      description: 'Идентификатор рабочего места',
    })
    id: string,
  ): Promise<Workspace> {
    return this.workspacesService.findOne(id);
  }

  @Query(() => PaginatedWorkspaces, {
    description: 'Пагинированный список рабочих мест',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async workspaces(@Args() args: PageArgs): Promise<PaginatedWorkspaces> {
    const { data, total } = await this.workspacesService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @Mutation(() => Workspace, { description: 'Создать рабочее место' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createWorkspace(
    @Args('input', { description: 'Данные для создания рабочего места' })
    input: CreateWorkspaceInput,
  ): Promise<Workspace> {
    return this.workspacesService.create(input);
  }

  @Mutation(() => Workspace, { description: 'Обновить рабочее место' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateWorkspace(
    @Args('id', {
      type: () => ID,
      description: 'Идентификатор рабочего места',
    })
    id: string,
    @Args('input', { description: 'Данные для обновления рабочего места' })
    input: UpdateWorkspaceInput,
  ): Promise<Workspace> {
    return this.workspacesService.update(id, input);
  }

  @Mutation(() => Workspace, {
    description: 'Отметить рабочее место как доступное',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async markWorkspaceAvailable(
    @Args('id', {
      type: () => ID,
      description: 'Идентификатор рабочего места',
    })
    id: string,
  ): Promise<Workspace> {
    return this.workspacesService.setAvailability(id, true);
  }

  @Mutation(() => Workspace, {
    description: 'Отметить рабочее место как недоступное',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async markWorkspaceUnavailable(
    @Args('id', {
      type: () => ID,
      description: 'Идентификатор рабочего места',
    })
    id: string,
  ): Promise<Workspace> {
    return this.workspacesService.setAvailability(id, false);
  }

  @Mutation(() => Boolean, { description: 'Удалить рабочее место' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteWorkspace(
    @Args('id', {
      type: () => ID,
      description: 'Идентификатор рабочего места',
    })
    id: string,
  ): Promise<boolean> {
    await this.workspacesService.remove(id);
    return true;
  }

  @ResolveField(() => Library, { description: 'Библиотека рабочего места' })
  async library(@Parent() workspace: Workspace): Promise<Library> {
    if (workspace.library) return workspace.library;
    return this.librariesService.findOne(workspace.libraryId);
  }
}
