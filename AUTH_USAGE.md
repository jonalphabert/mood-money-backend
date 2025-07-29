# Authentication Usage Guide

## Overview
This project provides JWT-based authentication with two approaches:
1. **Guard-based protection** (Recommended)
2. **Middleware-based protection**

## Guard-based Protection (Recommended)

### Usage in Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('categories')
@UseGuards(JwtAuthGuard) // Protect entire controller
export class CategoriesController {
  
  @Get('my-categories')
  findMyCategories(@CurrentUser() user: User) {
    // user object contains current authenticated user
    return this.categoriesService.findByUserId(user.user_id);
  }

  @Post()
  create(@Body() data: CreateDto, @CurrentUser() user: User) {
    return this.service.create({ ...data, user_id: user.user_id });
  }
}
```

### Protect Individual Routes

```typescript
@Controller('example')
export class ExampleController {
  
  @Get('public')
  publicRoute() {
    return 'This is public';
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard) // Protect single route
  protectedRoute(@CurrentUser() user: User) {
    return `Hello ${user.email}`;
  }
}
```

## Middleware-based Protection

Applied globally in `app.module.ts`:

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('categories', 'currencies'); // Protect specific routes
  }
}
```

## Authentication Headers

All protected routes require:
```
Authorization: Bearer <jwt_token>
```

## Current User Access

The authenticated user is available in:
- **Guard approach**: `@CurrentUser() user: User` parameter
- **Middleware approach**: `req.user` object

## Token Structure

JWT payload contains:
```json
{
  "sub": "user_id",
  "email": "user@example.com", 
  "version": 1,
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Error Responses

- `401 Unauthorized`: Invalid/missing token
- `401 Unauthorized`: Token version mismatch
- `401 Unauthorized`: User not found

## Module Setup

Add to your module:

```typescript
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
  ],
  providers: [JwtAuthGuard],
})
export class YourModule {}
```