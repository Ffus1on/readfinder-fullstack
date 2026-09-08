import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ACCESS_KEY = 'publicAccess';
export const PublicAccess = () => SetMetadata(PUBLIC_ACCESS_KEY, true);
