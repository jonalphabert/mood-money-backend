import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from './user.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user.user_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    // Only allow users to access their own data
    if (id !== user.user_id) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Put('profile')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateProfile(@Body() userData: any, @CurrentUser() user: User) {
    return this.usersService.update(user.user_id, userData);
  }

  @Put('currency')
  async updateCurrency(
    @Body() body: { currency_id: number },
    @CurrentUser() user: User,
  ) {
    return this.usersService.updateCurrency(user.user_id, body.currency_id);
  }
}
