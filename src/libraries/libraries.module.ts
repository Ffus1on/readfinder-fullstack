import { Module } from '@nestjs/common';
import { LibrariesService } from './libraries.service';
import { LibrariesController } from './libraries.controller';

@Module({
  controllers: [LibrariesController],
  providers: [LibrariesService],
})
export class LibrariesModule {}
