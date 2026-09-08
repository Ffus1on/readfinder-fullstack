import { ApiProperty } from '@nestjs/swagger';
import { Library } from '../../generated/prisma-class/library';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedLibrariesDto {
  @ApiProperty({ type: [Library] })
  data: Library[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
