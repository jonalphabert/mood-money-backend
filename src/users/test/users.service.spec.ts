import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { NotFoundError } from '../../utils/custom_error';
import { User } from '../user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: false,
    verification_code: 'verification-code-123',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findByRefreshToken: jest.fn(),
            findByVerificationCode: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateCurrency: jest.fn(),
            updateLastLogin: jest.fn(),
            getProfile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(UsersRepository) as jest.Mocked<UsersRepository>;
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      repository.findAll.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-123');

      expect(repository.findById).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      repository.findByEmail.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(result).toBe(mockUser);
    });

    it('should return null if user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return user by refresh token', async () => {
      repository.findByRefreshToken.mockResolvedValue(mockUser);

      const result = await service.findByRefreshToken('refresh-token');

      expect(repository.findByRefreshToken).toHaveBeenCalledWith(
        'refresh-token',
      );
      expect(result).toBe(mockUser);
    });
  });

  describe('findByVerificationCode', () => {
    it('should return user by verification code', async () => {
      repository.findByVerificationCode.mockResolvedValue(mockUser);

      const result = await service.findByVerificationCode('verification-code');

      expect(repository.findByVerificationCode).toHaveBeenCalledWith(
        'verification-code',
      );
      expect(result).toBe(mockUser);
    });
  });

  describe('getProfile', () => {
    it('should return user profile with currency details', async () => {
      const profileData = {
        user_id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        currency_name: 'US Dollar',
        currency_code: 'USD',
        currency_symbol: '$',
      };
      repository.getProfile.mockResolvedValue(profileData);

      const result = await service.getProfile('user-123');

      expect(repository.getProfile).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(profileData);
    });

    it('should return null if user not found', async () => {
      repository.getProfile.mockResolvedValue(null);

      const result = await service.getProfile('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create new user', async () => {
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password',
      };
      repository.create.mockResolvedValue(mockUser);

      const result = await service.create(userData);

      expect(repository.create).toHaveBeenCalledWith(userData);
      expect(result).toBe(mockUser);
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const updateData = { username: 'updateduser' };
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(mockUser);

      const result = await service.update('user-123', updateData);

      expect(repository.findById).toHaveBeenCalledWith('user-123');
      expect(repository.update).toHaveBeenCalledWith('user-123', updateData);
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should throw NotFoundError if update returns null', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.update.mockResolvedValue(null);

      await expect(service.update('user-123', {})).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('updateCurrency', () => {
    it('should update user currency', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.updateCurrency.mockResolvedValue(mockUser);

      const result = await service.updateCurrency('user-123', 2);

      expect(repository.findById).toHaveBeenCalledWith('user-123');
      expect(repository.updateCurrency).toHaveBeenCalledWith('user-123', 2);
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateCurrency('nonexistent', 2)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.updateLastLogin.mockResolvedValue(mockUser);

      const result = await service.updateLastLogin('user-123');

      expect(repository.findById).toHaveBeenCalledWith('user-123');
      expect(repository.updateLastLogin).toHaveBeenCalledWith('user-123');
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.updateLastLogin('nonexistent')).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email successfully', async () => {
      const unverifiedUser = new User({ ...mockUser, is_verified: false });
      const verifiedUser = new User({
        ...mockUser,
        is_verified: true,
        verification_code: undefined,
      });

      repository.findByVerificationCode.mockResolvedValue(unverifiedUser);
      repository.update.mockResolvedValue(verifiedUser);

      const result = await service.verifyEmail('verification-code-123');

      expect(repository.findByVerificationCode).toHaveBeenCalledWith(
        'verification-code-123',
      );
      expect(repository.update).toHaveBeenCalledWith('user-123', {
        is_verified: true,
        verification_code: null,
      });
      expect(result).toBe(verifiedUser);
    });

    it('should throw NotFoundError for invalid verification code', async () => {
      repository.findByVerificationCode.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-code')).rejects.toThrow(
        new NotFoundError('Invalid verification code'),
      );
    });

    it('should throw error if email already verified', async () => {
      const verifiedUser = new User({ ...mockUser, is_verified: true });
      repository.findByVerificationCode.mockResolvedValue(verifiedUser);

      await expect(
        service.verifyEmail('verification-code-123'),
      ).rejects.toThrow('Email already verified');
    });

    it('should throw NotFoundError if update fails', async () => {
      const unverifiedUser = new User({ ...mockUser, is_verified: false });
      repository.findByVerificationCode.mockResolvedValue(unverifiedUser);
      repository.update.mockResolvedValue(null);

      await expect(
        service.verifyEmail('verification-code-123'),
      ).rejects.toThrow(NotFoundError);
    });
  });
});
