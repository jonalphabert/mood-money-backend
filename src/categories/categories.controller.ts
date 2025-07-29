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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({ status: 200, description: 'Returns all categories' })
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('myCategories')
  @ApiOperation({ summary: 'Get current user categories' })
  @ApiResponse({ status: 200, description: 'Returns current user categories' })
  findMyCategories(@CurrentUser() user: User) {
    return this.categoriesService.findByUserId(user.user_id);
  }

  @Get('type/:categoryType')
  @ApiOperation({ summary: 'Get categories by type' })
  @ApiParam({ name: 'categoryType', enum: ['expense', 'income'] })
  @ApiResponse({ status: 200, description: 'Returns categories by type' })
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
    return this.categoriesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @UsePipes(ValidationPipe)
  create(@Body() categoryData: CreateCategoryDto, @CurrentUser() user: User) {
    return this.categoriesService.create({
      ...categoryData,
      user_id: user.user_id,
    });
  }

  @Post('user')
  @UsePipes(ValidationPipe)
  createByUser(
    @Body() categoryData: CreateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.createByUser(categoryData, user.user_id);
  }

  @Put('user/:id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UsePipes(ValidationPipe)
  updateByUser(
    @Param('id') id: string,
    @Body() categoryData: UpdateCategoryDto,
    @CurrentUser() user: User,
  ) {
    return this.categoriesService.updateByUser(id, categoryData, user.user_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a category created by user' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @UsePipes(ValidationPipe)
  update(@Param('id') id: string, @Body() categoryData: UpdateCategoryDto) {
    return this.categoriesService.update(id, categoryData);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
