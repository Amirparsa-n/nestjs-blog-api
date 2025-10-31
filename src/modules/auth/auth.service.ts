import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isPhoneNumber, isString } from 'class-validator';
import { Prisma, User } from 'generated/prisma';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  userExistence(authDto: AuthDto) {
    const { method, type, username } = authDto;

    switch (type) {
      case AuthType.Login:
        return this.login(method, username);
      case AuthType.Register:
        return this.register(method, username);
      default:
        throw new UnauthorizedException('Invalid authentication type');
    }
  }

  private async login(method: AuthMethod, username: string) {
    username = this.usernameValidator(method, username);

    const user = await this.checkUserExistence(method, username);
    if (!user) throw new ConflictException('کاربر مورد نظر یافت نشد');

    return user;
  }

  private async register(method: AuthMethod, username: string) {
    username = this.usernameValidator(method, username);

    const user = await this.checkUserExistence(method, username);
    if (!user) throw new ConflictException('کاربر مورد نظر یافت نشد');

    return user;
  }

  private checkOtp() {}
  private sendOtp() {}

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
    return !!user;
  }

  private usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException('Invalid email format');
      case AuthMethod.Phone:
        if (isPhoneNumber(username, 'IR')) return username;
        throw new BadRequestException('Invalid phone number format');
      case AuthMethod.Username:
        if (isString(username)) return username;
        throw new BadRequestException('Invalid username format');
    }
  }
}
