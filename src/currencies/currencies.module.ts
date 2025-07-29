import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { CurrencyRepository } from './currencies.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [CurrenciesController],
  providers: [CurrenciesService, CurrencyRepository],
})
export class CurrenciesModule {}
