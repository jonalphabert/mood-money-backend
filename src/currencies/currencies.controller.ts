import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  Query,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

@Controller('currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  async findAll() {
    return this.currenciesService.findAll();
  }

  @Get('search/')
  async searchByName(
    @Query() queryParams: { name: string; page: number; limit: number },
  ) {
    return this.currenciesService.searchByName(
      queryParams.name,
      queryParams.page,
      queryParams.limit,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.currenciesService.findById(parseInt(id));
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() currencyData: CreateCurrencyDto) {
    return this.currenciesService.create(currencyData);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Param('id') id: string,
    @Body() currencyData: UpdateCurrencyDto,
  ) {
    return this.currenciesService.update(parseInt(id), currencyData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.currenciesService.update(parseInt(id), { is_active: false });
  }
}
