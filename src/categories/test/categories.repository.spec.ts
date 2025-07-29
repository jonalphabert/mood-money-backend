import { Test } from '@nestjs/testing';
import { CategoriesRepository } from '../categories.repository';
import { DatabaseService } from '../../database/database.service';
import { Category } from '../category.entity';

// Mock QueryBuilder
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  orWhere: jest.fn().mockReturnThis(),
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

  const mockDatabaseRow = {
    category_id: 1,
    category_name: 'Food',
    category_type: 'expense',
    user_id: 'user123',
    parent_id: null,
    is_active: true,
  };

  const mockCategory = Category.fromDatabaseRow(mockDatabaseRow);

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
        createQueryResult([mockDatabaseRow]),
      );

      const result = await repository.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
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
      const created = {
        ...categoryData,
        category_id: 2,
        parent_id: null,
        is_active: true,
      };
      databaseService.query.mockResolvedValue(createQueryResult([created]));

      const result = await repository.create(categoryData);

      expect(result).toBeInstanceOf(Category);
      expect(result.category_name).toBe('Transportation');
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(categoryData);
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
        createQueryResult([mockDatabaseRow]),
      );

      const result = await repository.findById('1');

      expect(result).toBeInstanceOf(Category);
      expect(result!.category_id).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        '1',
      );
    });

    it('should return null when category not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database timeout');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.findById('1')).rejects.toThrow('Database timeout');
    });
  });

  describe('findByCategoryType', () => {
    it('should return categories by type', async () => {
      const expenseCategories = [
        mockDatabaseRow,
        { ...mockDatabaseRow, category_id: 2 },
      ];
      databaseService.query.mockResolvedValue(
        createQueryResult(expenseCategories),
      );

      const result = await repository.findByCategoryType('expense');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Category);
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
      const updated = { ...mockDatabaseRow, ...updateData };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update('1', updateData);

      expect(result).toBeInstanceOf(Category);
      expect(result!.category_name).toBe('Updated Food');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'category_id',
        '=',
        '1',
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
    });

    it('should return null when update affects no rows', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update('999', updateData);

      expect(result).toBeNull();
    });

    it('should throw error when database constraint violation occurs', async () => {
      const dbError = new Error('foreign key constraint violation');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.update('1', updateData)).rejects.toThrow(
        'foreign key constraint violation',
      );
    });
  });

  describe('findByUserId', () => {
    it('should return categories by user ID', async () => {
      const userCategories = [
        mockDatabaseRow,
        { ...mockDatabaseRow, category_id: 2 },
      ];
      databaseService.query.mockResolvedValue(
        createQueryResult(userCategories),
      );

      const result = await repository.findByUserId('user123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Category);
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
      const filteredCategories = [mockDatabaseRow];
      databaseService.query.mockResolvedValue(
        createQueryResult(filteredCategories),
      );

      const result = await repository.findByUserIdandCategoryType(
        'user123',
        'expense',
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Category);
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

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Query execution error');
      databaseService.query.mockRejectedValue(dbError);

      await expect(
        repository.findByUserIdandCategoryType('user123', 'expense'),
      ).rejects.toThrow('Query execution error');
    });
  });
});
