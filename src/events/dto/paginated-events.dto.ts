import { ApiProperty } from '@nestjs/swagger';
import { EventResponseDto } from './event-response.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedEventsDto {
  @ApiProperty({ type: [EventResponseDto] })
  data: EventResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
