import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFavoriteDto {
  @ApiProperty({ example: 'book-id' })
  @IsString()
  @IsNotEmpty()
  bookId: string;
}
