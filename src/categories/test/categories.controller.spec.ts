import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockDatabaseRow = {
    category_id: 1,
    category_name: 'Food',
    category_type: 'expense',
    user_id: 'user-123',
    parent_id: null,
    is_active: true,
  };

  const mockCategory = Category.fromDatabaseRow(mockDatabaseRow);

  const mockCategoriesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByCategoryType: jest.fn(),
    findByUserIdandCategoryType: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findByUserId', () => {
    it('should return categories by user ID', async () => {
      mockCategoriesService.findByUserId.mockResolvedValue([mockCategory]);

      const result = await controller.findByUserId('user-123');

      expect(service.findByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findByCategoryType', () => {
    it('should return categories by type', async () => {
      mockCategoriesService.findByCategoryType.mockResolvedValue([
        mockCategory,
      ]);

      const result = await controller.findByCategoryType('expense');

      expect(service.findByCategoryType).toHaveBeenCalledWith('expense');
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findByUserIdandCategoryType', () => {
    it('should return categories by user ID and type', async () => {
      mockCategoriesService.findByUserIdandCategoryType.mockResolvedValue([
        mockCategory,
      ]);

      const result = await controller.findByUserIdandCategoryType(
        'user-123',
        'expense',
      );

      expect(service.findByUserIdandCategoryType).toHaveBeenCalledWith(
        'user-123',
        'expense',
      );
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findOne', () => {
    it('should return a category by ID', async () => {
      mockCategoriesService.findById.mockResolvedValue(mockCategory);

      const result = await controller.findOne('1');

      expect(service.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createDto: CreateCategoryDto = {
        category_name: 'Food',
        category_type: 'expense',
        user_id: 'user-123',
      };
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateDto: UpdateCategoryDto = {
        category_name: 'Updated Food',
      };
      const updatedCategory = Category.fromDatabaseRow({
        ...mockDatabaseRow,
        category_name: 'Updated Food',
      });
      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update('1', updateDto);

      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      const deletedCategory = Category.fromDatabaseRow({
        ...mockDatabaseRow,
        is_active: false,
      });
      mockCategoriesService.delete.mockResolvedValue(deletedCategory);

      const result = await controller.delete('1');

      expect(service.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual(deletedCategory);
    });
  });
});
