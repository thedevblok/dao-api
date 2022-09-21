import { SetMetadata } from '@nestjs/common';
import { ApiKeyAction } from '../../core/enum/access.enum';

export const hasKeyAction = (requiredAbilityKey: ApiKeyAction) =>
  SetMetadata('apiKeyAction', { requiredAbilityKey: requiredAbilityKey });
