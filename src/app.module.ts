import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import * as path from 'path';

import { AuthModule } from './auth/auth.module'; 
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionModule } from './transactions/transactions.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { SecurityModule } from './common/interceptors/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // ✅ ADD THIS
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: {
          targets: [
            {
              target: 'pino-pretty',
              options: { colorize: true },
            },
            {
              target: 'pino/file',
              options: {
                destination: path.join(process.cwd(), '..', 'logs', 'api-gateway.log'),
                mkdir: true,
              },
            },
          ],
        },
      },
    }),

    AuthModule,
    TransactionModule,
    SecurityModule,
  ],
  controllers: [
    TransactionsController,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
  ],
})
export class AppModule {}