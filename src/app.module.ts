import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; 
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionModule } from './transactions/transactions.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SecurityInterceptor } from './common/interceptors/security.interceptor';
import { SecurityModule } from './common/interceptors/security.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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