import { Test } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { CategoriesRepository } from '../categories.repository';
import { NotFoundError } from 'src/utils/custom_error';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<CategoriesRepository>;

  const mockCategory = {
    category_id: 1,
    category_name: 'Food',
    category_type: 'expense',
    user_id: 'user123',
    is_active: true,
    created_at: new Date(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByCategoryType: jest.fn(),
            findByUserId: jest.fn(),
            findByUserIdandCategoryType: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(CategoriesService);
    repository = moduleRef.get(
      CategoriesRepository,
    ) as jest.Mocked<CategoriesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [mockCategory, { ...mockCategory, category_id: 2 }];
      repository.findAll.mockResolvedValue(categories);

      const result = await service.findAll();

      expect(result).toEqual(categories);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no categories exist', async () => {
      repository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error('Database connection failed');
      repository.findAll.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return category when found', async () => {
      repository.findById.mockResolvedValue(mockCategory);

      const result = await service.findById(1);

      expect(result).toEqual(mockCategory);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when category not found', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
      await expect(service.findById(999)).rejects.toThrow('Category not found');
      expect(repository.findById).toHaveBeenCalledWith(999);
    });

    it('should handle zero ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.findById(0)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(0);
    });

    it('should handle negative ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.findById(-1)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(-1);
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error('Database timeout');
      repository.findById.mockRejectedValue(dbError);

      await expect(service.findById(1)).rejects.toThrow('Database timeout');
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should handle null return from repository', async () => {
      repository.findById.mockResolvedValue(null as any);

      await expect(service.findById(1)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCategoryType', () => {
    it('should return categories by type', async () => {
      const expenseCategories = [
        mockCategory,
        { ...mockCategory, category_id: 2 },
      ];
      repository.findByCategoryType.mockResolvedValue(expenseCategories);

      const result = await service.findByCategoryType('expense');

      expect(result).toEqual(expenseCategories);
      expect(repository.findByCategoryType).toHaveBeenCalledWith('expense');
    });

    it('should return empty array when no categories of type exist', async () => {
      repository.findByCategoryType.mockResolvedValue([]);

      const result = await service.findByCategoryType('nonexistent');

      expect(result).toEqual([]);
      expect(repository.findByCategoryType).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle empty string category type', async () => {
      repository.findByCategoryType.mockResolvedValue([]);

      const result = await service.findByCategoryType('');

      expect(result).toEqual([]);
      expect(repository.findByCategoryType).toHaveBeenCalledWith('');
    });

    it('should handle null category type', async () => {
      repository.findByCategoryType.mockResolvedValue([]);

      const result = await service.findByCategoryType(null as any);

      expect(result).toEqual([]);
      expect(repository.findByCategoryType).toHaveBeenCalledWith(null);
    });

    it('should handle special characters in category type', async () => {
      const specialType = 'expense%_test\\';
      repository.findByCategoryType.mockResolvedValue([]);

      const result = await service.findByCategoryType(specialType);

      expect(result).toEqual([]);
      expect(repository.findByCategoryType).toHaveBeenCalledWith(specialType);
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error('Query execution failed');
      repository.findByCategoryType.mockRejectedValue(dbError);

      await expect(service.findByCategoryType('expense')).rejects.toThrow(
        'Query execution failed',
      );
      expect(repository.findByCategoryType).toHaveBeenCalledWith('expense');
    });
  });

  describe('findByUserId', () => {
    it('should return categories by user ID', async () => {
      const userCategories = [
        mockCategory,
        { ...mockCategory, category_id: 2 },
      ];
      repository.findByUserId.mockResolvedValue(userCategories);

      const result = await service.findByUserId('user123');

      expect(result).toEqual(userCategories);
      expect(repository.findByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return empty array when user has no categories', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId('nonexistent');

      expect(result).toEqual([]);
      expect(repository.findByUserId).toHaveBeenCalledWith('nonexistent');
    });

    it('should handle empty string user ID', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId('');

      expect(result).toEqual([]);
      expect(repository.findByUserId).toHaveBeenCalledWith('');
    });

    it('should handle null user ID', async () => {
      repository.findByUserId.mockResolvedValue([]);

      const result = await service.findByUserId(null as any);

      expect(result).toEqual([]);
      expect(repository.findByUserId).toHaveBeenCalledWith(null);
    });

    it('should handle UUID format user ID', async () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      repository.findByUserId.mockResolvedValue([mockCategory]);

      const result = await service.findByUserId(uuid);

      expect(result).toEqual([mockCategory]);
      expect(repository.findByUserId).toHaveBeenCalledWith(uuid);
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error('Connection timeout');
      repository.findByUserId.mockRejectedValue(dbError);

      await expect(service.findByUserId('user123')).rejects.toThrow(
        'Connection timeout',
      );
      expect(repository.findByUserId).toHaveBeenCalledWith('user123');
    });
  });

  describe('findByUserIdandCategoryType', () => {
    it('should return categories by user ID and category type', async () => {
      const filteredCategories = [mockCategory];
      repository.findByUserIdandCategoryType.mockResolvedValue(
        filteredCategories,
      );

      const result = await service.findByUserIdandCategoryType(
        'user123',
        'expense',
      );

      expect(result).toEqual(filteredCategories);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user123',
        'expense',
      );
    });

    it('should return empty array when no matching categories exist', async () => {
      repository.findByUserIdandCategoryType.mockResolvedValue([]);

      const result = await service.findByUserIdandCategoryType(
        'user123',
        'nonexistent',
      );

      expect(result).toEqual([]);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user123',
        'nonexistent',
      );
    });

    it('should handle empty string parameters', async () => {
      repository.findByUserIdandCategoryType.mockResolvedValue([]);

      const result = await service.findByUserIdandCategoryType('', '');

      expect(result).toEqual([]);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        '',
        '',
      );
    });

    it('should handle null parameters', async () => {
      repository.findByUserIdandCategoryType.mockResolvedValue([]);

      const result = await service.findByUserIdandCategoryType(
        null as any,
        null as any,
      );

      expect(result).toEqual([]);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        null,
        null,
      );
    });

    it('should handle mixed valid and invalid parameters', async () => {
      repository.findByUserIdandCategoryType.mockResolvedValue([]);

      const result = await service.findByUserIdandCategoryType('user123', '');

      expect(result).toEqual([]);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user123',
        '',
      );
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error('Query execution error');
      repository.findByUserIdandCategoryType.mockRejectedValue(dbError);

      await expect(
        service.findByUserIdandCategoryType('user123', 'expense'),
      ).rejects.toThrow('Query execution error');
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user123',
        'expense',
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
      repository.create.mockResolvedValue(created);

      const result = await service.create(categoryData);

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith(categoryData);
    });

    it('should handle empty object input', async () => {
      const emptyData = {};
      repository.create.mockResolvedValue(undefined);

      const result = await service.create(emptyData);

      expect(result).toBeUndefined();
      expect(repository.create).toHaveBeenCalledWith(emptyData);
    });

    it('should handle null values in input', async () => {
      const dataWithNulls = {
        category_name: null,
        category_type: 'income',
        user_id: 'user789',
      };
      const created = { ...dataWithNulls, category_id: 3 };
      repository.create.mockResolvedValue(created);

      const result = await service.create(dataWithNulls);

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith(dataWithNulls);
    });

    it('should handle undefined input', async () => {
      repository.create.mockResolvedValue(undefined);

      const result = await service.create(undefined);

      expect(result).toBeUndefined();
      expect(repository.create).toHaveBeenCalledWith(undefined);
    });

    it('should throw error when repository fails', async () => {
      const dbError = new Error(
        'duplicate key value violates unique constraint',
      );
      repository.create.mockRejectedValue(dbError);

      await expect(service.create(categoryData)).rejects.toThrow(
        'duplicate key value violates unique constraint',
      );
      expect(repository.create).toHaveBeenCalledWith(categoryData);
    });

    it('should handle special characters in category data', async () => {
      const specialData = {
        category_name: 'Food & Drinks %_test\\',
        category_type: 'expense',
        user_id: 'user@123',
      };
      const created = { ...specialData, category_id: 4 };
      repository.create.mockResolvedValue(created);

      const result = await service.create(specialData);

      expect(result).toEqual(created);
      expect(repository.create).toHaveBeenCalledWith(specialData);
    });
  });

  describe('update', () => {
    const updateData = { category_name: 'Updated Food' };

    it('should update and return category when category exists', async () => {
      const updated = { ...mockCategory, ...updateData };
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(updated);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updated);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundError when category does not exist', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundError,
      );
      await expect(service.update(999, updateData)).rejects.toThrow(
        'Category not found',
      );
      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle empty update data', async () => {
      const emptyUpdate = {};
      const updated = { ...mockCategory };
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(updated);

      const result = await service.update(1, emptyUpdate);

      expect(result).toEqual(updated);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, emptyUpdate);
    });

    it('should handle multiple field updates', async () => {
      const multiUpdate = {
        category_name: 'New Name',
        category_type: 'income',
      };
      const updated = { ...mockCategory, ...multiUpdate };
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(updated);

      const result = await service.update(1, multiUpdate);

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(1, multiUpdate);
    });

    it('should handle null values in update data', async () => {
      const updateWithNulls = {
        category_name: null,
        category_type: 'expense',
      };
      const updated = { ...mockCategory, ...updateWithNulls };
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(updated);

      const result = await service.update(1, updateWithNulls);

      expect(result).toEqual(updated);
      expect(repository.update).toHaveBeenCalledWith(1, updateWithNulls);
    });

    it('should handle zero ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.update(0, updateData)).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith(0);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle negative ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.update(-1, updateData)).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith(-1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw error when findById fails', async () => {
      const dbError = new Error('Database timeout');
      repository.findById.mockRejectedValue(dbError);

      await expect(service.update(1, updateData)).rejects.toThrow(
        'Database timeout',
      );
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      const dbError = new Error('foreign key constraint violation');
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockRejectedValue(dbError);

      await expect(service.update(1, updateData)).rejects.toThrow(
        'foreign key constraint violation',
      );
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should handle null return from findById', async () => {
      repository.findById.mockResolvedValue(null as any);

      await expect(service.update(1, updateData)).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle undefined input data', async () => {
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(mockCategory);

      const result = await service.update(1, undefined);

      expect(result).toEqual(mockCategory);
      expect(repository.update).toHaveBeenCalledWith(1, undefined);
    });
  });

  describe('delete', () => {
    it('should soft delete category when category exists', async () => {
      const softDeleted = { ...mockCategory, is_active: false };
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockResolvedValue(softDeleted);

      const result = await service.delete(1);

      expect(result).toEqual(softDeleted);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { is_active: false });
    });

    it('should throw NotFoundError when category does not exist', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
      await expect(service.delete(999)).rejects.toThrow('Category not found');
      expect(repository.findById).toHaveBeenCalledWith(999);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle zero ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.delete(0)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(0);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle negative ID', async () => {
      repository.findById.mockResolvedValue(undefined);

      await expect(service.delete(-1)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(-1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should handle null return from findById', async () => {
      repository.findById.mockResolvedValue(null as any);

      await expect(service.delete(1)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw error when findById fails', async () => {
      const dbError = new Error('Database timeout');
      repository.findById.mockRejectedValue(dbError);

      await expect(service.delete(1)).rejects.toThrow('Database timeout');
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw error when update fails', async () => {
      const dbError = new Error('Database constraint violation');
      repository.findById.mockResolvedValue(mockCategory);
      repository.update.mockRejectedValue(dbError);

      await expect(service.delete(1)).rejects.toThrow(
        'Database constraint violation',
      );
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { is_active: false });
    });

    it('should handle very large ID numbers', async () => {
      const largeId = 999999999;
      repository.findById.mockResolvedValue(undefined);

      await expect(service.delete(largeId)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(largeId);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
