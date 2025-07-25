import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';

@Injectable()
export class CurrencyRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private sanitizeForLike(term: string): string {
    return term.replace(/([%_\\])/g, '\\$1');
  }

  async findAll() {
    const sqlBuilder = new QueryBuilder('currencies').build();
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows;
  }

  async findById(id: number) {
    const sqlBuilder = new QueryBuilder('currencies')
      .where('currency_id', '=', id)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows[0];
  }

  async searchByName(name: string, offset: number, limit: number) {
    const sanitizedName = this.sanitizeForLike(name);
    const sqlBuilder = new QueryBuilder('currencies')
      .where('currency_name', 'ILIKE', `%${sanitizedName}%`)
      .offsetRecords(offset)
      .limitRecords(limit)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return {
      data: result.rows,
      total: result.rowCount,
    };
  }

  async create(currencyData: any) {
    const sqlBuilder = new QueryBuilder('currencies').insert(currencyData);
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows[0];
  }

  async update(id: number, currencyData: any) {
    const sqlBuilder = new QueryBuilder('currencies')
      .where('currency_id', '=', id)
      .update(currencyData);

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows[0];
  }
}
