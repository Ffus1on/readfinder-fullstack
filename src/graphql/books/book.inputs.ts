import { Category } from '@prisma/client';
import { Field, Float, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType({ description: 'Данные для создания книги' })
export class CreateBookInput {
  @Field(() => String, { description: 'Название книги' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { description: 'Автор книги' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @Field(() => String, { nullable: true, description: 'Описание книги' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true, description: 'Путь к обложке книги' })
  @IsOptional()
  @IsString()
  image?: string | null;

  @Field(() => Int, { nullable: true, description: 'Количество страниц' })
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number | null;

  @Field(() => Float, { nullable: true, description: 'Рейтинг книги (0–10)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number | null;

  @Field(() => Category, { nullable: true, description: 'Жанр книги' })
  @IsOptional()
  @IsEnum(Category)
  category?: Category | null;
}

@InputType({ description: 'Данные для обновления книги' })
export class UpdateBookInput {
  @Field(() => String, { nullable: true, description: 'Название книги' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field(() => String, { nullable: true, description: 'Автор книги' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author?: string;

  @Field(() => String, { nullable: true, description: 'Описание книги' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => String, { nullable: true, description: 'Путь к обложке книги' })
  @IsOptional()
  @IsString()
  image?: string | null;

  @Field(() => Int, { nullable: true, description: 'Количество страниц' })
  @IsOptional()
  @IsInt()
  @Min(1)
  pages?: number | null;

  @Field(() => Float, { nullable: true, description: 'Рейтинг книги (0–10)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number | null;

  @Field(() => Category, { nullable: true, description: 'Жанр книги' })
  @IsOptional()
  @IsEnum(Category)
  category?: Category | null;
}
