import { Module } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthMiddleware } from './middleware/auth.middleware';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [JwtAuthGuard, AuthMiddleware],
  exports: [JwtAuthGuard, AuthMiddleware],
})
export class CommonModule {}
