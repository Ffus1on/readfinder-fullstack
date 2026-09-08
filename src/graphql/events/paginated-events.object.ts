import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from './event.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список мероприятий' })
export class PaginatedEvents {
  @Field(() => [Event], { description: 'Мероприятия на странице' })
  data: Event[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
