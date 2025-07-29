import { Test } from '@nestjs/testing';
import { UsersRepository } from '../users.repository';
import { DatabaseService } from '../../database/database.service';
import { User } from '../user.entity';

const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnValue({ sql: 'INSERT SQL', params: [] }),
  build: jest.fn().mockReturnValue({ sql: 'SELECT SQL', params: [] }),
  offsetRecords: jest.fn().mockReturnThis(),
  limitRecords: jest.fn().mockReturnThis(),
  join: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
};

jest.mock('src/utils/query-builder', () => ({
  QueryBuilder: jest.fn().mockImplementation(() => mockQueryBuilder),
}));

const createQueryResult = <T>(rows: T[], rowCount = rows.length) => ({
  command: 'SELECT',
  rowCount,
  oid: 0,
  rows,
  fields: [],
});

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockDatabaseRow = {
    user_id: 'user-123',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'hashedpassword',
    display_currency_id: 1,
    is_active: true,
    created_at: new Date(),
    refresh_token: ['token1'],
    token_version: 1,
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: DatabaseService,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    usersRepository = moduleRef.get<UsersRepository>(UsersRepository);
    databaseService = moduleRef.get(
      DatabaseService,
    ) as jest.Mocked<DatabaseService>;
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
      };
      const queryResult = createQueryResult([mockDatabaseRow]);
      databaseService.query.mockResolvedValue(queryResult);

      const result = await usersRepository.create(userData);

      expect(result).toBeInstanceOf(User);
      expect(result.username).toBe('johndoe');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockDatabaseRow]),
      );

      const result = await usersRepository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
    });
  });

  describe('findById', () => {
    it('should return user by ID', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockDatabaseRow]),
      );

      const result = await usersRepository.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result!.user_id).toBe('user-123');
    });

    it('should return null if user not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await usersRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockDatabaseRow]),
      );

      const result = await usersRepository.findByEmail('john@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result!.email).toBe('john@example.com');
    });

    it('should return null if user not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await usersRepository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return user by refresh token', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockDatabaseRow]),
      );

      const result = await usersRepository.findByRefreshToken('token1');

      expect(result).toBeInstanceOf(User);
      expect(result!.refresh_token).toContain('token1');
    });

    it('should return null if token not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await usersRepository.findByRefreshToken('invalid-token');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updateData = { username: 'Updated Name' };
      const updated = { ...mockDatabaseRow, ...updateData };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await usersRepository.update('user-123', updateData);

      expect(result).toBeInstanceOf(User);
      expect(result!.username).toBe('Updated Name');
    });

    it('should return null if user not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await usersRepository.update('nonexistent', {});

      expect(result).toBeNull();
    });
  });

  describe('updateCurrency', () => {
    it('should update user currency', async () => {
      const updated = { ...mockDatabaseRow, display_currency_id: 2 };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await usersRepository.updateCurrency('user-123', 2);

      expect(result).toBeInstanceOf(User);
      expect(result!.display_currency_id).toBe(2);
    });
  });

  describe('updateLastLogin', () => {
    it('should update user last login', async () => {
      const updated = { ...mockDatabaseRow, last_login: new Date() };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await usersRepository.updateLastLogin('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result!.last_login).toBeInstanceOf(Date);
    });
  });

  describe('getProfile', () => {
    it('should return user profile with currency details', async () => {
      const profileData = {
        ...mockDatabaseRow,
        currency_name: 'US Dollar',
        currency_code: 'USD',
        currency_symbol: '$',
      };
      databaseService.query.mockResolvedValue(createQueryResult([profileData]));

      const result = await usersRepository.getProfile('user-123');

      expect(result).toEqual(profileData);
      expect(result.currency_name).toBe('US Dollar');
      expect(result.currency_code).toBe('USD');
      expect(result.currency_symbol).toBe('$');
    });

    it('should return null if user not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await usersRepository.getProfile('nonexistent');

      expect(result).toBeNull();
    });
  });
});
