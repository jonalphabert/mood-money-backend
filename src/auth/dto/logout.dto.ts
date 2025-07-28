import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'Refresh token (optional - will use cookie if not provided)',
    example: 'refresh-token-uuid',
    required: false,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
