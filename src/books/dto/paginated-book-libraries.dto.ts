import { ApiProperty } from '@nestjs/swagger';
import { BookLibraryDto } from './book-library.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedBookLibrariesDto {
  @ApiProperty({ type: [BookLibraryDto] })
  data: BookLibraryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
