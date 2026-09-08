import { BadRequestException } from '@nestjs/common';

export const EVENT_DATE_ERROR =
  'Дата окончания не может быть раньше даты начала';

export function assertDateRange(
  start: Date,
  end: Date | null | undefined,
): void {
  if (end === null || end === undefined) return;
  if (end.getTime() < start.getTime()) {
    throw new BadRequestException(EVENT_DATE_ERROR);
  }
}
