import { Category } from '../category.entity';

describe('Category Entity', () => {
  const validCategoryData = {
    category_id: '1',
    user_id: 'user-123',
    category_name: 'Food',
    category_type: 'expense',
    parent_id: undefined,
    is_active: true,
  };

  describe('constructor', () => {
    it('should create category with valid data', () => {
      const category = new Category(validCategoryData);

      expect(category.category_id).toBe('1');
      expect(category.category_name).toBe('Food');
      expect(category.category_type).toBe('expense');
      expect(category.user_id).toBe('user-123');
      expect(category.is_active).toBe(true);
    });

    it('should create category with partial data', () => {
      const partialData = {
        category_name: 'Transportation',
        category_type: 'expense',
        user_id: 'user-456',
      };

      const category = new Category(partialData);

      expect(category.category_name).toBe('Transportation');
      expect(category.category_type).toBe('expense');
      expect(category.user_id).toBe('user-456');
    });
  });

  describe('fromDatabaseRow', () => {
    it('should create category from database row', () => {
      const dbRow = {
        category_id: '1',
        user_id: 'user-123',
        category_name: 'Food',
        category_type: 'expense',
        parent_id: null,
        is_active: true,
      };

      const category = Category.fromDatabaseRow(dbRow);

      expect(category.category_id).toBe('1');
      expect(category.category_name).toBe('Food');
      expect(category.category_type).toBe('expense');
      expect(category.user_id).toBe('user-123');
      expect(category.parent_id).toBeNull();
      expect(category.is_active).toBe(true);
    });

    it('should handle missing optional fields', () => {
      const dbRow = {
        category_id: '1',
        user_id: 'user-123',
        category_name: 'Food',
        category_type: 'expense',
        parent_id: undefined,
        is_active: true,
      };

      const category = Category.fromDatabaseRow(dbRow);

      expect(category.category_id).toBe('1');
      expect(category.parent_id).toBeUndefined();
    });
  });

  describe('toDatabaseModel', () => {
    it('should convert category to database model', () => {
      const category = new Category(validCategoryData);
      const dbModel = category.toDatabaseModel();

      expect(dbModel).toEqual({
        category_id: category.category_id,
        user_id: category.user_id,
        category_name: category.category_name,
        category_type: category.category_type,
        parent_id: category.parent_id,
        is_active: category.is_active,
      });
    });

    it('should include undefined fields', () => {
      const category = new Category({
        category_name: 'Food',
        category_type: 'expense',
        user_id: 'user-123',
      });
      const dbModel = category.toDatabaseModel();

      expect(dbModel.category_id).toBeUndefined();
      expect(dbModel.parent_id).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should pass validation for valid category', () => {
      const category = new Category(validCategoryData);

      expect(() => category.validate()).not.toThrow();
    });

    it('should throw error for missing category name', () => {
      const category = new Category({
        category_type: 'expense',
        user_id: 'user-123',
      });

      expect(() => category.validate()).toThrow('Category name is required');
    });

    it('should throw error for empty category name', () => {
      const category = new Category({
        category_name: '',
        category_type: 'expense',
        user_id: 'user-123',
      });

      expect(() => category.validate()).toThrow('Category name is required');
    });

    it('should throw error for missing category type', () => {
      const category = new Category({
        category_name: 'Food',
        user_id: 'user-123',
      });

      expect(() => category.validate()).toThrow('Category type is required');
    });

    it('should throw error for empty category type', () => {
      const category = new Category({
        category_name: 'Food',
        category_type: '',
        user_id: 'user-123',
      });

      expect(() => category.validate()).toThrow('Category type is required');
    });

    it('should throw error for missing user id', () => {
      const category = new Category({
        category_name: 'Food',
        category_type: 'expense',
      });

      expect(() => category.validate()).toThrow('User id is required');
    });

    it('should throw error for empty user id', () => {
      const category = new Category({
        category_name: 'Food',
        category_type: 'expense',
        user_id: '',
      });

      expect(() => category.validate()).toThrow('User id is required');
    });

    it('should throw error for invalid category type', () => {
      const category = new Category({
        category_name: 'Food',
        category_type: 'invalid',
        user_id: 'user-123',
      });

      expect(() => category.validate()).toThrow(
        'Category type must be "expense" or "income"',
      );
    });

    it('should pass validation for income type', () => {
      const category = new Category({
        category_name: 'Salary',
        category_type: 'income',
        user_id: 'user-123',
      });

      expect(() => category.validate()).not.toThrow();
    });
  });

  describe('edge cases', () => {
    it('should preserve all properties when created', () => {
      const fullData = {
        category_id: '1',
        user_id: 'user-123',
        category_name: 'Food',
        category_type: 'expense',
        parent_id: 'parent-1',
        is_active: false,
      };

      const category = new Category(fullData);

      expect(category.parent_id).toBe('parent-1');
      expect(category.is_active).toBe(false);
    });

    it('should handle empty object', () => {
      const category = new Category({});

      expect(category.category_id).toBeUndefined();
      expect(category.category_name).toBeUndefined();
    });
  });
});
