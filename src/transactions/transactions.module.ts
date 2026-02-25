import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionService } from './transactions.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'QUEUE_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('QUEUE_SERVICE_HOST'),
            port: config.get<number>('QUEUE_SERVICE_PORT') || 4000,
          },
        }),
      },
      {
        name: 'SCHEDULE_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('SCHEDULE_SERVICE_HOST'),
            port: config.get<number>('SCHEDULE_SERVICE_PORT') || 5000,
          },
        }),
      },
      {
        name: 'TRANSACTION_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('TRANSACTION_SERVICE_HOST'),
            port: config.get<number>('TRANSACTION_SERVICE_PORT') || 3002,
          },
        }),
      },
    ]),
  ],
  controllers: [TransactionsController],
  providers: [TransactionService],
  exports: [TransactionService], // so other modules can inject it if needed
})
export class TransactionModule {}