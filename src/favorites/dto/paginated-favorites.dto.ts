import { ApiProperty } from '@nestjs/swagger';
import { FavoriteResponseDto } from './favorite-response.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedFavoritesDto {
  @ApiProperty({ type: [FavoriteResponseDto] })
  data: FavoriteResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
