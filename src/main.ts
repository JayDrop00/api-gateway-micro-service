import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe} from '@nestjs/common';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from 'nestjs-pino';

config();
async function bootstrap() {
  // ✅ ensure logs folder exists (same as other services)
  const logsPath = path.join(process.cwd(), '..', 'logs');
  if (!fs.existsSync(logsPath)) {
    fs.mkdirSync(logsPath, { recursive: true });
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(Number(process.env.PORT) || 3000);

  logger.log(`API Gateway running on port ${process.env.PORT || 3000}`);
}
bootstrap();
