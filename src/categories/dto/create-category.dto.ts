import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsIn,
  IsUUID,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  category_name: string;

  @IsString()
  @IsIn(['expense', 'income'], {
    message: 'Value must be either "expense" or "income"',
  })
  category_type: string;

  @IsUUID()
  @MinLength(1)
  @MaxLength(100)
  user_id: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;

  @IsOptional()
  @IsUUID()
  category_parent_id?: number;
}
