import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

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
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      service.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      service.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123');

      expect(service.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
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

  describe('update', () => {
    it('should update user', async () => {
      const updateData = { username: 'updateduser' };
      service.update.mockResolvedValue(mockUser);

      const result = await controller.update('user-123', updateData);

      expect(service.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result).toBe(mockUser);
    });
  });

  describe('updateCurrency', () => {
    it('should update user currency', async () => {
      const body = { currency_id: 2 };
      service.updateCurrency.mockResolvedValue(mockUser);

      const result = await controller.updateCurrency('user-123', body);

      expect(service.updateCurrency).toHaveBeenCalledWith('user-123', 2);
      expect(result).toBe(mockUser);
    });
  });
});
