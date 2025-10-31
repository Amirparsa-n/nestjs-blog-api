import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user-existence')
  userExistence(@Body() authDto: AuthDto) {
    return this.authService.userExistence(authDto);
  }
}
