import { User } from '../user.entity';

describe('User Entity', () => {
  const validUserData = {
    user_id: 'user-123',
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    display_currency_id: 1,
    is_active: true,
    token_version: 0,
  };

  describe('constructor', () => {
    it('should create user with valid data', () => {
      const user = new User(validUserData);

      expect(user.user_id).toBe('user-123');
      expect(user.username).toBe('johndoe');
      expect(user.email).toBe('john@example.com');
      expect(user.is_active).toBe(true);
      expect(user.created_at).toBeInstanceOf(Date);
    });

    it('should set default values', () => {
      const minimalData = {
        username: 'janedoe',
        email: 'jane@example.com',
        password: 'password123',
      };

      const user = new User(minimalData);

      expect(user.is_active).toBe(true);
      expect(user.created_at).toBeInstanceOf(Date);
    });

    it('should throw error if username is missing', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'password123',
      };

      expect(() => new User(invalidData)).toThrow('Name is required');
    });

    it('should throw error if email is missing', () => {
      const invalidData = {
        username: 'johndoe',
        password: 'password123',
      };

      expect(() => new User(invalidData)).toThrow('Email is required');
    });

    it('should throw error if password is missing', () => {
      const invalidData = {
        username: 'johndoe',
        email: 'john@example.com',
      };

      expect(() => new User(invalidData)).toThrow('Password is required');
    });
  });

  describe('fromDatabaseRow', () => {
    it('should create user from database row', () => {
      const dbRow = {
        user_id: 'user-123',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        display_currency_id: 1,
        last_login: '2023-01-01T00:00:00Z',
        is_active: true,
        created_at: '2023-01-01T00:00:00Z',
        refresh_token: ['token1', 'token2'],
        token_version: 1,
      };

      const user = User.fromDatabaseRow(dbRow);

      expect(user.user_id).toBe('user-123');
      expect(user.username).toBe('johndoe');
      expect(user.last_login).toBeInstanceOf(Date);
      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.refresh_token).toEqual(['token1', 'token2']);
      expect(user.token_version).toBe(1);
    });

    it('should handle null dates from database', () => {
      const dbRow = {
        user_id: 'user-123',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'hashedpassword',
        is_active: true,
        last_login: null,
        created_at: null,
        token_version: 0,
      };

      const user = User.fromDatabaseRow(dbRow);

      expect(user.created_at).toBeInstanceOf(Date);
      expect(user.last_login).toBeUndefined();
    });
  });

  describe('validate', () => {
    it('should pass validation for valid user', () => {
      const user = new User(validUserData);

      expect(() => user.validate()).not.toThrow();
    });

    it('should throw error for invalid email format', () => {
      const user = new User({
        ...validUserData,
        email: 'invalid-email',
      });

      expect(() => user.validate()).toThrow('Invalid email format');
    });

    it('should throw error for short password', () => {
      const user = new User({
        ...validUserData,
        password: '123',
      });

      expect(() => user.validate()).toThrow(
        'Password must be at least 6 characters',
      );
    });
  });

  describe('business methods', () => {
    it('should activate user', () => {
      const user = new User({ ...validUserData, is_active: false });

      user.activate();

      expect(user.is_active).toBe(true);
    });

    it('should deactivate user', () => {
      const user = new User(validUserData);

      user.deactivate();

      expect(user.is_active).toBe(false);
    });

    it('should update last login', () => {
      const user = new User(validUserData);
      const beforeUpdate = new Date();

      user.updateLastLogin();

      expect(user.last_login).toBeInstanceOf(Date);
      expect(user.last_login!.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });
  });
});
