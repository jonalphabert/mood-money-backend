import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Mood Money API')
      .setDescription('The mood money API description')
      .setVersion('1.0')
      .addCookieAuth('refreshToken', {
        type: 'http',
        in: 'cookie',
        scheme: 'bearer',
      })
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'access-token',
      )
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory, {
      swaggerOptions: {
        persistAuthorization: true, // This is the key option
        tryItOutEnabled: true,
        requestInterceptor: (req) => {
          if (!req.headers['Content-Type']) {
            req.headers['Content-Type'] = 'application/json';
          }
          return req;
        },
        authAction: {
          'access-token': {
            schema: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            value: '',
          },
        },
      },
    });
  }

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000', 'https://your-frontend-domain.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.get(DatabaseService);

  await app.listen(3000);
}
bootstrap();
