import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  type: string;
  @ApiProperty()
  method: string;
}
