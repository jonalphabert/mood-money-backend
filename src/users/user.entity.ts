import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'User ID', example: 'user-123' })
  user_id: string;

  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Hashed password', example: 'hashedpassword123' })
  password: string;

  @ApiProperty({
    description: 'Display currency ID',
    example: 1,
    required: false,
  })
  display_currency_id?: number = 1;

  @ApiProperty({ description: 'Last login timestamp', required: false })
  last_login?: Date;

  @ApiProperty({ description: 'User active status', example: true })
  is_active: boolean;

  @ApiProperty({ description: 'Account creation timestamp' })
  created_at?: Date;

  @ApiProperty({ description: 'Refresh tokens array', required: false })
  refresh_token?: string;

  @ApiProperty({
    description: 'Token version for invalidation',
    example: 1,
    required: false,
  })
  token_version?: number;

  @ApiProperty({
    description: 'Email verification code',
    example: 'abc123def456',
    required: false,
  })
  verification_code?: string;

  @ApiProperty({ description: 'Email verification status', example: false })
  is_verified: boolean;

  constructor(data: Partial<User>) {
    if (!data.username) throw new Error('Name is required');
    if (!data.email) throw new Error('Email is required');
    if (!data.password) throw new Error('Password is required');

    Object.assign(this, data);

    this.is_active = data.is_active ?? true;
    this.is_verified = data.is_verified ?? false;
    this.created_at = data.created_at || new Date();
  }

  static fromDatabaseRow(row: any): User {
    return new User({
      user_id: row.user_id,
      username: row.username,
      email: row.email,
      password: row.password,
      display_currency_id: row.display_currency_id,
      last_login: row.last_login ? new Date(row.last_login) : undefined,
      is_active: row.is_active,
      created_at: row.created_at ? new Date(row.created_at) : undefined,
      refresh_token: row.refresh_token,
      token_version: row.token_version,
      verification_code: row.verification_code,
      is_verified: row.is_verified,
    });
  }

  toDatabaseModel() {
    return {
      user_id: this.user_id,
      username: this.username,
      email: this.email,
      password: this.password,
      display_currency_id: this.display_currency_id,
      last_login: this.last_login,
      is_active: this.is_active,
      created_at: this.created_at,
      refresh_token: this.refresh_token,
      token_version: this.token_version,
      verification_code: this.verification_code,
      is_verified: this.is_verified,
    };
  }

  validate() {
    if (!this.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    if (this.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  }

  activate() {
    this.is_active = true;
  }

  deactivate() {
    this.is_active = false;
  }

  updateLastLogin() {
    this.last_login = new Date();
  }
}
