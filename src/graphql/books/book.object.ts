import { Category } from '@prisma/client';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { BookRatingSummary } from './book-rating-summary.object';

@ObjectType({ description: 'Книга в каталоге ReadFinder' })
export class Book {
  @Field(() => ID, { description: 'Идентификатор книги' })
  id: string;

  @Field(() => String, { description: 'Название книги' })
  title: string;

  @Field(() => String, { description: 'Автор книги' })
  author: string;

  @Field(() => String, { nullable: true, description: 'Описание книги' })
  description?: string | null;

  @Field(() => String, { nullable: true, description: 'Путь к обложке книги' })
  image?: string | null;

  @Field(() => Int, { nullable: true, description: 'Количество страниц' })
  pages?: number | null;

  @Field(() => BookRatingSummary, {
    nullable: true,
    description: 'Агрегированный рейтинг книги по оценкам пользователей',
  })
  rating?: BookRatingSummary | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Оценка текущего пользователя (1–10), если он вошёл',
  })
  myRating?: number | null;

  @Field(() => Category, { nullable: true, description: 'Жанр книги' })
  category?: Category | null;
}
