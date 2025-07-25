import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsIn,
  IsNumber,
} from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  currency_name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  currency_code: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  currency_symbol: string;

  @IsString()
  @MinLength(1)
  @IsIn(['before', 'after'], {
    message: 'Value must be either "before" or "after"',
  })
  @IsOptional()
  currency_symbol_position?: string = 'before';

  @IsNumber()
  @IsOptional()
  currency_decimal_places?: number;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;
}
