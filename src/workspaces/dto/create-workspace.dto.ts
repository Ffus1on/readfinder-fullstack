import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkspaceType } from '@prisma/client';

export class CreateWorkspaceDto {
  @ApiProperty({ enum: WorkspaceType, example: WorkspaceType.individual })
  @IsEnum(WorkspaceType)
  type: WorkspaceType;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'library-id' })
  @IsString()
  @IsNotEmpty()
  libraryId: string;
}
