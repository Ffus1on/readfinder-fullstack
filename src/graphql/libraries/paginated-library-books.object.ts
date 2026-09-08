import { Field, ObjectType } from '@nestjs/graphql';
import { LibraryBook } from './library-book.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список записей о наличии книг' })
export class PaginatedLibraryBooks {
  @Field(() => [LibraryBook], {
    description: 'Записи о наличии книг на странице',
  })
  data: LibraryBook[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
