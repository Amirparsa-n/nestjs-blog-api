import { Controller, Post, Body, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDto, type CheckOtpDto } from './dto/auth.dto';
import { SwaggerConsumes } from '@common/enums/swagger-consumes';
import { TokensService } from './tokens.service';
import type { Response } from 'express';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokensService: TokensService
  ) {}

  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.FORM_URLENCODED, SwaggerConsumes.JSON)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }

  @Post('check-otp')
  @ApiConsumes(SwaggerConsumes.FORM_URLENCODED, SwaggerConsumes.JSON)
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto.code);
  }
}
