import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

@InputType({
  description: 'Данные для добавления книги в фонд библиотеки',
})
export class CreateLibraryBookInput {
  @Field(() => ID, { description: 'Идентификатор книги' })
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @Field(() => Int, {
    nullable: true,
    defaultValue: 1,
    description: 'Количество экземпляров',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}

@InputType({
  description: 'Данные для изменения записи фонда библиотеки',
})
export class UpdateLibraryBookInput {
  @Field(() => Int, { description: 'Количество экземпляров' })
  @IsInt()
  @Min(1)
  quantity: number;
}
