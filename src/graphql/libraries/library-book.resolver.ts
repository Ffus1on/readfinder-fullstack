import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { BooksService } from '../../books/books.service';
import { LibrariesService } from '../../libraries/libraries.service';
import { LibraryBook } from './library-book.object';
import { Book } from '../books/book.object';
import { Library } from './library.object';
import { PublicAccess } from '../../auth/public.decorator';

@Resolver(() => LibraryBook)
export class LibraryBookResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly librariesService: LibrariesService,
  ) {}

  @PublicAccess()
  @ResolveField(() => Book, { description: 'Книга' })
  async book(@Parent() libraryBook: LibraryBook): Promise<Book> {
    if (libraryBook.book) return libraryBook.book;
    return this.booksService.findOne(libraryBook.bookId);
  }

  @PublicAccess()
  @ResolveField(() => Library, { description: 'Библиотека' })
  async library(@Parent() libraryBook: LibraryBook): Promise<Library> {
    if (libraryBook.library) return libraryBook.library;
    return this.librariesService.findOne(libraryBook.libraryId);
  }
}
