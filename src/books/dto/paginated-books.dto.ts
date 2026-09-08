import { ApiProperty } from '@nestjs/swagger';
import { Book } from '../../generated/prisma-class/book';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedBooksDto {
  @ApiProperty({ type: [Book] })
  data: Book[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
