import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { FileCategory } from '../enums/file-category.enum';

export class UploadFileDto {
  @ApiProperty({ type: 'string', format: 'binary', description: 'فایل برای آپلود' })
  file: any;

  @ApiProperty({
    required: false,
    enum: FileCategory,
    description: 'دسته‌بندی فایل',
  })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiProperty({
    required: false,
    description: 'توضیحات اختیاری برای فایل',
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;
}
