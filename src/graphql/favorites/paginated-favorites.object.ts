import { Field, ObjectType } from '@nestjs/graphql';
import { Favorite } from './favorite.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список избранных книг' })
export class PaginatedFavorites {
  @Field(() => [Favorite], { description: 'Избранные книги на странице' })
  data: Favorite[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
