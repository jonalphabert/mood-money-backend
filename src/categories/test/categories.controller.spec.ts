import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category } from '../category.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../../users/user.entity';

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

  const mockUser = new User({
    user_id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    is_verified: true,
    token_version: 1,
    refresh_token: 'refresh-token',
    verification_code: undefined,
    created_at: new Date(),
    last_login: new Date(),
    display_currency_id: 1,
  });

  const mockCategoriesService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findByCategoryType: jest.fn(),
    findByUserIdandCategoryType: jest.fn(),
    create: jest.fn(),
    createByUser: jest.fn(),
    update: jest.fn(),
    updateByUser: jest.fn(),
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

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

  describe('findMyCategories', () => {
    it('should return current user categories', async () => {
      mockCategoriesService.findByUserId.mockResolvedValue([mockCategory]);

      const result = await controller.findMyCategories(mockUser);

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

  describe('findMyCategoriesByType', () => {
    it('should return current user categories by type', async () => {
      mockCategoriesService.findByUserIdandCategoryType.mockResolvedValue([
        mockCategory,
      ]);

      const result = await controller.findMyCategoriesByType(
        mockUser,
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

      expect(service.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('create', () => {
    it('should create a new category with current user ID', async () => {
      const createDto = {
        category_name: 'Food',
        category_type: 'expense',
      } as CreateCategoryDto;
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto, mockUser);

      expect(service.create).toHaveBeenCalledWith({
        ...createDto,
        user_id: 'user-123',
      });
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

      expect(service.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('createByUser', () => {
    it('should create category by user', async () => {
      const createDto = {
        category_name: 'Food',
        category_type: 'expense',
      } as CreateCategoryDto;
      mockCategoriesService.createByUser.mockResolvedValue(mockCategory);

      const result = await controller.createByUser(createDto, mockUser);

      expect(service.createByUser).toHaveBeenCalledWith(createDto, 'user-123');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateByUser', () => {
    it('should update category by user', async () => {
      const updateDto: UpdateCategoryDto = {
        category_name: 'Updated Food',
      };
      mockCategoriesService.updateByUser.mockResolvedValue(mockCategory);

      const result = await controller.updateByUser('1', updateDto, mockUser);

      expect(service.updateByUser).toHaveBeenCalledWith(
        '1',
        updateDto,
        'user-123',
      );
      expect(result).toEqual(mockCategory);
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

      expect(service.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(deletedCategory);
    });
  });
});
