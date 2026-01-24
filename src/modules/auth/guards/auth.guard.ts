import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { isJWT } from 'class-validator';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH } from '../../../common/decorators/skipAuth.decorator.js';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skippedAuth = this.reflector.get<boolean>(SKIP_AUTH, context.getHandler());
    if (skippedAuth) return true;

    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const user = await this.authService.validateAccessToken(token);
    request.user = user;

    return true;
  }

  private extractTokenFromHeader(request: Request) {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (type?.toLowerCase() !== 'bearer' || !token || !isJWT(token)) throw new UnauthorizedException();

    return token;
  }
}
