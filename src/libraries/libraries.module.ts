import { Module } from '@nestjs/common';
import { LibrariesService } from './libraries.service';
import { LibrariesController } from './libraries.controller';
import { LibrariesApiController } from './libraries-api.controller';

@Module({
  controllers: [LibrariesController, LibrariesApiController],
  providers: [LibrariesService],
  exports: [LibrariesService],
})
export class LibrariesModule {}
