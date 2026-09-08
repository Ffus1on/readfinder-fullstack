import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { FavoritesService } from '../../favorites/favorites.service';
import { EventsService } from '../../events/events.service';
import { User } from './user.object';
import { PaginatedUsers } from './paginated-users.object';
import { PaginatedFavorites } from '../favorites/paginated-favorites.object';
import { PaginatedEvents } from '../events/paginated-events.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';
import { assertOwnerOrAdmin } from '../../auth/ownership';
import { Roles } from '../../auth/roles.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly favoritesService: FavoritesService,
    private readonly eventsService: EventsService,
  ) {}

  @Roles('admin')
  @Query(() => User, { description: 'Получить пользователя по идентификатору' })
  async user(
    @Args('id', { type: () => ID, description: 'Идентификатор пользователя' })
    id: string,
  ): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Roles('admin')
  @Query(() => PaginatedUsers, {
    description: 'Пагинированный список пользователей',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async users(@Args() args: PageArgs): Promise<PaginatedUsers> {
    const { data, total } = await this.usersService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @ResolveField(() => PaginatedFavorites, {
    description: 'Избранные книги пользователя',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async favorites(
    @Parent() user: User,
    @Args() args: PageArgs,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<PaginatedFavorites> {
    await assertOwnerOrAdmin(
      this.usersService,
      user.id,
      ctx.sessionUserId ?? ctx.req?.userId,
      'Недостаточно прав для просмотра чужого избранного',
    );
    const { data, total } = await this.favoritesService.findAllPaginated(
      user.id,
      args,
    );
    return {
      data: data.map((item) => ({ ...item, user })),
      meta: buildPageMeta(args, total),
    };
  }

  @ResolveField(() => PaginatedEvents, {
    description: 'Мероприятия, организованные пользователем',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async events(
    @Parent() user: User,
    @Args() args: PageArgs,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<PaginatedEvents> {
    await assertOwnerOrAdmin(
      this.usersService,
      user.id,
      ctx.sessionUserId ?? ctx.req?.userId,
      'Недостаточно прав для просмотра чужих мероприятий',
    );
    const { data, total } = await this.eventsService.findEventsByUserPaginated(
      user.id,
      args,
    );
    return { data, meta: buildPageMeta(args, total) };
  }
}
