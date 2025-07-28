import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { EmailService } from '../../common/services/email.service';
import { User } from '../../users/user.entity';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-token'),
}));

jest.mock('crypto', () => ({
  randomBytes: jest
    .fn()
    .mockReturnValue({ toString: () => 'mock-verification-code' }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let emailService: jest.Mocked<EmailService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: true,
    token_version: 1,
    refresh_token: ['existing-token'],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:3000'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByRefreshToken: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    emailService = module.get(EmailService) as jest.Mocked<EmailService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  describe('register', () => {
    it('should register new user and send verification email', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      emailService.sendVerificationEmail.mockResolvedValue();

      const result = await service.register('test@example.com', 'password123');

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith({
        username: 'test',
        email: 'test@example.com',
        password: 'hashedpassword',
        token_version: 0,
        verification_code: 'mock-verification-code',
        is_verified: false,
      });
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toBe(mockUser);
    });

    it('should throw error if user already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register('test@example.com', 'password123'),
      ).rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    it('should login verified user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.update.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.login(
        'test@example.com',
        'password123',
        'device-123',
        'fingerprint',
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedpassword',
      );
      expect(usersService.update).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'jwt-token',
        refreshToken: 'mock-uuid-token',
      });
    });

    it('should throw error for invalid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login(
          'test@example.com',
          'password123',
          'device-123',
          'fingerprint',
        ),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for unverified user', async () => {
      const unverifiedUser = new User({ ...mockUser, is_verified: false });
      usersService.findByEmail.mockResolvedValue(unverifiedUser);

      await expect(
        service.login(
          'test@example.com',
          'password123',
          'device-123',
          'fingerprint',
        ),
      ).rejects.toThrow('Please verify your email before logging in');
    });

    it('should throw error for wrong password', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login(
          'test@example.com',
          'wrongpassword',
          'device-123',
          'fingerprint',
        ),
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should refresh token successfully', async () => {
      const userWithToken = new User({
        ...mockUser,
        refresh_token: ['refresh-token'],
      });
      usersService.findByRefreshToken.mockResolvedValue(userWithToken);
      usersService.update.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('new-jwt-token');

      const result = await service.refresh(
        'refresh-token',
        'device-123',
        'fingerprint',
      );

      expect(usersService.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(usersService.update).toHaveBeenCalled();
      expect(result).toEqual({ accessToken: 'new-jwt-token' });
    });

    it('should throw error for invalid refresh token', async () => {
      usersService.findByRefreshToken.mockResolvedValue(null);

      await expect(
        service.refresh('invalid-token', 'device-123', 'fingerprint'),
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const userWithToken = new User({
        ...mockUser,
        refresh_token: ['refresh-token'],
      });
      usersService.findByRefreshToken.mockResolvedValue(userWithToken);
      usersService.update.mockResolvedValue(mockUser);

      await service.logout('refresh-token', 'device-123');

      expect(usersService.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(usersService.update).toHaveBeenCalled();
    });

    it('should handle invalid refresh token gracefully', async () => {
      usersService.findByRefreshToken.mockResolvedValue(null);

      await expect(
        service.logout('invalid-token', 'device-123'),
      ).resolves.toBeUndefined();
    });
  });

  describe('validateUser', () => {
    it('should validate user with matching token version', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser({
        sub: 'user-123',
        version: 1,
      });

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
    });

    it('should throw error for token version mismatch', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      await expect(
        service.validateUser({ sub: 'user-123', version: 0 }),
      ).rejects.toThrow('Token version mismatch');
    });
  });
});
