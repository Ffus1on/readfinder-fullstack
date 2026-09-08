import {
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  Args,
  Context,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { Request } from 'express';
import { BooksService } from '../../books/books.service';
import { BookRatingService } from '../../books/book-rating.service';
import { Book } from './book.object';
import { BookRatingSummary } from './book-rating-summary.object';
import { CreateBookInput, UpdateBookInput } from './book.inputs';
import { RateBookInput } from './rate-book.input';
import { PaginatedBooks } from './paginated-books.object';
import { PaginatedLibraryBooks } from '../libraries/paginated-library-books.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';
import { PublicAccess } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';

interface GraphqlContext {
  req?: Request & { userId?: string };
  sessionUserId?: string;
}

@Resolver(() => Book)
export class BooksResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly bookRatingService: BookRatingService,
  ) {}

  @PublicAccess()
  @Query(() => Book, { description: 'Получить книгу по идентификатору' })
  async book(
    @Args('id', { type: () => ID, description: 'Идентификатор книги' })
    id: string,
  ): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @PublicAccess()
  @Query(() => PaginatedBooks, {
    description: 'Пагинированный список книг каталога',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async books(@Args() args: PageArgs): Promise<PaginatedBooks> {
    const { data, total } = await this.booksService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @Roles('admin')
  @Mutation(() => Book, { description: 'Создать книгу' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBook(
    @Args('input', { description: 'Данные для создания книги' })
    input: CreateBookInput,
  ): Promise<Book> {
    return this.booksService.create(input);
  }

  @Roles('admin')
  @Mutation(() => Book, { description: 'Обновить книгу' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBook(
    @Args('id', { type: () => ID, description: 'Идентификатор книги' })
    id: string,
    @Args('input', { description: 'Данные для обновления книги' })
    input: UpdateBookInput,
  ): Promise<Book> {
    return this.booksService.update(id, input);
  }

  @Roles('admin')
  @Mutation(() => Boolean, { description: 'Удалить книгу' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBook(
    @Args('id', { type: () => ID, description: 'Идентификатор книги' })
    id: string,
  ): Promise<boolean> {
    await this.booksService.remove(id);
    return true;
  }

  @Mutation(() => BookRatingSummary, {
    description: 'Поставить или изменить свою оценку книги (0–10)',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async rateBook(
    @Args('input', { description: 'Оценка книги' })
    input: RateBookInput,
    @Context() ctx: GraphqlContext,
  ): Promise<BookRatingSummary> {
    const userId = this.sessionUserId(ctx);
    await this.bookRatingService.setRating(input.bookId, userId, input.value);
    return this.bookRatingService.getSummary(input.bookId);
  }

  @Mutation(() => BookRatingSummary, {
    description: 'Снять свою оценку книги',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeRating(
    @Args('bookId', { type: () => ID, description: 'Идентификатор книги' })
    bookId: string,
    @Context() ctx: GraphqlContext,
  ): Promise<BookRatingSummary> {
    const userId = this.sessionUserId(ctx);
    await this.bookRatingService.removeRating(bookId, userId);
    return this.bookRatingService.getSummary(bookId);
  }

  @PublicAccess()
  @ResolveField(() => BookRatingSummary, {
    description: 'Агрегированный рейтинг книги',
  })
  async rating(@Parent() book: Book): Promise<BookRatingSummary> {
    return this.bookRatingService.getSummary(book.id);
  }

  @PublicAccess()
  @ResolveField(() => Int, {
    nullable: true,
    description: 'Оценка текущего пользователя',
  })
  async myRating(
    @Parent() book: Book,
    @Context() ctx: GraphqlContext,
  ): Promise<number | null> {
    const userId = ctx.sessionUserId ?? ctx.req?.userId;
    if (!userId) return null;
    return this.bookRatingService.myRating(book.id, userId);
  }

  @PublicAccess()
  @ResolveField(() => PaginatedLibraryBooks, {
    description: 'Записи о наличии книги в библиотеках',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async libraryBooks(
    @Parent() book: Book,
    @Args() args: PageArgs,
  ): Promise<PaginatedLibraryBooks> {
    const { data, total } = await this.booksService.findLibrariesPaginated(
      book.id,
      args,
    );
    return {
      data: data.map((item) => ({ ...item, book })),
      meta: buildPageMeta(args, total),
    };
  }

  private sessionUserId(ctx: GraphqlContext): string {
    const userId = ctx.sessionUserId ?? ctx.req?.userId;
    if (!userId) {
      throw new UnauthorizedException('Выполните вход, чтобы оценить книгу');
    }
    return userId;
  }
}
