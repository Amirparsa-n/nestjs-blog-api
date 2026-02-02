import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { RoleGuard } from '@modules/auth/guards/role.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function AuthDecorator() {
  return applyDecorators(ApiBearerAuth('auth'), UseGuards(AuthGuard, RoleGuard));
}
