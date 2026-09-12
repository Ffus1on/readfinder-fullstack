import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import {
  RATING_ERROR,
  RATING_MAX,
  RATING_MIN,
} from '../../books/book-rating.service';

@InputType({ description: 'Оценка книги пользователем' })
export class RateBookInput {
  @Field(() => ID, { description: 'Идентификатор книги' })
  bookId: string;

  @Field(() => Int, { description: 'Оценка книги от 1 до 10' })
  @Type(() => Number)
  @IsInt()
  @Min(RATING_MIN, { message: RATING_ERROR })
  @Max(RATING_MAX, { message: RATING_ERROR })
  value: number;
}
