import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.categoriesService.findByUserId(userId);
  }

  @Get('type/:categoryType')
  findByCategoryType(@Param('categoryType') categoryType: string) {
    return this.categoriesService.findByCategoryType(categoryType);
  }

  @Get('user/:userId/type/:categoryType')
  findByUserIdandCategoryType(
    @Param('userId') userId: string,
    @Param('categoryType') categoryType: string,
  ) {
    return this.categoriesService.findByUserIdandCategoryType(
      userId,
      categoryType,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(parseInt(id));
  }

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() categoryData: CreateCategoryDto) {
    return this.categoriesService.create(categoryData);
  }

  @Put(':id')
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() categoryData: UpdateCategoryDto) {
    return this.categoriesService.update(parseInt(id), categoryData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(parseInt(id));
  }
}
