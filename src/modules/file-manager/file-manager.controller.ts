import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseFilePipe,
  UploadedFile,
  MaxFileSizeValidator,
  Query,
} from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { UploadFile } from '../../common/decorators/upload-file.decorator.js';
import { UploadFileDto } from './dto/update-file.dto.js';
import { PaginationDto } from '../../common/dtos/pagination.dto.js';
import { FileFilterDto } from './dto/file-query.dto.js';

@Controller('file-manager')
@ApiTags('File Manager')
@ApiBearerAuth('auth')
@UseGuards(AuthGuard)
export class FileManagerController {
  constructor(private readonly fileManagerService: FileManagerService) {}

  @Post('upload')
  @ApiOperation({ summary: 'آپلود فایل جدید' })
  @UploadFile('file', 'file-manager')
  @ApiBody({
    description: 'فایل برای آپلود',
    type: UploadFileDto,
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
        ],
      })
    )
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto
  ) {
    return this.fileManagerService.create(file, uploadFileDto);
  }

  @Get()
  @ApiOperation({ summary: 'دریافت لیست فایل‌ها با فیلتر' })
  @ApiResponse({
    status: 200,
    description: 'لیست فایل‌ها',
  })
  findAll(@Query() paginationDto: PaginationDto, @Query() filterDto: FileFilterDto) {
    return this.fileManagerService.findAll(paginationDto, filterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف یک فایل' })
  remove(@Param('id') id: string) {
    return this.fileManagerService.remove(id);
  }
}
