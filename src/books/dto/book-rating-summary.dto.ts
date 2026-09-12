import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookRatingSummaryDto {
  @ApiPropertyOptional({
    example: 8.4,
    description: 'Средняя оценка (1–10) или null, если оценок нет',
  })
  average: number | null;

  @ApiProperty({ example: 12, description: 'Количество оценок' })
  count: number;
}
