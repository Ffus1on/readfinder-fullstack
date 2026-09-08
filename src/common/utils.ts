import { BadRequestException } from '@nestjs/common';

export function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function nullableNumber(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function rejectNullFields<T extends object>(
  dto: T,
  fields: readonly (keyof T)[],
): void {
  for (const field of fields) {
    if (dto[field] === null) {
      throw new BadRequestException(`Поле ${String(field)} не может быть null`);
    }
  }
}

export function isAuthenticated(auth?: string): boolean {
  return auth === 'true';
}

export function authSuffix(auth?: string): string {
  return isAuthenticated(auth) ? '?auth=true' : '';
}
