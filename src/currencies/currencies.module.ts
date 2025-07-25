import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { CurrencyRepository } from './currencies.repository';

@Module({
  controllers: [CurrenciesController],
  providers: [CurrenciesService, CurrencyRepository],
})
export class CurrenciesModule {}
