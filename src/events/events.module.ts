import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsApiController } from './events-api.controller';
import { EventsUserApiController } from './events-user-api.controller';

@Module({
  controllers: [EventsController, EventsApiController, EventsUserApiController],
  providers: [EventsService],
})
export class EventsModule {}
