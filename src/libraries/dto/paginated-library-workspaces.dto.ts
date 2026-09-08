import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceResponseDto } from '../../workspaces/dto/workspace-response.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedLibraryWorkspacesDto {
  @ApiProperty({ type: [WorkspaceResponseDto] })
  data: WorkspaceResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
