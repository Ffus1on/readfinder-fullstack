import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @ApiProperty({ example: 'Опасная игра бабули' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  @IsNotEmpty()
  author: string;

  @ApiPropertyOptional({
    example: 'Захватывающий детектив с неожиданной развязкой.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: '/files/pages/index/bookImage1.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pages?: number;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional({ enum: Category, example: Category.DETECTIVE })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;
}
