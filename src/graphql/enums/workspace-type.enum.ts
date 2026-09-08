import { WorkspaceType } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(WorkspaceType, {
  name: 'WorkspaceType',
  description: 'Тип рабочего места в библиотеке',
});
