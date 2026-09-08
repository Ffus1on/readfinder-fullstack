import { Category } from '@prisma/client';
import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

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

  @Field(() => Float, { nullable: true, description: 'Рейтинг книги (0–10)' })
  rating?: number | null;

  @Field(() => Category, { nullable: true, description: 'Жанр книги' })
  category?: Category | null;
}
