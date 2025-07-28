import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { NotFoundError } from 'src/utils/custom_error';
import { Category } from './category.entity';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.findAll();
  }

  async findById(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async findByCategoryType(categoryType: string): Promise<Category[]> {
    return this.categoriesRepository.findByCategoryType(categoryType);
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return this.categoriesRepository.findByUserId(userId);
  }

  async findByUserIdandCategoryType(userId: string, categoryType: string): Promise<Category[]> {
    return this.categoriesRepository.findByUserIdandCategoryType(
      userId,
      categoryType,
    );
  }

  async create(categoryData: any): Promise<Category> {
    return this.categoriesRepository.create(categoryData);
  }

  async update(id: number, categoryData: any): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const updated = await this.categoriesRepository.update(id, categoryData);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }
    return updated;
  }

  async delete(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const deleted = await this.categoriesRepository.update(id, { is_active: false });
    if (!deleted) {
      throw new NotFoundError('Category not found');
    }
    return deleted;
  }
}
