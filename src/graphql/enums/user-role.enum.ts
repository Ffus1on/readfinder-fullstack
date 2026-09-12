import { UserRole } from '@prisma/client';
import { registerEnumType } from '@nestjs/graphql';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Роль пользователя в системе',
});
