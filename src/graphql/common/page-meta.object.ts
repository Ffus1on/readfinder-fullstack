import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Метаданные пагинации списка' })
export class PageMeta {
  @Field(() => Int, { description: 'Номер текущей страницы' })
  page: number;

  @Field(() => Int, { description: 'Размер страницы' })
  pageSize: number;

  @Field(() => Int, { description: 'Общее количество записей' })
  total: number;

  @Field(() => Int, { description: 'Общее количество страниц' })
  totalPages: number;
}
