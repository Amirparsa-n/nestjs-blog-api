import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isPhoneNumber, isString } from 'class-validator';
import { User } from 'generated/prisma';
import { randomInt } from 'node:crypto';
import { TokensService } from './tokens.service';
import type { Request, Response } from 'express';
import { CookieKey } from '@common/enums/cookie.enum';
import type { AuthResponse } from './types/response.types';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokensService: TokensService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async userExistence(authDto: AuthDto, res: Response) {
    const { method, type, username } = authDto;

    let result: AuthResponse;
    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        return this.sendResponse(res, result);
      case AuthType.Register:
        result = await this.register(method, username);
        return this.sendResponse(res, result);
      default:
        throw new UnauthorizedException('Invalid authentication type');
    }
  }

  async checkOtp(code: string) {
    const token: string | null = this.request.cookies[CookieKey.OTP];
    if (!token) throw new UnauthorizedException('Invalid OTP token');

    const { userId } = this.tokensService.verifyOtpToken(token);
    const otp = await this.prisma.otp.findFirst({ where: { userId } });
    if (!otp) throw new UnauthorizedException();

    if (otp.expiresIn < new Date()) throw new UnauthorizedException();
    if (otp.code !== code) throw new BadRequestException('کد وارد شده اشتباه است');

    const accessToken = this.tokensService.createAccessToken({ userId: userId });

    return {
      message: 'با موفقیت وارد حساب کاربری خود شدید',
      accessToken,
    };
  }

  private async login(method: AuthMethod, username: string): Promise<AuthResponse> {
    username = this.usernameValidator(method, username);

    const user = await this.checkUserExistence(method, username);
    if (!user) throw new ConflictException('کاربر مورد نظر یافت نشد');

    const otp = await this.sendOrSaveOtp(user.id);

    const token = this.tokensService.createOtpToken({ userId: user.id });

    return { code: otp.code, token };
  }

  private async register(method: AuthMethod, username: string): Promise<AuthResponse> {
    username = this.usernameValidator(method, username);

    let user: null | User;
    user = await this.checkUserExistence(method, username);
    if (user) throw new ConflictException('کاربر با این مشخصات وجود دارد');

    if (method === AuthMethod.Username) {
      throw new BadRequestException('اطلاعات ارسال شده برای ثبت نام صحیح نمی باشد');
    }
    const randomUsername = `m_${randomInt(1000000000, 9999999999)}`;

    user = await this.prisma.user.create({ data: { [method]: username, username: randomUsername } });

    const otp = await this.sendOrSaveOtp(user.id);

    const token = this.tokensService.createOtpToken({ userId: user.id });

    return { code: otp.code, token };
  }

  private sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;
    res.cookie(CookieKey.OTP, token, { httpOnly: true, secure: true, expires: new Date(Date.now() + 1000 * 60 * 2) });

    res.json({ message: 'کد تایید به شماره شما ارسال شد', code: code, token });
  }

  private async sendOrSaveOtp(userId: string) {
    const code = randomInt(10000, 99999).toString();
    const expiresIn = new Date(Date.now() + 1000 * 60 * 2); // 2 دقیقه

    return this.prisma.otp.upsert({
      where: { userId },
      update: { code, expiresIn },
      create: { code, expiresIn, userId },
    });
  }

  private async checkUserExistence(method: AuthMethod, username: string) {
    let user: User | null;
    switch (method) {
      case AuthMethod.Email:
        user = await this.prisma.user.findFirst({ where: { email: username } });
        break;
      case AuthMethod.Phone:
        user = await this.prisma.user.findFirst({ where: { phone: username } });
        break;
      case AuthMethod.Username:
        user = await this.prisma.user.findFirst({ where: { username } });
        break;
    }
    return user;
  }

  private usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException('ایمیل نامعتبر');
      case AuthMethod.Phone:
        if (isPhoneNumber(username, 'IR')) return username;
        throw new BadRequestException('شماره همراه نامعتبر');
      case AuthMethod.Username:
        if (isString(username)) return username;
        throw new BadRequestException('فرمت نام‌کاربری نامعتبر می باشد');
    }
  }
}
