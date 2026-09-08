import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'Мастер-класс по скорочтению' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Научитесь читать в 2 раза быстрее за один день!',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: '2026-08-15T14:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiPropertyOptional({ example: '2026-08-15T16:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  endTime?: string | null;

  @ApiProperty({ example: 'library-id' })
  @IsString()
  @IsNotEmpty()
  libraryId: string;
}
