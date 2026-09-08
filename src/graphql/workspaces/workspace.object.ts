import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { WorkspaceType } from '@prisma/client';
import { Library } from '../libraries/library.object';

@ObjectType({ description: 'Рабочее место в библиотеке' })
export class Workspace {
  @Field(() => ID, { description: 'Идентификатор рабочего места' })
  id: string;

  @Field(() => ID, { description: 'Идентификатор библиотеки' })
  libraryId: string;

  @Field(() => WorkspaceType, { description: 'Тип рабочего места' })
  type: WorkspaceType;

  @Field(() => Int, { description: 'Вместимость (количество мест)' })
  capacity: number;

  @Field(() => Boolean, { description: 'Доступно ли рабочее место' })
  isAvailable: boolean;

  @Field(() => Library, { description: 'Библиотека рабочего места' })
  library?: Library | undefined;
}
