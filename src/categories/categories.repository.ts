import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryBuilder } from 'src/utils/query-builder';

@Injectable()
export class CategoriesRepository {
  constructor(private databaseService: DatabaseService) {}

  async findAll() {
    const sqlBuilder = new QueryBuilder('categories').build();
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows;
  }

  async create(categoryData: any) {
    const sqlBuilder = new QueryBuilder('categories').insert(categoryData);
    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );
    return result.rows[0];
  }

  async findById(id: number) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_id', '=', id)
      .where('is_active', '=', true)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows[0];
  }

  async findByCategoryType(categoryType: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_type', '=', categoryType)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows;
  }

  async update(id: number, categoryData: any) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('category_id', '=', id)
      .update(categoryData);

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows[0];
  }

  async findByUserId(userId: string) {
    const sqlBuilder = new QueryBuilder('categories')
      .where('user_id', '=', userId)
      .build();

    const result = await this.databaseService.query(
      sqlBuilder.sql,
      sqlBuilder.params,
    );

    return result.rows;
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

    return result.rows;
  }
}
