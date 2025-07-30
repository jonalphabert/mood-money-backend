import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Food & Dining',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category_name: string;

  @ApiProperty({
    description: 'Category type',
    example: 'expense',
    enum: ['expense', 'income'],
  })
  @IsString()
  @IsIn(['expense', 'income'], {
    message: 'Value must be either "expense" or "income"',
  })
  category_type: string;

  @ApiProperty({
    description: 'Whether the category is active',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}
