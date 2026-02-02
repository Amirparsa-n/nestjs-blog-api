import { SetMetadata } from '@nestjs/common';
import { Roles } from 'generated/prisma/enums';

export const ROLE_KEY = 'roles';

export const Role = (...roles: Roles[]) => SetMetadata(ROLE_KEY, roles);
