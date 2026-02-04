import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
  ParseFilePipe,
  UploadedFiles,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.js';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from '../../utils/multer.util.js';
import { UserBlockDto } from '@modules/users/dto/user.dto';
import { Role } from '@common/decorators/role.decorator';
import { Roles } from 'generated/prisma/enums';

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Put('/profile')
  @ApiConsumes(SwaggerConsumes.MULTIPART)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'bg_image', maxCount: 1 },
      ],
      { storage: multerStorage('user-profile') }
    )
  )
  updateUserProfile(
    @Body() profileDto: ProfileDto,
    @UploadedFiles(new ParseFilePipe()) files: { avatar: Express.Multer.File[]; bg_image: Express.Multer.File[] }
  ) {
    return this.usersService.updateUserProfile(profileDto, files);
  }

  @Get('/profile')
  @ApiBearerAuth('auth')
  @UseGuards(AuthGuard)
  getProfile() {
    return this.usersService.getProfile();
  }

  @Patch('change-username')
  async changeUsername(@Body() changeUsernameDto: ChangeUsernameDto) {
    return this.usersService.changeUsername(changeUsernameDto.username);
  }

  @Post('/block')
  @Role(Roles.admin)
  blockUser(@Body() body: UserBlockDto) {
    return this.usersService.blockUser(body.userId);
  }

  @Get()
  findAll() {
    console.log(new Date());

    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
