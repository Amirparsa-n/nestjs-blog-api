import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  userExistence(authDto: AuthDto) {
    return this.prisma.user.findFirst({ where: { username: authDto.username } });
  }
}
