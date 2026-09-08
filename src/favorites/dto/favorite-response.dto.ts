import { IntersectionType, PickType } from '@nestjs/swagger';
import { Favorite } from '../../generated/prisma-class/favorite';
import { FavoriteRelations } from '../../generated/prisma-class/favorite_relations';

export class FavoriteResponseDto extends IntersectionType(
  Favorite,
  PickType(FavoriteRelations, ['book'] as const),
) {}
