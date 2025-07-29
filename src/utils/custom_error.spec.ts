import { CustomDatabaseError, NotFoundError } from './custom_error';

describe('CustomDatabaseError', () => {
  describe('constructor', () => {
    it('should create error with default message', () => {
      const error = new CustomDatabaseError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(CustomDatabaseError);
      expect(error.message).toBe('Database error');
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with custom message', () => {
      const customMessage = 'Connection timeout';
      const error = new CustomDatabaseError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with empty string message', () => {
      const error = new CustomDatabaseError('');

      expect(error.message).toBe('');
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with null message', () => {
      const error = new CustomDatabaseError(null as any);

      expect(error.message).toBe('null');
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with undefined message', () => {
      const error = new CustomDatabaseError(undefined as any);

      expect(error.message).toBe('Database error');
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with special characters in message', () => {
      const specialMessage = 'Error: "Connection failed" at line 123 & more';
      const error = new CustomDatabaseError(specialMessage);

      expect(error.message).toBe(specialMessage);
      expect(error.name).toBe('DatabaseError');
    });

    it('should create error with very long message', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new CustomDatabaseError(longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.name).toBe('DatabaseError');
    });

    it('should have proper stack trace', () => {
      const error = new CustomDatabaseError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('DatabaseError');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new CustomDatabaseError('Test throw');
      }).toThrow('Test throw');

      try {
        throw new CustomDatabaseError('Catch test');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomDatabaseError);
        expect(error.message).toBe('Catch test');
      }
    });
  });
});

describe('NotFoundError', () => {
  describe('constructor', () => {
    it('should create error with default message', () => {
      const error = new NotFoundError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with custom message', () => {
      const customMessage = 'User not found';
      const error = new NotFoundError(customMessage);

      expect(error.message).toBe(customMessage);
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with empty string message', () => {
      const error = new NotFoundError('');

      expect(error.message).toBe('');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with null message', () => {
      const error = new NotFoundError(null as any);

      expect(error.message).toBe('null');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with undefined message', () => {
      const error = new NotFoundError(undefined as any);

      expect(error.message).toBe('Not found');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with numeric message', () => {
      const error = new NotFoundError(404 as any);

      expect(error.message).toBe('404');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with boolean message', () => {
      const error = new NotFoundError(false as any);

      expect(error.message).toBe('false');
      expect(error.name).toBe('NotFoundError');
    });

    it('should create error with object message', () => {
      const objMessage = { id: 123, type: 'user' };
      const error = new NotFoundError(objMessage as any);

      expect(error.message).toBe('[object Object]');
      expect(error.name).toBe('NotFoundError');
    });

    it('should have proper stack trace', () => {
      const error = new NotFoundError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('NotFoundError');
    });

    it('should be throwable and catchable', () => {
      expect(() => {
        throw new NotFoundError('Resource not found');
      }).toThrow('Resource not found');

      try {
        throw new NotFoundError('Category not found');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error.message).toBe('Category not found');
      }
    });

    it('should be distinguishable from other error types', () => {
      const notFoundError = new NotFoundError('Not found');
      const databaseError = new CustomDatabaseError('Database error');
      const genericError = new Error('Generic error');

      expect(notFoundError).toBeInstanceOf(NotFoundError);
      expect(notFoundError).not.toBeInstanceOf(CustomDatabaseError);

      expect(databaseError).toBeInstanceOf(CustomDatabaseError);
      expect(databaseError).not.toBeInstanceOf(NotFoundError);

      expect(genericError).toBeInstanceOf(Error);
      expect(genericError).not.toBeInstanceOf(NotFoundError);
      expect(genericError).not.toBeInstanceOf(CustomDatabaseError);
    });
  });
});
