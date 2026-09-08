import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

@InputType({ description: 'Данные для создания библиотеки' })
export class CreateLibraryInput {
  @Field(() => String, { description: 'Название библиотеки' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => String, { description: 'Адрес библиотеки' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @Field(() => Float, { nullable: true, description: 'Широта' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number | null;

  @Field(() => Float, { nullable: true, description: 'Долгота' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number | null;
}

@InputType({ description: 'Данные для обновления библиотеки' })
export class UpdateLibraryInput {
  @Field(() => String, { nullable: true, description: 'Название библиотеки' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field(() => String, { nullable: true, description: 'Адрес библиотеки' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @Field(() => Float, { nullable: true, description: 'Широта' })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number | null;

  @Field(() => Float, { nullable: true, description: 'Долгота' })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number | null;
}
