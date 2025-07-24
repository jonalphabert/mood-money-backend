import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async findAll() {
    return this.currenciesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.currenciesService.findById(parseInt(id));
  }

  @Post()
  async create(@Body() currencyData: any) {
    return this.currenciesService.create(currencyData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() currencyData: any) {
    return this.currenciesService.update(parseInt(id), currencyData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.currenciesService.update(parseInt(id), { is_active: false });
  }
}
