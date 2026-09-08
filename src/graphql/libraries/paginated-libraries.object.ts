import { Field, ObjectType } from '@nestjs/graphql';
import { Library } from './library.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список библиотек' })
export class PaginatedLibraries {
  @Field(() => [Library], { description: 'Библиотеки на странице' })
  data: Library[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
