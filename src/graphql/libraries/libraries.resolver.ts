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
import { LibrariesService } from '../../libraries/libraries.service';
import { Library } from './library.object';
import { CreateLibraryInput, UpdateLibraryInput } from './library.inputs';
import { PaginatedLibraries } from './paginated-libraries.object';
import { PaginatedLibraryBooks } from './paginated-library-books.object';
import {
  CreateLibraryBookInput,
  UpdateLibraryBookInput,
} from './library-book.inputs';
import { LibraryBook } from './library-book.object';
import { PaginatedWorkspaces } from '../workspaces/paginated-workspaces.object';
import { PaginatedEvents } from '../events/paginated-events.object';
import { PageArgs } from '../common/page.args';
import { buildPageMeta } from '../common/page-meta.util';
import { listComplexity } from '../complexity';
import { PublicAccess } from '../../auth/public.decorator';
import { Roles } from '../../auth/roles.decorator';

@Resolver(() => Library)
export class LibrariesResolver {
  constructor(private readonly librariesService: LibrariesService) {}

  @PublicAccess()
  @Query(() => Library, {
    description: 'Получить библиотеку по идентификатору',
  })
  async library(
    @Args('id', { type: () => ID, description: 'Идентификатор библиотеки' })
    id: string,
  ): Promise<Library> {
    return this.librariesService.findOne(id);
  }

  @PublicAccess()
  @Query(() => PaginatedLibraries, {
    description: 'Пагинированный список библиотек',
    complexity: listComplexity(1),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async libraries(@Args() args: PageArgs): Promise<PaginatedLibraries> {
    const { data, total } = await this.librariesService.findAllPaginated(args);
    return { data, meta: buildPageMeta(args, total) };
  }

  @Roles('admin')
  @Mutation(() => Library, { description: 'Создать библиотеку' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createLibrary(
    @Args('input', { description: 'Данные для создания библиотеки' })
    input: CreateLibraryInput,
  ): Promise<Library> {
    return this.librariesService.create(input);
  }

  @Roles('admin')
  @Mutation(() => Library, { description: 'Обновить библиотеку' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLibrary(
    @Args('id', { type: () => ID, description: 'Идентификатор библиотеки' })
    id: string,
    @Args('input', { description: 'Данные для обновления библиотеки' })
    input: UpdateLibraryInput,
  ): Promise<Library> {
    return this.librariesService.update(id, input);
  }

  @Roles('admin')
  @Mutation(() => Boolean, { description: 'Удалить библиотеку' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteLibrary(
    @Args('id', { type: () => ID, description: 'Идентификатор библиотеки' })
    id: string,
  ): Promise<boolean> {
    await this.librariesService.remove(id);
    return true;
  }

  @Roles('admin')
  @Mutation(() => LibraryBook, {
    description: 'Добавить книгу в фонд библиотеки',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async addBookToLibrary(
    @Args('libraryId', {
      type: () => ID,
      description: 'Идентификатор библиотеки',
    })
    libraryId: string,
    @Args('input', {
      description: 'Данные для добавления книги в фонд библиотеки',
    })
    input: CreateLibraryBookInput,
  ): Promise<LibraryBook> {
    return this.librariesService.addBook(libraryId, input);
  }

  @Roles('admin')
  @Mutation(() => LibraryBook, {
    description: 'Изменить количество экземпляров книги в библиотеке',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateLibraryBook(
    @Args('libraryId', {
      type: () => ID,
      description: 'Идентификатор библиотеки',
    })
    libraryId: string,
    @Args('bookId', {
      type: () => ID,
      description: 'Идентификатор книги',
    })
    bookId: string,
    @Args('input', {
      description: 'Данные для изменения записи фонда библиотеки',
    })
    input: UpdateLibraryBookInput,
  ): Promise<LibraryBook> {
    return this.librariesService.updateBookRelation(libraryId, bookId, input);
  }

  @Roles('admin')
  @Mutation(() => Boolean, {
    description: 'Убрать книгу из фонда библиотеки',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async removeBookFromLibrary(
    @Args('libraryId', {
      type: () => ID,
      description: 'Идентификатор библиотеки',
    })
    libraryId: string,
    @Args('bookId', {
      type: () => ID,
      description: 'Идентификатор книги',
    })
    bookId: string,
  ): Promise<boolean> {
    await this.librariesService.removeBook(libraryId, bookId);
    return true;
  }

  @PublicAccess()
  @ResolveField(() => PaginatedLibraryBooks, {
    description: 'Книги в фонде библиотеки',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async libraryBooks(
    @Parent() library: Library,
    @Args() args: PageArgs,
  ): Promise<PaginatedLibraryBooks> {
    const { data, total } = await this.librariesService.findBooksPaginated(
      library.id,
      args,
    );
    return {
      data: data.map((item) => ({ ...item, library })),
      meta: buildPageMeta(args, total),
    };
  }

  @PublicAccess()
  @ResolveField(() => PaginatedWorkspaces, {
    description: 'Рабочие места библиотеки',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async workspaces(
    @Parent() library: Library,
    @Args() args: PageArgs,
  ): Promise<PaginatedWorkspaces> {
    const { data, total } = await this.librariesService.findWorkspacesPaginated(
      library.id,
      args,
    );
    return { data, meta: buildPageMeta(args, total) };
  }

  @PublicAccess()
  @ResolveField(() => PaginatedEvents, {
    description: 'Мероприятия библиотеки',
    complexity: listComplexity(5),
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async events(
    @Parent() library: Library,
    @Args() args: PageArgs,
  ): Promise<PaginatedEvents> {
    const { data, total } = await this.librariesService.findEventsPaginated(
      library.id,
      args,
    );
    return { data, meta: buildPageMeta(args, total) };
  }
}
