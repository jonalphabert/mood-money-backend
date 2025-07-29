import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';
import { Category } from './category.entity';

@Injectable()
export class CategoriesRepository {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const sqlBuilder = new QueryBuilder('categories').build();
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows.map(Category.fromDatabaseRow);
  }

  async create(categoryData: any) {
    const sqlBuilder = new QueryBuilder('categories').insert(categoryData);
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return Category.fromDatabaseRow(result.rows[0]);
  }

  async findById(id: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_id', '=', id)
      .where('is_active', '=', true)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.length > 0
      ? Category.fromDatabaseRow(result.rows[0])
      : null;
  }

  async findByCategoryType(categoryType: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_type', '=', categoryType)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.map(Category.fromDatabaseRow);
  }

  async update(id: string, categoryData: any) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_id', '=', id)
      .update(categoryData);

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.length > 0
      ? Category.fromDatabaseRow(result.rows[0])
      : null;
  }

  async findByUserId(userId: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('user_id', '=', userId)
      .orWhere('user_id', 'IS NULL', null)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.map(Category.fromDatabaseRow);
  }

  async findByUserIdandCategoryType(userId: string, categoryType: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('user_id', '=', userId)
      .where('category_type', '=', categoryType)
      .where('is_active', '=', true)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows.map(Category.fromDatabaseRow);
  }
}
