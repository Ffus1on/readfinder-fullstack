import { Field, ObjectType } from '@nestjs/graphql';
import { Book } from './book.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список книг' })
export class PaginatedBooks {
  @Field(() => [Book], { description: 'Книги на странице' })
  data: Book[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
