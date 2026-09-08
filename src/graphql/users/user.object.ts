import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType({ description: 'Пользователь ReadFinder' })
export class User {
  @Field(() => ID, { description: 'Идентификатор пользователя' })
  id: string;

  @Field(() => String, { description: 'Имя пользователя' })
  name: string;

  @Field(() => String, { description: 'Электронная почта пользователя' })
  email: string;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата регистрации пользователя',
  })
  createdAt: Date;
}
