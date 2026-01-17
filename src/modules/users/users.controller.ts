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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@modules/auth/guards/auth.guard';
import { ChangeUsernameDto, ProfileDto } from './dto/profile.dto';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.js';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from '../../utils/multer.util.js';

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
  updateUserProfile(@Body() profileDto: ProfileDto, @UploadedFiles(new ParseFilePipe()) files: any) {
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
