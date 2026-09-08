import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersApiController } from './users-api.controller';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersApiController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
