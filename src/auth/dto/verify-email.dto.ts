import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification code',
    example: 'abc123def456789',
  })
  @IsString()
  code: string;
}
