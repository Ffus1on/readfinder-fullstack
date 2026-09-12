import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'Агрегированный рейтинг книги по оценкам пользователей',
})
export class BookRatingSummary {
  @Field(() => Float, {
    nullable: true,
    description: 'Средняя оценка (1–10) или null, если оценок нет',
  })
  average: number | null;

  @Field(() => Int, { description: 'Количество оценок' })
  count: number;
}
