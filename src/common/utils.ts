export function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function isAuthenticated(auth?: string): boolean {
  return auth === 'true';
}

export function authSuffix(auth?: string): string {
  return isAuthenticated(auth) ? '?auth=true' : '';
}
