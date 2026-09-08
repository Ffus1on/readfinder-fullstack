import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { BooksApiController } from './books-api.controller';
import { SseService } from './sse.service';

@Module({
  controllers: [BooksController, BooksApiController],
  providers: [BooksService, SseService],
})
export class BooksModule {}
