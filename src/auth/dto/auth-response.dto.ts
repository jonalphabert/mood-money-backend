import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Logged out',
  })
  message: string;
}
