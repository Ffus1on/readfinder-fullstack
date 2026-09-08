import { Category } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(Category, {
  name: 'Category',
  description: 'Жанр книги',
});
