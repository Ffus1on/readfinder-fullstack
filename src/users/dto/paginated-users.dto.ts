import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../generated/prisma-class/user';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedUsersDto {
  @ApiProperty({ type: [User] })
  data: User[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
