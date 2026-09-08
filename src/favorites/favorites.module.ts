import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesApiController } from './favorites-api.controller';

@Module({
  controllers: [FavoritesController, FavoritesApiController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
