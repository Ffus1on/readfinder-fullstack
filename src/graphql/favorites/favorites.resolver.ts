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
import { FavoritesService } from '../../favorites/favorites.service';
import { BooksService } from '../../books/books.service';
import { UsersService } from '../../users/users.service';
import { DEMO_USER_ID } from '../../common/constants';
import { Favorite } from './favorite.object';
import { PaginatedFavorites } from './paginated-favorites.object';
import { Book } from '../books/book.object';
import { User } from '../users/user.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';

@Resolver(() => Favorite)
export class FavoritesResolver {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly booksService: BooksService,
    private readonly usersService: UsersService,
  ) {}

  @Query(() => PaginatedFavorites, {
    description: 'Пагинированный список избранных книг пользователя',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async favorites(
    @Args('userId', {
      type: () => ID,
      nullable: true,
      defaultValue: DEMO_USER_ID,
      description:
        'Идентификатор пользователя (по умолчанию — demo-пользователь)',
    })
    userId: string,
    @Args() args: PageArgs,
  ): Promise<PaginatedFavorites> {
    const { data, total } = await this.favoritesService.findAllPaginated(
      userId,
      args,
    );
    const user = data.length
      ? await this.usersService.findOne(userId)
      : undefined;
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
      defaultValue: DEMO_USER_ID,
      description:
        'Идентификатор пользователя (по умолчанию — demo-пользователь)',
    })
    userId: string,
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
  ): Promise<Favorite> {
    return this.favoritesService.findOne(userId, bookId);
  }

  @Mutation(() => Favorite, { description: 'Добавить книгу в избранное' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addToFavorites(
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
    @Args('userId', {
      type: () => ID,
      nullable: true,
      defaultValue: DEMO_USER_ID,
      description:
        'Идентификатор пользователя (по умолчанию — demo-пользователь)',
    })
    userId: string,
  ): Promise<Favorite> {
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
    @Args('userId', {
      type: () => ID,
      nullable: true,
      defaultValue: DEMO_USER_ID,
      description:
        'Идентификатор пользователя (по умолчанию — demo-пользователь)',
    })
    userId: string,
  ): Promise<boolean> {
    await this.favoritesService.remove(bookId, userId);
    return true;
  }

  @ResolveField(() => Book, { description: 'Избранная книга' })
  async book(@Parent() favorite: Favorite): Promise<Book> {
    if (favorite.book) return favorite.book;
    return this.booksService.findOne(favorite.bookId);
  }

  @ResolveField(() => User, { description: 'Пользователь' })
  async user(@Parent() favorite: Favorite): Promise<User> {
    if (favorite.user) return favorite.user;
    return this.usersService.findOne(favorite.userId);
  }
}
