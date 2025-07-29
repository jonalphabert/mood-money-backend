import { Test } from '@nestjs/testing';
import { AuthMiddleware } from './auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../../users/user.entity';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
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

  const mockRequest = {
    headers: { authorization: 'Bearer valid-token' },
  } as Request;

  const mockResponse = {} as Response;
  const mockNext = jest.fn() as NextFunction;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthMiddleware,
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

    middleware = module.get(AuthMiddleware);
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('use', () => {
    it('should call next() for valid token', async () => {
      const payload = { sub: 'user-123', version: 1 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);

      await middleware.use(mockRequest as any, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect((mockRequest as any).user).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for missing authorization header', async () => {
      const reqWithoutAuth = { headers: {} } as Request;

      await expect(
        middleware.use(reqWithoutAuth as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid token format', async () => {
      const reqWithInvalidToken = {
        headers: { authorization: 'InvalidToken' },
      } as Request;

      await expect(
        middleware.use(reqWithInvalidToken as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for user not found', async () => {
      const payload = { sub: 'user-123', version: 1 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(null as any);

      await expect(
        middleware.use(mockRequest as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for token version mismatch', async () => {
      const payload = { sub: 'user-123', version: 2 };
      jwtService.verify.mockReturnValue(payload);
      usersService.findById.mockResolvedValue(mockUser);

      await expect(
        middleware.use(mockRequest as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle JWT verification errors', async () => {
      jwtService.verify.mockImplementation(() => {
        const error = new Error('invalid signature');
        error.name = 'JsonWebTokenError';
        throw error;
      });

      await expect(
        middleware.use(mockRequest as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle token expired errors', async () => {
      jwtService.verify.mockImplementation(() => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(
        middleware.use(mockRequest as any, mockResponse, mockNext),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
