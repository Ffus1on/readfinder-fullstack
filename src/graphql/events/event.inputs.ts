import { Field, ID, InputType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType({ description: 'Данные для создания мероприятия' })
export class CreateEventInput {
  @Field(() => String, { description: 'Название мероприятия' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @Field(() => String, { nullable: true, description: 'Описание мероприятия' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => GraphQLISODateTime, { description: 'Дата и время начала' })
  startTime: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата и время окончания',
  })
  @IsOptional()
  endTime?: Date | null;

  @Field(() => ID, { description: 'Идентификатор библиотеки-площадки' })
  @IsString()
  @IsNotEmpty()
  libraryId: string;
}

@InputType({ description: 'Данные для обновления мероприятия' })
export class UpdateEventInput {
  @Field(() => String, { nullable: true, description: 'Название мероприятия' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field(() => String, { nullable: true, description: 'Описание мероприятия' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата и время начала',
  })
  @IsOptional()
  startTime?: Date | null;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата и время окончания',
  })
  @IsOptional()
  endTime?: Date | null;

  @Field(() => ID, { nullable: true, description: 'Идентификатор библиотеки' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  libraryId?: string;
}
