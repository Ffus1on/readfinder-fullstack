import { Field, ObjectType } from '@nestjs/graphql';
import { Workspace } from './workspace.object';
import { PageMeta } from '../common/page-meta.object';

@ObjectType({ description: 'Пагинированный список рабочих мест' })
export class PaginatedWorkspaces {
  @Field(() => [Workspace], { description: 'Рабочие места на странице' })
  data: Workspace[];

  @Field(() => PageMeta, { description: 'Метаданные пагинации' })
  meta: PageMeta;
}
