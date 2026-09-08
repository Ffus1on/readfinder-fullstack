import { BadRequestException, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { EventsService } from '../../events/events.service';
import { LibrariesService } from '../../libraries/libraries.service';
import { UsersService } from '../../users/users.service';
import { Event } from './event.object';
import { CreateEventInput, UpdateEventInput } from './event.inputs';
import { PaginatedEvents } from './paginated-events.object';
import { Library } from '../libraries/library.object';
import { User } from '../users/user.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';
import { PublicAccess } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';
import { assertOwnerOrAdmin } from '../../auth/ownership';
import { requireSessionUserId } from '../../auth/auth-user';
import type { Request } from 'express';

@Resolver(() => Event)
export class EventsResolver {
  constructor(
    private readonly eventsService: EventsService,
    private readonly librariesService: LibrariesService,
    private readonly usersService: UsersService,
  ) {}

  @PublicAccess()
  @Query(() => Event, { description: 'Получить мероприятие по идентификатору' })
  async event(
    @Args('id', { type: () => ID, description: 'Идентификатор мероприятия' })
    id: string,
  ): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @PublicAccess()
  @Query(() => PaginatedEvents, {
    description: 'Пагинированный список мероприятий',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async events(@Args() args: PageArgs): Promise<PaginatedEvents> {
    const { data, total } = await this.eventsService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @Mutation(() => Event, { description: 'Создать мероприятие' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(
    @Args('input', { description: 'Данные для создания мероприятия' })
    input: CreateEventInput,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<Event> {
    return this.eventsService.create(
      {
        ...input,
        startTime: input.startTime.toISOString(),
        endTime: input.endTime ? input.endTime.toISOString() : undefined,
      },
      requireSessionUserId(ctx),
    );
  }

  @Mutation(() => Event, { description: 'Обновить мероприятие' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateEvent(
    @Args('id', { type: () => ID, description: 'Идентификатор мероприятия' })
    id: string,
    @Args('input', { description: 'Данные для обновления мероприятия' })
    input: UpdateEventInput,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<Event> {
    if (input.startTime === null) {
      throw new BadRequestException('Поле startTime не может быть null');
    }
    const event = await this.eventsService.findOne(id);
    await assertOwnerOrAdmin(
      this.usersService,
      event.creatorId,
      ctx.sessionUserId ?? ctx.req?.userId,
      'Недостаточно прав для изменения чужого мероприятия',
    );
    return this.eventsService.update(id, {
      ...input,
      startTime: input.startTime ? input.startTime.toISOString() : undefined,
      endTime:
        input.endTime === undefined
          ? undefined
          : input.endTime === null
            ? null
            : input.endTime.toISOString(),
    });
  }

  @Roles('admin')
  @Mutation(() => Boolean, { description: 'Удалить мероприятие' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteEvent(
    @Args('id', { type: () => ID, description: 'Идентификатор мероприятия' })
    id: string,
  ): Promise<boolean> {
    await this.eventsService.remove(id);
    return true;
  }

  @PublicAccess()
  @ResolveField(() => Library, { description: 'Библиотека-площадка' })
  async library(@Parent() event: Event): Promise<Library> {
    if (event.library) return event.library;
    return this.librariesService.findOne(event.libraryId);
  }

  @PublicAccess()
  @ResolveField(() => User, { description: 'Организатор мероприятия' })
  async creator(@Parent() event: Event): Promise<User> {
    if (event.creator) return event.creator;
    return this.usersService.findOne(event.creatorId);
  }
}
