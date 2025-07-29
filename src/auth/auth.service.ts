import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
    private emailService: EmailService,
    public jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<User> {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(32).toString('hex');

    const userData = {
      username: email.split('@')[0],
      email,
      password: hashedPassword,
      token_version: 0,
      verification_code: verificationCode,
      is_verified: false,
    };

    const user = await this.usersService.create(userData);

    // Send verification email
    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${frontendUrl}/verify-email?code=${verificationCode}`;
    await this.emailService.sendVerificationEmail(email, verificationUrl);

    return user;
  }

  async login(
    email: string,
    password: string,
    deviceId: string,
    fingerprint: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.is_verified) {
      throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Increment token version and clear existing refresh tokens
    const newTokenVersion = (user.token_version || 0) + 1;
    const refreshTokenValue = uuidv4();

    await this.usersService.update(user.user_id, {
      last_login: new Date(),
      token_version: newTokenVersion,
      refresh_token: refreshTokenValue,
    });

    // Generate tokens
    const payload = {
      sub: user.user_id,
      email: user.email,
      version: newTokenVersion,
    };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });

    return { accessToken, refreshToken: refreshTokenValue };
  }

  async refresh(
    refreshTokenValue: string,
    deviceId: string,
    fingerprint: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.usersService.findByRefreshToken(refreshTokenValue);

    if (!user || !user.refresh_token?.includes(refreshTokenValue)) {
      throw new Error('Invalid refresh token');
    }

    // Increment token version and generate new refresh token
    const newTokenVersion = (user.token_version || 0) + 1;
    const newRefreshToken = uuidv4();

    // Remove old refresh token and add new one
    const updatedRefreshTokens = newRefreshToken;

    await this.usersService.update(user.user_id, {
      token_version: newTokenVersion,
      refresh_token: updatedRefreshTokens,
    });

    const payload = {
      sub: user.user_id,
      email: user.email,
      version: newTokenVersion,
    };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: '15m' });

    return { accessToken };
  }

  async logout(refreshTokenValue: string, deviceId: string): Promise<void> {
    const user = await this.usersService.findByRefreshToken(refreshTokenValue);
    if (!user || !user.refresh_token?.includes(refreshTokenValue)) {
      return; // Gracefully handle invalid tokens
    }

    // Increment token version and remove refresh token
    const newTokenVersion = (user.token_version || 0) + 1;

    await this.usersService.update(user.user_id, {
      token_version: newTokenVersion,
      refresh_token: '',
    });
  }

  async logoutAllDevices(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    const newTokenVersion = (user.token_version || 0) + 1;

    await this.usersService.update(userId, {
      token_version: newTokenVersion,
      refresh_token: '',
    });
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.usersService.findById(payload.sub);
    // Check if token version matches
    if (user.token_version !== payload.version) {
      throw new Error('Token version mismatch');
    }
    return user;
  }
}
