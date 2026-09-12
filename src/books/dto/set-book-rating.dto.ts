import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { RATING_ERROR, RATING_MAX, RATING_MIN } from '../book-rating.service';

export class SetBookRatingDto {
  @ApiProperty({ example: 8, description: 'Оценка книги от 1 до 10' })
  @Type(() => Number)
  @IsInt()
  @Min(RATING_MIN, { message: RATING_ERROR })
  @Max(RATING_MAX, { message: RATING_ERROR })
  value: number;
}
