import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDto } from './dto/auth.dto';
import { SwaggerConsumes } from '@common/enums/swagger-consumes';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user-existence')
  @ApiConsumes(SwaggerConsumes.FORM_URLENCODED, SwaggerConsumes.JSON)
  userExistence(@Body() authDto: AuthDto) {
    return this.authService.userExistence(authDto);
  }
}
