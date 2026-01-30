import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { FileCategory } from '../enums/file-category.enum';

export class FileFilterDto {
  @ApiProperty({
    required: false,
    enum: FileCategory,
    description: 'فیلتر بر اساس دسته‌بندی',
  })
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @ApiProperty({
    required: false,
    description: 'جستجو در نام فایل',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    required: false,
    description: 'فیلتر بر اساس کاربر',
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    required: false,
    description: 'مرتب‌سازی بر اساس تاریخ (desc یا asc)',
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: 'asc' | 'desc' = 'desc';
}
