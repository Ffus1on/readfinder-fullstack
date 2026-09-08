import { ApiProperty } from '@nestjs/swagger';
import { LibraryBookDto } from './library-book.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedLibraryBooksDto {
  @ApiProperty({ type: [LibraryBookDto] })
  data: LibraryBookDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
