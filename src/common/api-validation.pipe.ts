import { ValidationPipe } from '@nestjs/common';

export const ApiValidationPipe = new ValidationPipe({
  transform: true,
  whitelist: true,
});
