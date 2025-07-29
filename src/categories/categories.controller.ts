import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { ValidationPipe } from '@nestjs/common/pipes';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('categories')
@ApiBearerAuth('access-token')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('my-categories')
  findMyCategories(@CurrentUser() user: User) {
    return this.categoriesService.findByUserId(user.user_id);
  }

  @Get('type/:categoryType')
  findByCategoryType(@Param('categoryType') categoryType: string) {
    return this.categoriesService.findByCategoryType(categoryType);
  }

  @Get('my-categories/type/:categoryType')
  findMyCategoriesByType(
    @CurrentUser() user: User,
    @Param('categoryType') categoryType: string,
  ) {
    return this.categoriesService.findByUserIdandCategoryType(
      user.user_id,
      categoryType,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findById(parseInt(id));
  }

  @Post()
  @UsePipes(ValidationPipe)
  create(@Body() categoryData: CreateCategoryDto, @CurrentUser() user: User) {
    return this.categoriesService.create({
      ...categoryData,
      user_id: user.user_id,
    });
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
