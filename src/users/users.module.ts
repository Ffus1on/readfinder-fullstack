import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersApiController } from './users-api.controller';

@Module({
  controllers: [UsersApiController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
