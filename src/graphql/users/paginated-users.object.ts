import { Field, ObjectType } from '@nestjs/graphql';
import { User } from './user.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список пользователей' })
export class PaginatedUsers {
  @Field(() => [User], { description: 'Пользователи на странице' })
  data: User[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
