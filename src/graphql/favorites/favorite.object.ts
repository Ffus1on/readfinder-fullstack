import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLISODateTime } from '@nestjs/graphql';
import { Book } from '../books/book.object';
import { User } from '../users/user.object';

@ObjectType({ description: 'Избранная книга пользователя' })
export class Favorite {
  @Field(() => ID, { description: 'Идентификатор пользователя' })
  userId: string;

  @Field(() => ID, { description: 'Идентификатор книги' })
  bookId: string;

  @Field(() => GraphQLISODateTime, {
    description: 'Дата добавления в избранное',
  })
  createdAt: Date;

  @Field(() => Book, { description: 'Избранная книга' })
  book?: Book | undefined;

  @Field(() => User, { description: 'Пользователь' })
  user?: User | undefined;
}
