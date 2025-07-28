import { Test } from '@nestjs/testing';
import { CategoriesRepository } from '../categories.repository';
import { DatabaseService } from '../../database/database.service';

// Mock QueryBuilder
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnValue({ sql: 'INSERT SQL', params: [] }),
  build: jest.fn().mockReturnValue({ sql: 'SELECT SQL', params: [] }),
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

describe('CategoriesRepository', () => {
  let repository: CategoriesRepository;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockCategory = {
    category_id: 1,
    category_name: 'Food',
    category_type: 'expense',
    user_id: 'user123',
    created_at: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesRepository,
        {
          provide: DatabaseService,
          useValue: { query: jest.fn() },
        },
      ],
    }).compile();

    repository = moduleRef.get(CategoriesRepository);
    databaseService = moduleRef.get(
      DatabaseService,
    ) as jest.Mocked<DatabaseService>;
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCategory]),
      );

      const result = await repository.findAll();

      expect(result).toEqual([mockCategory]);
      expect(mockQueryBuilder.build).toHaveBeenCalled();
      expect(databaseService.query).toHaveBeenCalledWith('SELECT SQL', []);
    });

    it('should return empty array when no categories exist', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('create', () => {
    const categoryData = {
      category_name: 'Transportation',
      category_type: 'expense',
      user_id: 'user456',
    };

    it('should create and return new category', async () => {
      const created = { ...categoryData, category_id: 2 };
      databaseService.query.mockResolvedValue(createQueryResult([created]));

      const result = await repository.create(categoryData);

      expect(result).toEqual(created);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(categoryData);
    });

    it('should return undefined when insertion fails', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.create(categoryData);

      expect(result).toBeUndefined();
    });

    it('should handle empty object input', async () => {
      const emptyData = {};
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.create(emptyData);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(emptyData);
    });

    it('should handle null values in input', async () => {
      const dataWithNulls = {
        category_name: null,
        category_type: 'income',
        user_id: 'user789',
      };
      const created = { ...dataWithNulls, category_id: 3 };
      databaseService.query.mockResolvedValue(createQueryResult([created]));

      const result = await repository.create(dataWithNulls);

      expect(result).toEqual(created);
    });

    it('should throw error when database constraint violation occurs', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint',
      );
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.create(categoryData)).rejects.toThrow(
        'duplicate key value violates unique constraint',
      );
    });
  });

  describe('findById', () => {
    it('should return category by ID', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCategory]),
      );

      const result = await repository.findById(1);

      expect(result).toEqual(mockCategory);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        1,
      );
    });

    it('should return undefined when category not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(999);

      expect(result).toBeUndefined();
    });

    it('should handle zero ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(0);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        0,
      );
    });

    it('should handle negative ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(-1);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        -1,
      );
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database timeout');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.findById(1)).rejects.toThrow('Database timeout');
    });
  });

  describe('findByCategoryType', () => {
    it('should return categories by type', async () => {
      const expenseCategories = [
        mockCategory,
        { ...mockCategory, category_id: 2 },
      ];
      databaseService.query.mockResolvedValue(
        createQueryResult(expenseCategories),
      );

      const result = await repository.findByCategoryType('expense');

      expect(result).toEqual(expenseCategories);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        'expense',
      );
    });

    it('should return empty array when no categories of type exist', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByCategoryType('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle empty string category type', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByCategoryType('');

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        '',
      );
    });

    it('should handle null category type', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByCategoryType(null as any);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        null,
      );
    });

    it('should handle special characters in category type', async () => {
      const specialType = 'expense%_test\\';
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByCategoryType(specialType);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        specialType,
      );
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Query execution failed');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.findByCategoryType('expense')).rejects.toThrow(
        'Query execution failed',
      );
    });
  });

  describe('update', () => {
    const updateData = { category_name: 'Updated Food' };

    it('should update and return category', async () => {
      const updated = { ...mockCategory, ...updateData };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, updateData);

      expect(result).toEqual(updated);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        1,
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
    });

    it('should return undefined when update affects no rows', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(999, updateData);

      expect(result).toBeUndefined();
    });

    it('should handle empty update data', async () => {
      const emptyUpdate = {};
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(1, emptyUpdate);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(emptyUpdate);
    });

    it('should handle multiple field updates', async () => {
      const multiUpdate = {
        category_name: 'New Name',
        category_type: 'income',
      };
      const updated = { ...mockCategory, ...multiUpdate };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, multiUpdate);

      expect(result).toEqual(updated);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(multiUpdate);
    });

    it('should handle null values in update data', async () => {
      const updateWithNulls = {
        category_name: null,
        category_type: 'expense',
      };
      const updated = { ...mockCategory, ...updateWithNulls };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, updateWithNulls);

      expect(result).toEqual(updated);
    });

    it('should handle zero ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(0, updateData);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        0,
      );
    });

    it('should handle negative ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(-1, updateData);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        -1,
      );
    });

    it('should throw error when database constraint violation occurs', async () => {
      const dbError = new Error('foreign key constraint violation');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.update(1, updateData)).rejects.toThrow(
        'foreign key constraint violation',
      );
    });
  });

  describe('findByUserId', () => {
    it('should return categories by user ID', async () => {
      const userCategories = [
        mockCategory,
        { ...mockCategory, category_id: 2 },
      ];
      databaseService.query.mockResolvedValue(
        createQueryResult(userCategories),
      );

      const result = await repository.findByUserId('user123');

      expect(result).toEqual(userCategories);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        'user123',
      );
    });

    it('should return empty array when user has no categories', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserId('nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle empty string user ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserId('');

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', '=', '');
    });

    it('should handle null user ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserId(null as any);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', '=', null);
    });

    it('should handle UUID format user ID', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCategory]),
      );

      const result = await repository.findByUserId(uuid);

      expect(result).toEqual([mockCategory]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', '=', uuid);
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = 'user@123_test%';
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserId(specialUserId);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        specialUserId,
      );
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Connection timeout');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.findByUserId('user123')).rejects.toThrow(
        'Connection timeout',
      );
    });
  });

  describe('findByUserIdandCategoryType', () => {
    it('should return categories by user ID and category type', async () => {
      const filteredCategories = [mockCategory];
      databaseService.query.mockResolvedValue(
        createQueryResult(filteredCategories),
      );

      const result = await repository.findByUserIdandCategoryType(
        'user123',
        'expense',
      );

      expect(result).toEqual(filteredCategories);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        'user123',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        'expense',
      );
    });

    it('should return empty array when no matching categories exist', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType(
        'user123',
        'nonexistent',
      );

      expect(result).toEqual([]);
    });

    it('should handle empty string parameters', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType('', '');

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', '=', '');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        '',
      );
    });

    it('should handle null parameters', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType(
        null as any,
        null as any,
      );

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', '=', null);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        null,
      );
    });

    it('should handle mixed valid and invalid parameters', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType(
        'user123',
        '',
      );

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        'user123',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        '',
      );
    });

    it('should handle special characters in both parameters', async () => {
      const specialUserId = 'user@123%';
      const specialType = 'type_with%special\\chars';
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType(
        specialUserId,
        specialType,
      );

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        specialUserId,
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        specialType,
      );
    });

    it('should handle very long parameter values', async () => {
      const longUserId = 'a'.repeat(1000);
      const longType = 'b'.repeat(500);
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findByUserIdandCategoryType(
        longUserId,
        longType,
      );

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user_id',
        '=',
        longUserId,
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_type',
        '=',
        longType,
      );
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Query execution error');
      databaseService.query.mockRejectedValue(dbError);

      await expect(
        repository.findByUserIdandCategoryType('user123', 'expense'),
      ).rejects.toThrow('Query execution error');
    });
  });
});
