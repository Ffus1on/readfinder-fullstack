import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PageArgs {
  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'Номер страницы (начиная с 1)',
  })
  @Type(() => Number)
  @Min(1)
  page?: number;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 10,
    description: 'Размер страницы (1–50)',
  })
  @Type(() => Number)
  @Min(1)
  @Max(50)
  pageSize?: number;
}
