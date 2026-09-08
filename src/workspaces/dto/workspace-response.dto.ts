import { IntersectionType, PickType } from '@nestjs/swagger';
import { Workspace } from '../../generated/prisma-class/workspace';
import { WorkspaceRelations } from '../../generated/prisma-class/workspace_relations';

export class WorkspaceResponseDto extends IntersectionType(
  Workspace,
  PickType(WorkspaceRelations, ['library'] as const),
) {}
