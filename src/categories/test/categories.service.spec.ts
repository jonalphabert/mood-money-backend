import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { CategoriesRepository } from '../categories.repository';
import { NotFoundError } from 'src/utils/custom_error';
import { Category } from '../category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<CategoriesRepository>;

  const mockDatabaseRow = {
    category_id: 1,
    category_name: 'Food',
    category_type: 'expense',
    user_id: 'user-123',
    parent_id: null,
    is_active: true,
  };

  const mockCategory = Category.fromDatabaseRow(mockDatabaseRow);

  const mockCategoriesRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCategoryType: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdandCategoryType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<CategoriesRepository>(
      CategoriesRepository,
    ) as jest.Mocked<CategoriesRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoriesRepository.findAll.mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(result).toEqual([mockCategory]);
      expect(repository.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById', () => {
    it('should return a category when found', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);

      const result = await service.findById(1);

      expect(result).toEqual(mockCategory);
      expect(repository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundError when category not found', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundError);
      expect(repository.findById).toHaveBeenCalledWith(999);
    });
  });

  describe('findByCategoryType', () => {
    it('should return categories by type', async () => {
      mockCategoriesRepository.findByCategoryType.mockResolvedValue([
        mockCategory,
      ]);

      const result = await service.findByCategoryType('expense');

      expect(result).toEqual([mockCategory]);
      expect(repository.findByCategoryType).toHaveBeenCalledWith('expense');
    });
  });

  describe('findByUserId', () => {
    it('should return categories by user ID', async () => {
      mockCategoriesRepository.findByUserId.mockResolvedValue([mockCategory]);

      const result = await service.findByUserId('user-123');

      expect(result).toEqual([mockCategory]);
      expect(repository.findByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('findByUserIdandCategoryType', () => {
    it('should return categories by user ID and type', async () => {
      mockCategoriesRepository.findByUserIdandCategoryType.mockResolvedValue([
        mockCategory,
      ]);

      const result = await service.findByUserIdandCategoryType(
        'user-123',
        'expense',
      );

      expect(result).toEqual([mockCategory]);
      expect(repository.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user-123',
        'expense',
      );
    });
  });

  describe('create', () => {
    it('should create and return a new category', async () => {
      const createData = {
        category_name: 'Food',
        category_type: 'expense',
        user_id: 'user-123',
      };

      mockCategoriesRepository.create.mockResolvedValue(mockCategory);

      const result = await service.create(createData);

      expect(result).toEqual(mockCategory);
      expect(repository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('update', () => {
    it('should update and return the category', async () => {
      const updateData = { category_name: 'Updated Food' };
      const updatedCategory = Category.fromDatabaseRow({
        ...mockDatabaseRow,
        ...updateData,
      });

      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.update.mockResolvedValue(updatedCategory);

      const result = await service.update(1, updateData);

      expect(result).toEqual(updatedCategory);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, updateData);
    });

    it('should throw NotFoundError when updating non-existent category', async () => {
      const updateData = { category_name: 'Updated Food' };

      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(service.update(999, updateData)).rejects.toThrow(
        NotFoundError,
      );
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when update returns null', async () => {
      const updateData = { category_name: 'Updated Food' };

      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.update.mockResolvedValue(null);

      await expect(service.update(1, updateData)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('delete', () => {
    it('should soft delete a category', async () => {
      const deletedCategory = Category.fromDatabaseRow({
        ...mockDatabaseRow,
        is_active: false,
      });

      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.update.mockResolvedValue(deletedCategory);

      const result = await service.delete(1);

      expect(result).toEqual(deletedCategory);
      expect(repository.findById).toHaveBeenCalledWith(1);
      expect(repository.update).toHaveBeenCalledWith(1, { is_active: false });
    });

    it('should throw NotFoundError when deleting non-existent category', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(null);

      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError when delete returns null', async () => {
      mockCategoriesRepository.findById.mockResolvedValue(mockCategory);
      mockCategoriesRepository.update.mockResolvedValue(null);

      await expect(service.delete(1)).rejects.toThrow(NotFoundError);
    });
  });
});
