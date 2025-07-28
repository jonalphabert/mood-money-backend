import { Injectable } from '@nestjs/common';
import { CurrencyRepository } from './currencies.repository';
import { NotFoundError } from 'src/utils/custom_error';
import { Currency } from './currency.entity';

@Injectable()
export class CurrenciesService {
  constructor(private readonly currencyRepository: CurrencyRepository) {}

  async findAll(): Promise<Currency[]> {
    return this.currencyRepository.findAll();
  }

  async findById(id: number): Promise<Currency> {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      throw new NotFoundError('Currency not found');
    }

    return currency;
  }

  async searchByName(
    name: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Currency[]; page: number; limit: number; total: number }> {
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

  async create(currencyData: any): Promise<Currency> {
    return this.currencyRepository.create(currencyData);
  }

  async update(id: number, currencyData: any): Promise<Currency | null> {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      throw new NotFoundError('Currency not found');
    }

    return this.currencyRepository.update(id, currencyData);
  }
}
