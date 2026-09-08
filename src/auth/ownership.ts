import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { UsersService } from '../users/users.service';

export async function assertOwnerOrAdmin(
  usersService: UsersService,
  ownerId: string,
  sessionUserId: string | undefined,
  forbiddenMessage = 'Недостаточно прав для доступа к этому ресурсу',
): Promise<void> {
  if (!sessionUserId) {
    throw new UnauthorizedException('Требуется аутентификация');
  }
  if (sessionUserId === ownerId) return;
  const user = await usersService.findByIdOrNull(sessionUserId);
  if (user?.role !== 'ADMIN') {
    throw new ForbiddenException(forbiddenMessage);
  }
}
