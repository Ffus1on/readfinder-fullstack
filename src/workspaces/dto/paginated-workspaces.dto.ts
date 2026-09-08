import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceResponseDto } from './workspace-response.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedWorkspacesDto {
  @ApiProperty({ type: [WorkspaceResponseDto] })
  data: WorkspaceResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
