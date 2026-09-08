import { IntersectionType, PickType } from '@nestjs/swagger';
import { LibraryEvent } from '../../generated/prisma-class/library_event';
import { LibraryEventRelations } from '../../generated/prisma-class/library_event_relations';

export class EventResponseDto extends IntersectionType(
  LibraryEvent,
  PickType(LibraryEventRelations, ['library', 'creator'] as const),
) {}
