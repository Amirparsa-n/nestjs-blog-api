import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UserBlockDto {
  @ApiProperty({ example: 'userId12345', description: 'The ID of the user to block' })
  @IsUUID()
  userId: string;
}
