import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../common/services/email.service';
import { User } from '../../users/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: true,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('development'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            verifyEmail: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
    usersService = module.get(UsersService);
    emailService = module.get(EmailService);
    configService = module.get(ConfigService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      authService.register.mockResolvedValue(mockUser);

      const result = await controller.register(registerDto);

      expect(authService.register).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
      );
      expect(result).toBe(mockUser);
    });
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const loginDto = { email: 'test@example.com', password: 'password123' };
      const mockReq = { fingerprint: 'test-fingerprint' };
      const mockRes = { cookie: jest.fn() };
      const loginResult = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      authService.login.mockResolvedValue(loginResult);

      const result = await controller.login(
        loginDto,
        'device-123',
        mockReq,
        mockRes,
      );

      expect(authService.login).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'device-123',
        'test-fingerprint',
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh-token',
        expect.any(Object),
      );
      expect(result).toEqual({ accessToken: 'access-token' });
    });
  });

  describe('refresh', () => {
    it('should refresh access token', async () => {
      const mockReq = {
        fingerprint: 'test-fingerprint',
        cookies: { refreshToken: 'refresh-token' },
      };
      const mockRes = {};
      authService.refresh.mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const result = await controller.refresh(mockReq, mockRes, 'device-123');

      expect(authService.refresh).toHaveBeenCalledWith(
        'refresh-token',
        'device-123',
        'test-fingerprint',
      );
      expect(result).toEqual({ accessToken: 'new-access-token' });
    });

    it('should throw error if no refresh token in cookies', async () => {
      const mockReq = { fingerprint: 'test-fingerprint', cookies: {} };
      const mockRes = {};

      await expect(
        controller.refresh(mockReq, mockRes, 'device-123'),
      ).rejects.toThrow('Refresh token not found in cookies');
    });
  });

  describe('logout', () => {
    it('should logout user and clear cookie', async () => {
      const mockReq = { cookies: { refreshToken: 'refresh-token' } };
      const mockRes = { clearCookie: jest.fn() };
      authService.logout.mockResolvedValue();

      const result = await controller.logout(mockReq, mockRes);

      expect(authService.logout).toHaveBeenCalledWith('refresh-token');
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object),
      );
      expect(result).toEqual({ message: 'Logged out' });
    });

    it('should logout with refresh token from body', async () => {
      const mockReq = { cookies: {} };
      const mockRes = { clearCookie: jest.fn() };
      const logoutDto = { refreshToken: 'body-refresh-token' };
      authService.logout.mockResolvedValue();

      const result = await controller.logout(mockReq, mockRes, logoutDto);

      expect(authService.logout).toHaveBeenCalledWith('body-refresh-token');
      expect(result).toEqual({ message: 'Logged out' });
    });

    it('should throw error if no refresh token found', async () => {
      const mockReq = { cookies: {} };
      const mockRes = { clearCookie: jest.fn() };

      await expect(controller.logout(mockReq, mockRes)).rejects.toThrow(
        'Refresh token not found in cookies or request body',
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const verifyDto = { code: 'verification-code' };
      usersService.verifyEmail.mockResolvedValue(mockUser);

      const result = await controller.verifyEmail(verifyDto);

      expect(usersService.verifyEmail).toHaveBeenCalledWith(
        'verification-code',
      );
      expect(result).toBe(mockUser);
    });
  });

  describe('testEmail', () => {
    it('should send test email in development', async () => {
      const testDto = { email: 'test@example.com' };
      emailService.sendVerificationEmail.mockResolvedValue();

      const result = await controller.testEmail(testDto);

      expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'http://localhost:3000/verify-email?code=test-verification-code-123',
      );
      expect(result.message).toBe('Test email sent successfully');
    });

    it('should throw error in production', async () => {
      configService.get.mockReturnValue('production');
      const testDto = { email: 'test@example.com' };

      await expect(controller.testEmail(testDto)).rejects.toThrow(
        'Test email endpoint not available in production',
      );
    });

    it('should handle email service errors', async () => {
      const testDto = { email: 'test@example.com' };
      emailService.sendVerificationEmail.mockRejectedValue(
        new Error('SMTP Error'),
      );

      await expect(controller.testEmail(testDto)).rejects.toThrow('SMTP Error');
    });
  });
});
