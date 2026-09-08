import { Category } from '@prisma/client';

export class UpdateBookDto {
  title?: string;
  author?: string;
  description?: string;
  image?: string;
  pages?: number;
  rating?: number;
  category?: Category;
}
