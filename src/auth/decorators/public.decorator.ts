import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as public — skips JWT authentication.
 * Use on endpoints like register, login, health checks.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
