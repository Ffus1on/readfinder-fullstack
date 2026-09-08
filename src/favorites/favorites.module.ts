import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesApiController } from './favorites-api.controller';
import { UsersModule } from '../users/users.module';
import { BooksModule } from '../books/books.module';

@Module({
  imports: [UsersModule, BooksModule],
  controllers: [FavoritesController, FavoritesApiController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
