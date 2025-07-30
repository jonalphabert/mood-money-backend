import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Headers,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto, MessageResponseDto } from './dto/auth-response.dto';
import { LogoutDto } from './dto/logout.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { TestEmailDto } from './dto/test-email.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists or validation error',
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto.email, registerDto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiHeader({
    name: 'x-device-id',
    description: 'Device identifier',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(
    @Body() loginDto: LoginDto,
    @Headers('x-device-id') deviceId: string,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const fingerprint = req['fingerprint'];
    const { accessToken, refreshToken } = await this.authService.login(
      loginDto.email,
      loginDto.password,
      deviceId,
      fingerprint,
    );
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: 'lax' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie('refreshToken', refreshToken, cookieOptions);
    return { accessToken };
  }

  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Requires refreshToken cookie from login. Make sure to include cookies in request.',
  })
  @ApiHeader({
    name: 'x-device-id',
    description: 'Device identifier',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Headers('x-device-id') deviceId: string,
  ) {
    const fingerprint = req['fingerprint'];
    const token = req.cookies?.refreshToken;

    if (!token) {
      throw new Error('Refresh token not found in cookies');
    }

    const { accessToken } = await this.authService.refresh(
      token,
      deviceId,
      fingerprint,
    );
    return { accessToken };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Logout user',
    description:
      'Requires refreshToken cookie from login. Make sure to include cookies in request.',
  })
  @ApiHeader({
    name: 'x-device-id',
    description: 'Device identifier',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    type: MessageResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async logout(
    @Req() req,
    @Res({ passthrough: true }) res,
    @Body() logoutDto?: LogoutDto,
  ) {
    // Try to get token from body first, then from cookies
    const token = logoutDto?.refreshToken || req.cookies?.refreshToken;

    if (!token) {
      throw new Error('Refresh token not found in cookies or request body');
    }

    await this.authService.logout(token);

    // Clear the refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax' as const,
    });

    return { message: 'Logged out' };
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: User,
  })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyEmailDto.code);
  }

  @Post('test-email')
  @ApiOperation({
    summary: 'Test email sending (Development only)',
    description:
      'Sends a test verification email. Use Ethereal Email for testing.',
  })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async testEmail(@Body() testEmailDto: TestEmailDto) {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Test email endpoint not available in production');
    }

    const testUrl =
      'http://localhost:3000/verify-email?code=test-verification-code-123';
    await this.emailService.sendVerificationEmail(testEmailDto.email, testUrl);

    return {
      message: 'Test email sent successfully',
      note: 'Check console for Ethereal preview URL if using test mode',
    };
  }
}
