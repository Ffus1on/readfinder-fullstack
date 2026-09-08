import { ApiProperty } from '@nestjs/swagger';
import { EventResponseDto } from '../../events/dto/event-response.dto';
import { PaginationMetaDto } from '../../common/pagination';

export class PaginatedLibraryEventsDto {
  @ApiProperty({ type: [EventResponseDto] })
  data: EventResponseDto[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
