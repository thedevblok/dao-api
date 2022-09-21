import { SetMetadata } from '@nestjs/common';
import { Role } from '../../core/enum/access.enum';

export const hasRole = (requiredRoles: Role[]) =>
  SetMetadata('requiredRoles', { requiredRoles: requiredRoles });
