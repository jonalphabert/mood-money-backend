import { Injectable } from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { NotFoundError } from 'src/utils/custom_error';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository) {}

  async findAll() {
    return this.categoriesRepository.findAll();
  }

  async findById(id: number) {
    const category = await this.categoriesRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    return category;
  }

  async findByCategoryType(categoryType: string) {
    return this.categoriesRepository.findByCategoryType(categoryType);
  }

  async findByUserId(userId: string) {
    return this.categoriesRepository.findByUserId(userId);
  }

  async findByUserIdandCategoryType(userId: string, categoryType: string) {
    return this.categoriesRepository.findByUserIdandCategoryType(
      userId,
      categoryType,
    );
  }

  async create(categoryData: any) {
    return this.categoriesRepository.create(categoryData);
  }

  async update(id: number, categoryData: any) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return this.categoriesRepository.update(id, categoryData);
  }

  async delete(id: number) {
    const category = await this.categoriesRepository.findById(id);

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return this.categoriesRepository.update(id, { is_active: false });
  }
}
