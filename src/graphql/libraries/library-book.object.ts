import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Book } from '../books/book.object';
import { Library } from './library.object';

@ObjectType({ description: 'Запись о наличии книги в библиотеке' })
export class LibraryBook {
  @Field(() => ID, { description: 'Идентификатор книги' })
  bookId: string;

  @Field(() => ID, { description: 'Идентификатор библиотеки' })
  libraryId: string;

  @Field(() => Int, { description: 'Количество экземпляров в библиотеке' })
  quantity: number;

  @Field(() => Book, { description: 'Книга' })
  book?: Book | undefined;

  @Field(() => Library, { description: 'Библиотека' })
  library?: Library | undefined;
}
