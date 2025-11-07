import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AccessTokenPayload, CookiePayload } from './types/payload.types';

@Injectable()
export class TokensService {
  constructor(private readonly jwtService: JwtService) {}

  createOtpToken(payload: CookiePayload) {
    const expiresIn = 60 * 2; // 2 minutes

    const token = this.jwtService.sign(payload, { expiresIn, secret: process.env.OTP_TOKEN_SECRET });
    return token;
  }

  verifyOtpToken(token: string): CookiePayload {
    try {
      return this.jwtService.verify(token, { secret: process.env.OTP_TOKEN_SECRET });
    } catch {
      throw new UnauthorizedException();
    }
  }

  createAccessToken(payload: AccessTokenPayload) {
    const token = this.jwtService.sign(payload, { expiresIn: '7d', secret: process.env.ACCESS_TOKEN_SECRET });
    return token;
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify(token, { secret: process.env.ACCESS_TOKEN_SECRET });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
