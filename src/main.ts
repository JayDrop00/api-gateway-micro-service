import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { config } from 'dotenv';


config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

 

  await app.listen(Number(process.env.PORT )|| 3000);

  Logger.log(`API Gateway running on port ${process.env.PORT}`);
}
bootstrap();
