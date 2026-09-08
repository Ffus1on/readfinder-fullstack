import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Библиотека' })
export class Library {
  @Field(() => ID, { description: 'Идентификатор библиотеки' })
  id: string;

  @Field(() => String, { description: 'Название библиотеки' })
  name: string;

  @Field(() => String, { description: 'Адрес библиотеки' })
  address: string;

  @Field(() => Float, { nullable: true, description: 'Широта' })
  lat?: number | null;

  @Field(() => Float, { nullable: true, description: 'Долгота' })
  lng?: number | null;
}
