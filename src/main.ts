import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { config } from 'dotenv';
import { EncryptInterceptor } from './security/interceptors/encrypt.interceptor';
import { DecryptInterceptor } from './security/interceptors/decrypt.interceptor';

config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.useGlobalInterceptors(
    app.get(EncryptInterceptor),
    app.get(DecryptInterceptor),
  );

  await app.listen(Number(process.env.PORT )|| 3000);

  Logger.log(`API Gateway running on port ${process.env.PORT}`);
}
bootstrap();
