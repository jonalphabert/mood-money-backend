import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from './currencies.repository';
import { NotFoundError } from 'src/utils/custom_error';

@Injectable()
export class CurrenciesService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async findAll() {
    return this.currencyRepository.findAll();
  }

  async findById(id: number) {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      throw new NotFoundError('Currency not found');
    }

    return currency;
  }

  async searchByName(name: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    const { data, total } = await this.currencyRepository.searchByName(
      name,
      offset,
      limit,
    );

    if (data.length === 0) {
      throw new NotFoundError('Currency not found');
    }

    return {
      data,
      page,
      limit,
      total,
    };
  }

  async create(currencyData: any) {
    return this.currencyRepository.create(currencyData);
  }

  async update(id: number, currencyData: any) {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      throw new NotFoundError('Currency not found');
    }

    return this.currencyRepository.update(id, currencyData);
  }
}
