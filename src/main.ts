import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Teslo Store API')
    .setDescription('Tesla store api documentation')
    .setVersion('1.0')
    .addTag('Cast')
    .build();

  const document = SwaggerModule.createDocument( app, config );
  SwaggerModule.setup( 'docs', app, document );

  await app.listen(3000);
}
bootstrap();
