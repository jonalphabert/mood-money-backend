import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';
import { Currency } from './currency.entity';

@Injectable()
export class CurrencyRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private sanitizeForLike(term: string): string {
    return term.replace(/([%_\\])/g, '\\$1');
  }

  async findAll(): Promise<Currency[]> {
    const sqlBuilder = new QueryBuilder('currencies').build();
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows.map(Currency.fromDatabaseRow);
  }

  async findById(id: number): Promise<Currency | null> {
    const sqlBuilder = new QueryBuilder('currencies')
      .where('currency_id', '=', id)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.length > 0
      ? Currency.fromDatabaseRow(result.rows[0])
      : null;
  }

  async searchByName(
    name: string,
    offset: number,
    limit: number,
  ): Promise<{ data: Currency[]; total: number }> {
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
      data: result.rows.map(Currency.fromDatabaseRow),
      total: result.rowCount || 0,
    };
  }

  async create(currencyData: any): Promise<Currency> {
    const sqlBuilder = new QueryBuilder('currencies').insert(currencyData);
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return Currency.fromDatabaseRow(result.rows[0]);
  }

  async update(id: number, currencyData: any): Promise<Currency | null> {
    const sqlBuilder = new QueryBuilder('currencies')
      .where('currency_id', '=', id)
      .update(currencyData);

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.length > 0
      ? Currency.fromDatabaseRow(result.rows[0])
      : null;
  }
}
