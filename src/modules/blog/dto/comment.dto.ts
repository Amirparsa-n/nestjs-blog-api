import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateBlogCommentDto {
  @ApiProperty({ title: 'متن کامنت' })
  @IsString()
  @MinLength(2)
  @MaxLength(1000)
  text: string;

  @ApiProperty()
  @IsUUID()
  blogId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
