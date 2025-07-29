import { Test } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '../../users/user.entity';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: jest.Mocked<JwtService>;
  let usersService: jest.Mocked<UsersService>;

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: true,
    token_version: 1,
    refresh_token: 'refresh-token',
    verification_code: undefined,
    created_at: new Date(),

    last_login: new Date(),
    display_currency_id: 1,
  });

  const mockExecutionContext = {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { authorization: 'Bearer valid-token' },
      }),
    }),
  } as ExecutionContext;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(JwtAuthGuard);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const payload = { sub: 'user-123', version: 1 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);

      const result = await guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(usersService.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw UnauthorizedException for missing token', async () => {
      const contextWithoutToken = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(contextWithoutToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      const contextWithInvalidToken = {
        switchToHttp: () => ({
          getRequest: () => ({ headers: { authorization: 'InvalidToken' } }),
        }),
      } as ExecutionContext;

      await expect(guard.canActivate(contextWithInvalidToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for user not found', async () => {
      const payload = { sub: 'user-123', version: 1 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(null as any);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for token version mismatch', async () => {
      const payload = { sub: 'user-123', version: 2 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for JWT verification error', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('JsonWebTokenError');
      });

      await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
