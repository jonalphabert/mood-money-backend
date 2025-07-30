export class QueryBuilder {
  private table: string;
  private fields: string[] = ['*'];
  private conditions: {
    field: string;
    operator: string;
    value: any;
    connector?: 'AND' | 'OR';
  }[] = [];
  private orderBy: { field: string; direction: 'ASC' | 'DESC' } | null = null;
  private limit: number | null = null;
  private offset: number | null = null;

  private joins: {
    table: string;
    alias?: string;
    on: string;
    type: 'INNER' | 'LEFT' | 'RIGHT';
  }[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string[]) {
    this.fields = fields;
    return this;
  }

  join(
    table: string,
    on: string,
    type: 'INNER' | 'LEFT' | 'RIGHT' = 'INNER',
    alias?: string,
  ) {
    this.joins.push({ table, on, type, alias });
    return this;
  }

  where(field: string, operator: string, value: any) {
    this.conditions.push({ field, operator, value, connector: 'AND' });
    return this;
  }

  orWhere(field: string, operator: string, value: any) {
    this.conditions.push({ field, operator, value, connector: 'OR' });
    return this;
  }

  orderByField(field: string, direction: 'ASC' | 'DESC' = 'ASC') {
    this.orderBy = { field, direction };
    return this;
  }

  limitRecords(limit: number) {
    this.limit = limit;
    return this;
  }

  offsetRecords(offset: number) {
    this.offset = offset;
    return this;
  }

  build() {
    let sql = `SELECT ${this.fields.join(', ')} FROM ${this.table}`;

    // JOIN clause
    for (const join of this.joins) {
      const aliasPart = join.alias ? ` ${join.alias}` : '';
      sql += ` ${join.type} JOIN ${join.table}${aliasPart} ON ${join.on}`;
    }

    const params: any[] = [];

    // WHERE clause
    if (this.conditions.length > 0) {
      sql += ' WHERE ';
      const whereClauses: string[] = [];

      for (const [index, condition] of this.conditions.entries()) {
        let clause;
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          clause = `${condition.field} ${condition.operator}`;
        } else {
          clause = `${condition.field} ${condition.operator} $${params.length + 1}`;
          params.push(condition.value);
        }

        if (index === 0) {
          whereClauses.push(clause);
        } else {
          whereClauses.push(`${condition.connector} ${clause}`);
        }
      }

      sql += whereClauses.join(' ');
    }

    // ORDER BY clause
    if (this.orderBy) {
      sql += ` ORDER BY ${this.orderBy.field} ${this.orderBy.direction}`;
    }

    // LIMIT clause
    if (this.limit) {
      sql += ` LIMIT ${this.limit}`;
    }

    // OFFSET clause
    if (this.offset) {
      sql += ` OFFSET ${this.offset}`;
    }

    return { sql, params };
  }

  insert(data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);

    const sql = `INSERT INTO ${this.table} (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;

    return {
      sql,
      params: values,
    };
  }

  update(data: Record<string, any>) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    let paramCount = 1;

    const setClauses = columns.map((col) => `${col} = $${paramCount++}`);

    let sql = `UPDATE ${this.table} SET ${setClauses.join(', ')}`;

    const params = [...values];

    if (this.conditions.length > 0) {
      sql += ' WHERE ';
      const whereClauses: string[] = [];

      for (const [index, condition] of this.conditions.entries()) {
        let clause;
        if (
          condition.operator === 'IS NULL' ||
          condition.operator === 'IS NOT NULL'
        ) {
          clause = `${condition.field} ${condition.operator}`;
        } else {
          clause = `${condition.field} ${condition.operator} $${paramCount++}`;
          params.push(condition.value);
        }

        if (index === 0) {
          whereClauses.push(clause);
        } else {
          whereClauses.push(`${condition.connector} ${clause}`);
        }
      }

      sql += whereClauses.join(' ');
    } else {
      throw new Error('UPDATE without WHERE clause is not allowed for safety.');
    }

    sql += ' RETURNING *';

    return {
      sql,
      params,
    };
  }
}
