import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsUrl, IsEnum } from 'class-validator';
import { Gender } from '../enum/gender.enum';

export class ProfileDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ nullable: true, format: 'binary' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ nullable: true, format: 'binary' })
  @IsOptional()
  @IsString()
  bg_image?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: string;

  @ApiPropertyOptional({ nullable: true, example: '2026-01-16T15:17:32.414Z' })
  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @ApiPropertyOptional({ nullable: true, example: 'https://www.linkedin.com/' })
  @IsOptional()
  @IsUrl()
  linkedin_profile_url?: string;
}
