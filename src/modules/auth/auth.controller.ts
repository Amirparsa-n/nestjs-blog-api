import { Controller, Post, Body, Res, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDto, CheckOtpDto } from './dto/auth.dto';
import { SwaggerConsumes } from '@common/enums/swagger-consumes';
import type { Request, Response } from 'express';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.FORM_URLENCODED, SwaggerConsumes.JSON)
  userExistence(@Body() authDto: AuthDto, @Res() res: Response) {
    return this.authService.userExistence(authDto, res);
  }

  @Post('check-otp')
  @ApiConsumes(SwaggerConsumes.FORM_URLENCODED, SwaggerConsumes.JSON)
  checkOtp(@Body() body: CheckOtpDto) {
    return this.authService.checkOtp(body.code);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('auth')
  getMe(@Req() req: Request) {
    return req.user;
  }
}
