import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';

@Injectable()
export class CurrenciesService {
  constructor(private readonly databaseService: DatabaseService) {}

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

  async create(currencyData: {
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
    currency_symbol_position?: string;
    currency_decimal_places?: number;
  }) {
    const sql = `
      INSERT INTO currencies (
        currency_code, currency_name, currency_symbol, 
        currency_symbol_position, currency_decimal_places
      ) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      currencyData.currency_code,
      currencyData.currency_name,
      currencyData.currency_symbol,
      currencyData.currency_symbol_position || 'before',
      currencyData.currency_decimal_places || 2,
    ];

    const result = await this.databaseService.query(sql, values);
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
