import { IntersectionType, PickType } from '@nestjs/swagger';
import { LibraryBook } from '../../generated/prisma-class/library_book';
import { LibraryBookRelations } from '../../generated/prisma-class/library_book_relations';

export class BookLibraryDto extends IntersectionType(
  LibraryBook,
  PickType(LibraryBookRelations, ['library'] as const),
) {}
