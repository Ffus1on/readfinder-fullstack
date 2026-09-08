import { Category } from '@prisma/client';

export class CreateBookDto {
  title: string;
  author: string;
  description?: string;
  image?: string;
  pages?: number;
  rating?: number;
  category?: Category;
}
