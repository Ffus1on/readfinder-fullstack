import { Module } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesApiController } from './workspaces-api.controller';

@Module({
  controllers: [WorkspacesController, WorkspacesApiController],
  providers: [WorkspacesService],
})
export class WorkspacesModule {}
