import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to specific roles.
 * Usage: @Roles(Role.ADMIN) or @Roles(Role.ADMIN, Role.MANAGER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
