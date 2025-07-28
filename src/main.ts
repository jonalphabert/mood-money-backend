import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DatabaseService } from './database/database.service';
import { GlobalExceptionFilter } from './common/filter/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Mood Money API')
      .setDescription('The mood money API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documentFactory);
  }

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
