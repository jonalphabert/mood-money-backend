import { QueryBuilder } from './query-builder';

describe('QueryBuilder', () => {
  describe('constructor', () => {
    it('should create QueryBuilder with table name', () => {
      const qb = new QueryBuilder('users');
      const result = qb.build();

      expect(result.sql).toBe('SELECT * FROM users');
      expect(result.params).toEqual([]);
    });

    it('should handle table name with special characters', () => {
      const qb = new QueryBuilder('user_profiles');
      const result = qb.build();

      expect(result.sql).toBe('SELECT * FROM user_profiles');
    });

    it('should handle empty table name', () => {
      const qb = new QueryBuilder('');
      const result = qb.build();

      expect(result.sql).toBe('SELECT * FROM ');
    });
  });

  describe('select', () => {
    it('should select specific fields', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select(['id', 'name', 'email']).build();

      expect(result.sql).toBe('SELECT id, name, email FROM users');
      expect(result.params).toEqual([]);
    });

    it('should handle single field selection', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select(['id']).build();

      expect(result.sql).toBe('SELECT id FROM users');
    });

    it('should handle empty fields array', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select([]).build();

      expect(result.sql).toBe('SELECT  FROM users');
    });

    it('should handle fields with special characters', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select(['user_id', 'created_at', 'is_active']).build();

      expect(result.sql).toBe(
        'SELECT user_id, created_at, is_active FROM users',
      );
    });

    it('should override previous select', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select(['id']).select(['name', 'email']).build();

      expect(result.sql).toBe('SELECT name, email FROM users');
    });
  });

  describe('where', () => {
    it('should add single where condition', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('id', '=', 1).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE id = $1');
      expect(result.params).toEqual([1]);
    });

    it('should add multiple where conditions', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('id', '=', 1)
        .where('status', '=', 'active')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE id = $1 AND status = $2',
      );
      expect(result.params).toEqual([1, 'active']);
    });

    it('should handle different operators', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('age', '>', 18)
        .where('name', 'LIKE', '%john%')
        .where('score', '<=', 100)
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE age > $1 AND name LIKE $2 AND score <= $3',
      );
      expect(result.params).toEqual([18, '%john%', 100]);
    });

    it('should handle null values', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('deleted_at', 'IS', null).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE deleted_at IS $1');
      expect(result.params).toEqual([null]);
    });

    it('should handle boolean values', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('is_active', '=', true).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE is_active = $1');
      expect(result.params).toEqual([true]);
    });

    it('should handle string values with special characters', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('email', '=', "test'@example.com").build();

      expect(result.sql).toBe('SELECT * FROM users WHERE email = $1');
      expect(result.params).toEqual(["test'@example.com"]);
    });

    it('should handle array values', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('id', 'IN', [1, 2, 3]).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE id IN $1');
      expect(result.params).toEqual([[1, 2, 3]]);
    });

    it('should handle IS NULL operator', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('deleted_at', 'IS NULL', null).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE deleted_at IS NULL');
      expect(result.params).toEqual([]);
    });

    it('should handle IS NOT NULL operator', () => {
      const qb = new QueryBuilder('users');
      const result = qb.where('email', 'IS NOT NULL', null).build();

      expect(result.sql).toBe('SELECT * FROM users WHERE email IS NOT NULL');
      expect(result.params).toEqual([]);
    });
  });

  describe('orWhere', () => {
    it('should add OR condition', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('status', '=', 'active')
        .orWhere('status', '=', 'pending')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE status = $1 OR status = $2',
      );
      expect(result.params).toEqual(['active', 'pending']);
    });

    it('should handle mixed AND/OR conditions', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('age', '>', 18)
        .where('country', '=', 'US')
        .orWhere('is_premium', '=', true)
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE age > $1 AND country = $2 OR is_premium = $3',
      );
      expect(result.params).toEqual([18, 'US', true]);
    });

    it('should handle OR with IS NULL', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('status', '=', 'active')
        .orWhere('deleted_at', 'IS NULL', null)
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE status = $1 OR deleted_at IS NULL',
      );
      expect(result.params).toEqual(['active']);
    });
  });

  describe('join', () => {
    it('should add inner join', () => {
      const qb = new QueryBuilder('users');
      const result = qb.join('profiles', 'users.id = profiles.user_id').build();

      expect(result.sql).toBe(
        'SELECT * FROM users INNER JOIN profiles ON users.id = profiles.user_id',
      );
    });

    it('should add left join', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .join('profiles', 'users.id = profiles.user_id', 'LEFT')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users LEFT JOIN profiles ON users.id = profiles.user_id',
      );
    });

    it('should add right join', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .join('profiles', 'users.id = profiles.user_id', 'RIGHT')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users RIGHT JOIN profiles ON users.id = profiles.user_id',
      );
    });

    it('should add join with alias', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .join('user_profiles', 'users.id = p.user_id', 'LEFT', 'p')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users LEFT JOIN user_profiles p ON users.id = p.user_id',
      );
    });

    it('should add multiple joins', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .join('profiles', 'users.id = profiles.user_id')
        .join('roles', 'users.role_id = roles.id', 'LEFT')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users INNER JOIN profiles ON users.id = profiles.user_id LEFT JOIN roles ON users.role_id = roles.id',
      );
    });

    it('should combine joins with where conditions', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .join('profiles', 'users.id = profiles.user_id')
        .where('users.status', '=', 'active')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users INNER JOIN profiles ON users.id = profiles.user_id WHERE users.status = $1',
      );
      expect(result.params).toEqual(['active']);
    });
  });

  describe('orderByField', () => {
    it('should add order by ascending', () => {
      const qb = new QueryBuilder('users');
      const result = qb.orderByField('name').build();

      expect(result.sql).toBe('SELECT * FROM users ORDER BY name ASC');
    });

    it('should add order by descending', () => {
      const qb = new QueryBuilder('users');
      const result = qb.orderByField('created_at', 'DESC').build();

      expect(result.sql).toBe('SELECT * FROM users ORDER BY created_at DESC');
    });

    it('should override previous order by', () => {
      const qb = new QueryBuilder('users');
      const result = qb.orderByField('name').orderByField('id', 'DESC').build();

      expect(result.sql).toBe('SELECT * FROM users ORDER BY id DESC');
    });

    it('should combine with where conditions', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('status', '=', 'active')
        .orderByField('name')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE status = $1 ORDER BY name ASC',
      );
      expect(result.params).toEqual(['active']);
    });
  });

  describe('limitRecords', () => {
    it('should add limit', () => {
      const qb = new QueryBuilder('users');
      const result = qb.limitRecords(10).build();

      expect(result.sql).toBe('SELECT * FROM users LIMIT 10');
    });

    it('should handle zero limit', () => {
      const qb = new QueryBuilder('users');
      const result = qb.limitRecords(0).build();

      expect(result.sql).toBe('SELECT * FROM users');
    });

    it('should combine with other clauses', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('status', '=', 'active')
        .orderByField('name')
        .limitRecords(5)
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE status = $1 ORDER BY name ASC LIMIT 5',
      );
      expect(result.params).toEqual(['active']);
    });
  });

  describe('offsetRecords', () => {
    it('should add offset', () => {
      const qb = new QueryBuilder('users');
      const result = qb.offsetRecords(20).build();

      expect(result.sql).toBe('SELECT * FROM users OFFSET 20');
    });

    it('should handle zero offset', () => {
      const qb = new QueryBuilder('users');
      const result = qb.offsetRecords(0).build();

      expect(result.sql).toBe('SELECT * FROM users');
    });

    it('should combine with limit', () => {
      const qb = new QueryBuilder('users');
      const result = qb.limitRecords(10).offsetRecords(20).build();

      expect(result.sql).toBe('SELECT * FROM users LIMIT 10 OFFSET 20');
    });

    it('should combine with all clauses', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .select(['id', 'name'])
        .where('status', '=', 'active')
        .orderByField('name')
        .limitRecords(10)
        .offsetRecords(20)
        .build();

      expect(result.sql).toBe(
        'SELECT id, name FROM users WHERE status = $1 ORDER BY name ASC LIMIT 10 OFFSET 20',
      );
      expect(result.params).toEqual(['active']);
    });
  });

  describe('insert', () => {
    it('should generate insert query', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John', email: 'john@example.com', age: 30 };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *',
      );
      expect(result.params).toEqual(['John', 'john@example.com', 30]);
    });

    it('should handle single field insert', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John' };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name) VALUES ($1) RETURNING *',
      );
      expect(result.params).toEqual(['John']);
    });

    it('should handle empty object', () => {
      const qb = new QueryBuilder('users');
      const data = {};
      const result = qb.insert(data);

      expect(result.sql).toBe('INSERT INTO users () VALUES () RETURNING *');
      expect(result.params).toEqual([]);
    });

    it('should handle null values', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John', deleted_at: null };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name, deleted_at) VALUES ($1, $2) RETURNING *',
      );
      expect(result.params).toEqual(['John', null]);
    });

    it('should handle boolean values', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John', is_active: true };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name, is_active) VALUES ($1, $2) RETURNING *',
      );
      expect(result.params).toEqual(['John', true]);
    });

    it('should handle array values', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John', tags: ['admin', 'user'] };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name, tags) VALUES ($1, $2) RETURNING *',
      );
      expect(result.params).toEqual(['John', ['admin', 'user']]);
    });

    it('should handle object values', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John', metadata: { role: 'admin' } };
      const result = qb.insert(data);

      expect(result.sql).toBe(
        'INSERT INTO users (name, metadata) VALUES ($1, $2) RETURNING *',
      );
      expect(result.params).toEqual(['John', { role: 'admin' }]);
    });
  });

  describe('update', () => {
    it('should generate update query with where condition', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John Updated', email: 'john.updated@example.com' };
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      );
      expect(result.params).toEqual([
        'John Updated',
        'john.updated@example.com',
        1,
      ]);
    });

    it('should handle single field update', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John Updated' };
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING *',
      );
      expect(result.params).toEqual(['John Updated', 1]);
    });

    it('should handle multiple where conditions', () => {
      const qb = new QueryBuilder('users');
      const data = { status: 'inactive' };
      const result = qb
        .where('id', '=', 1)
        .where('status', '=', 'active')
        .update(data);

      expect(result.sql).toBe(
        'UPDATE users SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      );
      expect(result.params).toEqual(['inactive', 1, 'active']);
    });

    it('should handle null values', () => {
      const qb = new QueryBuilder('users');
      const data = { deleted_at: null };
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe(
        'UPDATE users SET deleted_at = $1 WHERE id = $2 RETURNING *',
      );
      expect(result.params).toEqual([null, 1]);
    });

    it('should handle boolean values', () => {
      const qb = new QueryBuilder('users');
      const data = { is_active: false };
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe(
        'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING *',
      );
      expect(result.params).toEqual([false, 1]);
    });

    it('should throw error without where clause', () => {
      const qb = new QueryBuilder('users');
      const data = { name: 'John Updated' };

      expect(() => qb.update(data)).toThrow(
        'UPDATE without WHERE clause is not allowed for safety.',
      );
    });

    it('should handle empty data object', () => {
      const qb = new QueryBuilder('users');
      const data = {};
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe('UPDATE users SET  WHERE id = $1 RETURNING *');
      expect(result.params).toEqual([1]);
    });

    it('should handle complex data types', () => {
      const qb = new QueryBuilder('users');
      const data = {
        metadata: { role: 'admin', permissions: ['read', 'write'] },
        tags: ['user', 'premium'],
      };
      const result = qb.where('id', '=', 1).update(data);

      expect(result.sql).toBe(
        'UPDATE users SET metadata = $1, tags = $2 WHERE id = $3 RETURNING *',
      );
      expect(result.params).toEqual([
        { role: 'admin', permissions: ['read', 'write'] },
        ['user', 'premium'],
        1,
      ]);
    });
  });

  describe('complex queries', () => {
    it('should build complex select query with all clauses', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .select(['u.id', 'u.name', 'p.bio'])
        .join('profiles', 'users.id = profiles.user_id', 'LEFT', 'p')
        .join('roles', 'users.role_id = roles.id', 'INNER', 'r')
        .where('u.status', '=', 'active')
        .where('u.age', '=', 18)
        .orderByField('u.created_at', 'DESC')
        .limitRecords(20)
        .offsetRecords(40)
        .build();

      expect(result.sql).toBe(
        'SELECT u.id, u.name, p.bio FROM users LEFT JOIN profiles p ON users.id = profiles.user_id INNER JOIN roles r ON users.role_id = roles.id WHERE u.status = $1 AND u.age = $2 ORDER BY u.created_at DESC LIMIT 20 OFFSET 40',
      );
      expect(result.params).toEqual(['active', 18]);
    });

    it('should handle method chaining in different orders', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .limitRecords(10)
        .where('status', '=', 'active')
        .select(['id', 'name'])
        .orderByField('name')
        .offsetRecords(5)
        .build();

      expect(result.sql).toBe(
        'SELECT id, name FROM users WHERE status = $1 ORDER BY name ASC LIMIT 10 OFFSET 5',
      );
      expect(result.params).toEqual(['active']);
    });

    it('should handle edge case with all null/empty values', () => {
      const qb = new QueryBuilder('users');
      const result = qb
        .where('deleted_at', 'IS', null)
        .where('name', '!=', '')
        .build();

      expect(result.sql).toBe(
        'SELECT * FROM users WHERE deleted_at IS $1 AND name != $2',
      );
      expect(result.params).toEqual([null, '']);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle special SQL characters in table name', () => {
      const qb = new QueryBuilder('user-profiles_2024');
      const result = qb.build();

      expect(result.sql).toBe('SELECT * FROM user-profiles_2024');
    });

    it('should handle special SQL characters in field names', () => {
      const qb = new QueryBuilder('users');
      const result = qb.select(['user-id', 'created_at', 'is_active']).build();

      expect(result.sql).toBe(
        'SELECT user-id, created_at, is_active FROM users',
      );
    });

    it('should handle very long field lists', () => {
      const qb = new QueryBuilder('users');
      const fields = Array.from({ length: 50 }, (_, i) => `field_${i}`);
      const result = qb.select(fields).build();

      expect(result.sql).toContain('SELECT field_0, field_1');
      expect(result.sql).toContain('field_49 FROM users');
    });

    it('should handle large number of where conditions', () => {
      const qb = new QueryBuilder('users');
      let builder = qb;

      for (let i = 0; i < 10; i++) {
        builder = builder.where(`field_${i}`, '=', `value_${i}`);
      }

      const result = builder.build();

      expect(result.params).toHaveLength(10);
      expect(result.sql).toContain('WHERE field_0 = $1 AND field_1 = $2');
      expect(result.sql).toContain('field_9 = $10');
    });

    it('should handle negative limit and offset', () => {
      const qb = new QueryBuilder('users');
      const result = qb.limitRecords(-5).offsetRecords(-10).build();

      expect(result.sql).toBe('SELECT * FROM users LIMIT -5 OFFSET -10');
    });
  });
});
