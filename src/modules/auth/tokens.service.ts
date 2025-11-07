import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { CookiePayload } from './types/payload.types';

@Injectable()
export class TokensService {
  constructor(private readonly jwtService: JwtService) {}

  createOtpToken(payload: CookiePayload) {
    const expiresIn = 60 * 2; // 2 minutes

    const token = this.jwtService.sign(payload, { expiresIn, secret: process.env.OTP_TOKEN_SECRET });
    return token;
  }
}
