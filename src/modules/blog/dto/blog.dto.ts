import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BlogStatus } from '../enum/status.enum.js';

export class CreateBlogDto {
  @ApiProperty({
    description: 'عنوان بلاگ',
    example: 'آموزش NestJS به زبان ساده',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({
    description: 'اسلاگ یکتا برای URL',
    example: 'nestjs-tutorial-simple',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'توضیح کوتاه بلاگ',
    example: 'در این مقاله با NestJS آشنا می‌شویم',
    maxLength: 300,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  description: string;

  @ApiProperty({
    description: 'محتوای اصلی بلاگ (HTML یا Markdown)',
    example: '<p>NestJS یک فریمورک قدرتمند است...</p>',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'آدرس تصویر شاخص بلاگ',
    example: 'https://cdn.example.com/blog/nestjs.png',
    format: 'binary',
  })
  image: string;

  @ApiPropertyOptional({
    description: 'وضعیت بلاگ',
    enum: BlogStatus,
    default: BlogStatus.Draft,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiProperty({ type: String, isArray: true })
  @IsString()
  categories: string;
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {}

export class FilterBlogDto {
  categoryId: string;
  search: string;
}
