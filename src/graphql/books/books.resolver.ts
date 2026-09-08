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
import { BooksService } from '../../books/books.service';
import { Book } from './book.object';
import { CreateBookInput, UpdateBookInput } from './book.inputs';
import { PaginatedBooks } from './paginated-books.object';
import { PaginatedLibraryBooks } from '../libraries/paginated-library-books.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';

@Resolver(() => Book)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @Query(() => Book, { description: 'Получить книгу по идентификатору' })
  async book(
    @Args('id', { type: () => ID, description: 'Идентификатор книги' })
    id: string,
  ): Promise<Book> {
    return this.booksService.findOne(id);
  }

  @Query(() => PaginatedBooks, {
    description: 'Пагинированный список книг каталога',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async books(@Args() args: PageArgs): Promise<PaginatedBooks> {
    const { data, total } = await this.booksService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @Mutation(() => Book, { description: 'Создать книгу' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createBook(
    @Args('input', { description: 'Данные для создания книги' })
    input: CreateBookInput,
  ): Promise<Book> {
    return this.booksService.create(input);
  }

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

  @Mutation(() => Boolean, { description: 'Удалить книгу' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteBook(
    @Args('id', { type: () => ID, description: 'Идентификатор книги' })
    id: string,
  ): Promise<boolean> {
    await this.booksService.remove(id);
    return true;
  }

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
}
