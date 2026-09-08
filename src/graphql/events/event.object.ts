import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Library } from '../libraries/library.object';
import { User } from '../users/user.object';

@ObjectType({ description: 'Мероприятие в библиотеке' })
export class Event {
  @Field(() => ID, { description: 'Идентификатор мероприятия' })
  id: string;

  @Field(() => ID, { description: 'Идентификатор библиотеки' })
  libraryId: string;

  @Field(() => String, { description: 'Название мероприятия' })
  title: string;

  @Field(() => String, { nullable: true, description: 'Описание мероприятия' })
  description?: string | null;

  @Field(() => GraphQLISODateTime, { description: 'Дата и время начала' })
  startTime: Date;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата и время окончания',
  })
  endTime?: Date | null;

  @Field(() => ID, { description: 'Идентификатор организатора' })
  creatorId: string;

  @Field(() => Library, { description: 'Библиотека-площадка' })
  library?: Library | undefined;

  @Field(() => User, { description: 'Организатор мероприятия' })
  creator?: User | undefined;
}
