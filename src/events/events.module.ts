import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsApiController } from './events-api.controller';
import { EventsUserApiController } from './events-user-api.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [EventsController, EventsApiController, EventsUserApiController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
