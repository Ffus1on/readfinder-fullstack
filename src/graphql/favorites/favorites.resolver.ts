import {
  ForbiddenException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import type { Request } from 'express';
import { FavoritesService } from '../../favorites/favorites.service';
import { BooksService } from '../../books/books.service';
import { UsersService } from '../../users/users.service';
import { PublicAccess } from '../../auth/public.decorator';
import { Favorite } from './favorite.object';
import { PaginatedFavorites } from './paginated-favorites.object';
import { Book } from '../books/book.object';
import { User } from '../users/user.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';

async function resolveUserId(
  explicit: string | undefined,
  ctx: {
    req?: Request & { userId?: string };
    sessionUserId?: string;
  },
  usersService: UsersService,
): Promise<string> {
  const sessionUserId = ctx.sessionUserId ?? ctx.req?.userId;
  if (!sessionUserId) {
    throw new UnauthorizedException(
      'Укажите userId или выполните вход в систему',
    );
  }
  const userId = explicit ?? sessionUserId;
  if (userId === sessionUserId) return userId;
  const user = await usersService.findByIdOrNull(sessionUserId);
  if (user?.role !== 'ADMIN') {
    throw new ForbiddenException(
      'Недостаточно прав для просмотра чужого избранного',
    );
  }
  return userId;
}

@Resolver(() => Favorite)
export class FavoritesResolver {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => PaginatedFavorites, {
    description:
      'Пагинированный список избранных книг (по умолчанию — текущий пользователь)',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async favorites(
    @Args('userId', {
      type: () => ID,
      nullable: true,
      description:
        'Идентификатор пользователя (по умолчанию — пользователь сессии; чужой — только для администратора)',
    })
    userId: string | undefined,
    @Args() args: PageArgs,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<PaginatedFavorites> {
    const uid = await resolveUserId(userId, ctx, this.usersService);
    const { data, total } = await this.favoritesService.findAllPaginated(
      uid,
      args,
    );
    const user = data.length ? await this.usersService.findOne(uid) : undefined;
    return {
      data: data.map((item) => ({ ...item, user })),
      meta: buildPageMeta(args, total),
    };
  }

  @Query(() => Favorite, {
    description: 'Получить избранную книгу пользователя',
  })
  async favorite(
    @Args('userId', {
      type: () => ID,
      nullable: true,
      description:
        'Идентификатор пользователя (по умолчанию — пользователь сессии; чужой — только для администратора)',
    })
    userId: string | undefined,
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<Favorite> {
    const uid = await resolveUserId(userId, ctx, this.usersService);
    return this.favoritesService.findOne(uid, bookId);
  }

  @Mutation(() => Favorite, { description: 'Добавить книгу в избранное' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addToFavorites(
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<Favorite> {
    const userId = await resolveUserId(undefined, ctx, this.usersService);
    const { favorite } = await this.favoritesService.create({ bookId }, userId);
    return favorite;
  }

  @Mutation(() => Boolean, {
    description: 'Убрать книгу из избранного',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeFromFavorites(
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
    @Context()
    ctx: {
      req?: Request & { userId?: string };
      sessionUserId?: string;
    },
  ): Promise<boolean> {
    const userId = await resolveUserId(undefined, ctx, this.usersService);
    await this.favoritesService.remove(bookId, userId);
    return true;
  }

  @PublicAccess()
  @ResolveField(() => Book, { description: 'Избранная книга' })
  async book(@Parent() favorite: Favorite): Promise<Book> {
    if (favorite.book) return favorite.book;
    return this.booksService.findOne(favorite.bookId);
  }

  @PublicAccess()
  @ResolveField(() => User, { description: 'Пользователь' })
  async user(@Parent() favorite: Favorite): Promise<User> {
    if (favorite.user) return favorite.user;
    return this.usersService.findOne(favorite.userId);
  }
}
