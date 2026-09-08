import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { SseService } from './sse.service';

@Module({
  controllers: [BooksController],
  providers: [BooksService, SseService],
})
export class BooksModule {}
