import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module'; 
import { TransactionsController } from './transactions/transactions.controller';
import { TransactionModule } from './transactions/transactions.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    TransactionModule,
    
  ],
  controllers: [
    TransactionsController,
  ],
  providers: [],
})
export class AppModule {}