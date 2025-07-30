import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: true,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateCurrency: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  describe('getProfile', () => {
    it('should return current user profile with currency details', async () => {
      const profileData = {
        ...mockUser,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        currency_symbol: '$',
      };
      service.getProfile.mockResolvedValue(profileData as any);

      const result = await controller.getProfile(mockUser);

      expect(service.getProfile).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(profileData);
    });
  });

  describe('findOne', () => {
    it('should return user by id when accessing own data', async () => {
      service.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123', mockUser);

      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
    });

    it('should throw ForbiddenException when accessing other user data', async () => {
      await expect(controller.findOne('other-user', mockUser)).rejects.toThrow(
        ForbiddenException,
      );

      expect(service.findById).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
      };
      service.create.mockResolvedValue(mockUser);

      const result = await controller.create(userData);

      expect(service.create).toHaveBeenCalledWith(userData);
      expect(result).toBe(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update current user profile', async () => {
      const updateData = { username: 'updateduser' };
      service.update.mockResolvedValue(mockUser);

      const result = await controller.updateProfile(updateData, mockUser);

      expect(service.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result).toBe(mockUser);
    });
  });

  describe('updateCurrency', () => {
    it('should update current user currency', async () => {
      const body = { currency_id: 2 };
      service.updateCurrency.mockResolvedValue(mockUser);

      const result = await controller.updateCurrency(body, mockUser);

      expect(service.updateCurrency).toHaveBeenCalledWith('user-123', 2);
      expect(result).toBe(mockUser);
    });
  });
});
