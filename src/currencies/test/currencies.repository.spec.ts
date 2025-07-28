import { Test } from '@nestjs/testing';
import { CurrencyRepository } from '../currencies.repository';
import { DatabaseService } from '../../database/database.service';

// Mock QueryBuilder
const mockQueryBuilder = {
  where: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnValue({ sql: 'INSERT SQL', params: [] }),
  offsetRecords: jest.fn().mockReturnThis(),
  limitRecords: jest.fn().mockReturnThis(),
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

describe('CurrencyRepository', () => {
  let repository: CurrencyRepository;
  let databaseService: jest.Mocked<DatabaseService>;

  const mockCurrency = {
    currency_id: 1,
    currency_code: 'USD',
    currency_name: 'US Dollar',
    currency_symbol: '$',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CurrencyRepository,
        {
          provide: DatabaseService,
          useValue: { query: jest.fn() },
        },
      ],
    }).compile();

    repository = moduleRef.get(CurrencyRepository);
    databaseService = moduleRef.get(
      DatabaseService,
    ) as jest.Mocked<DatabaseService>;
  });

  describe('findAll', () => {
    it('should return all currencies', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCurrency]),
      );

      const result = await repository.findAll();

      expect(result).toEqual([mockCurrency]);
      expect(mockQueryBuilder.build).toHaveBeenCalled();
      expect(databaseService.query).toHaveBeenCalledWith('SELECT SQL', []);
    });

    it('should return empty array if no currencies exist', async () => {
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

  describe('findById', () => {
    it('should return a currency by ID', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCurrency]),
      );

      const result = await repository.findById(1);

      expect(result).toEqual(mockCurrency);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
        '=',
        1,
      );
    });

    it('should return undefined if currency not found', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(999);

      expect(result).toBeUndefined();
    });

    it('should handle zero ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(0);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
        '=',
        0,
      );
    });

    it('should handle negative ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.findById(-1);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
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

  describe('searchByName', () => {
    it('should return matched currencies with pagination', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCurrency], 1),
      );

      const result = await repository.searchByName('Dollar', 0, 10);

      expect(result).toEqual({ data: [mockCurrency], total: 1 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_name',
        'ILIKE',
        '%Dollar%',
      );
      expect(mockQueryBuilder.offsetRecords).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.limitRecords).toHaveBeenCalledWith(10);
    });

    it('should escape special characters for LIKE', async () => {
      const input = '100%_Dollar\\';
      const escaped = '100\\%\\_Dollar\\\\';
      databaseService.query.mockResolvedValue(createQueryResult([]));

      await repository.searchByName(input, 5, 10);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_name',
        'ILIKE',
        `%${escaped}%`,
      );
    });

    it('should handle empty search term', async () => {
      databaseService.query.mockResolvedValue(
        createQueryResult([mockCurrency]),
      );

      const result = await repository.searchByName('', 0, 10);

      expect(result).toEqual({ data: [mockCurrency], total: 1 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_name',
        'ILIKE',
        '%%',
      );
    });

    it('should handle whitespace-only search term', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.searchByName('   ', 0, 10);

      expect(result).toEqual({ data: [], total: 0 });
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_name',
        'ILIKE',
        '%   %',
      );
    });

    it('should handle zero offset and limit', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      await repository.searchByName('test', 0, 0);

      expect(mockQueryBuilder.offsetRecords).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.limitRecords).toHaveBeenCalledWith(0);
    });

    it('should handle large offset and limit values', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      await repository.searchByName('test', 1000000, 999999);

      expect(mockQueryBuilder.offsetRecords).toHaveBeenCalledWith(1000000);
      expect(mockQueryBuilder.limitRecords).toHaveBeenCalledWith(999999);
    });

    it('should return empty result if no match', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([], 0));

      const result = await repository.searchByName('XXX', 0, 10);

      expect(result).toEqual({ data: [], total: 0 });
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Search query failed');
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.searchByName('test', 0, 10)).rejects.toThrow(
        'Search query failed',
      );
    });
  });

  describe('create', () => {
    const input = {
      currency_code: 'EUR',
      currency_name: 'Euro',
      currency_symbol: '€',
    };

    it('should create and return a new currency', async () => {
      const inserted = { ...input, currency_id: 2 };
      databaseService.query.mockResolvedValue(createQueryResult([inserted]));

      const result = await repository.create(input);

      expect(result).toEqual(inserted);
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(input);
    });

    it('should return undefined if insertion fails', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.create(input);

      expect(result).toBeUndefined();
    });

    it('should handle empty object input', async () => {
      const emptyInput = {};
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.create(emptyInput);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(emptyInput);
    });

    it('should handle null values in input', async () => {
      const inputWithNulls = {
        currency_code: null,
        currency_name: 'Test',
        currency_symbol: null,
      };
      const inserted = { ...inputWithNulls, currency_id: 3 };
      databaseService.query.mockResolvedValue(createQueryResult([inserted]));

      const result = await repository.create(inputWithNulls);

      expect(result).toEqual(inserted);
    });

    it('should throw error when database constraint violation occurs', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint',
      );
      databaseService.query.mockRejectedValue(dbError);

      await expect(repository.create(input)).rejects.toThrow(
        'duplicate key value violates unique constraint',
      );
    });
  });

  describe('update', () => {
    const updateData = { currency_name: 'New Name' };

    it('should update and return the currency', async () => {
      const updated = { ...mockCurrency, ...updateData };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, updateData);

      expect(result).toEqual(updated);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
        '=',
        1,
      );
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updateData);
    });

    it('should return undefined if update affects no rows', async () => {
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
        currency_name: 'Updated Name',
        currency_symbol: '¥',
        currency_code: 'JPY',
      };
      const updated = { ...mockCurrency, ...multiUpdate };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, multiUpdate);

      expect(result).toEqual(updated);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(multiUpdate);
    });

    it('should handle null values in update data', async () => {
      const updateWithNulls = {
        currency_name: null,
        currency_symbol: 'Updated Symbol',
      };
      const updated = { ...mockCurrency, ...updateWithNulls };
      databaseService.query.mockResolvedValue(createQueryResult([updated]));

      const result = await repository.update(1, updateWithNulls);

      expect(result).toEqual(updated);
    });

    it('should handle zero ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(0, updateData);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
        '=',
        0,
      );
    });

    it('should handle negative ID', async () => {
      databaseService.query.mockResolvedValue(createQueryResult([]));

      const result = await repository.update(-1, updateData);

      expect(result).toBeUndefined();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'currency_id',
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

  describe('sanitizeForLike (private method)', () => {
    it('should escape percent characters', () => {
      const result = (repository as any).sanitizeForLike('100%');
      expect(result).toBe('100\\%');
    });

    it('should escape underscore characters', () => {
      const result = (repository as any).sanitizeForLike('test_value');
      expect(result).toBe('test\\_value');
    });

    it('should escape backslash characters', () => {
      const result = (repository as any).sanitizeForLike('path\\to\\file');
      expect(result).toBe('path\\\\to\\\\file');
    });

    it('should escape multiple special characters', () => {
      const result = (repository as any).sanitizeForLike('100%_test\\');
      expect(result).toBe('100\\%\\_test\\\\');
    });

    it('should handle empty string', () => {
      const result = (repository as any).sanitizeForLike('');
      expect(result).toBe('');
    });

    it('should handle string without special characters', () => {
      const result = (repository as any).sanitizeForLike('normaltext');
      expect(result).toBe('normaltext');
    });
  });
});
