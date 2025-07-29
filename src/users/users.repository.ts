import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';
import { User } from './user.entity';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const queryBuilder = new QueryBuilder('users').build();
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.map(User.fromDatabaseRow);
  }

  async getUserPagination(offset: number, limit: number) {
    const queryBuilder = new QueryBuilder('users')
      .offsetRecords(offset)
      .limitRecords(limit)
      .build();
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.map(User.fromDatabaseRow);
  }

  async findById(id: string) {
    const queryBuilder = new QueryBuilder('users')
      .where('user_id', '=', id)
      .build();
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async getProfile(id: string) {
    const queryBuilder = new QueryBuilder('users')
      .join(
        'currencies',
        'users.display_currency_id = c.currency_id',
        'LEFT',
        'c',
      )
      .select([
        'users.*',
        'c.currency_name',
        'c.currency_code',
        'c.currency_symbol',
      ])
      .where('user_id', '=', id)
      .build();

    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByEmail(email: string) {
    const queryBuilder = new QueryBuilder('users')
      .where('email', '=', email)
      .build();
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async findByRefreshToken(refreshToken: string) {
    const sql = `SELECT * FROM users WHERE refresh_token = $1`;
    const params = [refreshToken];

    const result = await this.databaseService.query(sql, params);
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async findByVerificationCode(verificationCode: string) {
    const queryBuilder = new QueryBuilder('users')
      .where('verification_code', '=', verificationCode)
      .build();
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async create(userData: any) {
    const queryBuilder = new QueryBuilder('users').insert(userData);
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return User.fromDatabaseRow(result.rows[0]);
  }

  async updateCurrency(id: string, currencyId: number) {
    const queryBuilder = new QueryBuilder('users')
      .where('user_id', '=', id)
      .update({ display_currency_id: currencyId });
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async updateLastLogin(id: string) {
    const queryBuilder = new QueryBuilder('users')
      .where('user_id', '=', id)
      .update({ last_login: new Date() });
    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }

  async update(id: string, userData: any) {
    const queryBuilder = new QueryBuilder('users')
      .where('user_id', '=', id)
      .update(userData);

    const result = await this.databaseService.query(
      queryBuilder.sql,
      queryBuilder.params,
    );
    return result.rows.length > 0 ? User.fromDatabaseRow(result.rows[0]) : null;
  }
}
