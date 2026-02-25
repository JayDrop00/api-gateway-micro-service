import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ScheduleTransactionDto } from './dto/schedule-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('QUEUE_SERVICE')
    private readonly queueClient: ClientProxy,

    @Inject('SCHEDULE_SERVICE')
    private readonly scheduleClient: ClientProxy,

    @Inject('TRANSACTION_SERVICE')
    private readonly transactionClient: ClientProxy,
  ) {}

  async deposit(userId: number, amount: number) {
    return await firstValueFrom(
      this.queueClient.send('deposit', { userId, amount }),
    );
  }

  async withdraw(userId: number, amount: number) {
    return await firstValueFrom(
      this.queueClient.send('withdraw', { userId, amount }),
    );
  }

  async scheduleTransaction(userId: number, dto: ScheduleTransactionDto) {
    return await firstValueFrom(
      this.scheduleClient.send('schedule_transaction', {
        userId,
        ...dto,
      }),
    );
  }

  async balance(userId: number) {
    return await firstValueFrom(
      this.transactionClient.send('balance', { userId }),
    );
  }

  async history(userId: number) {
    return await firstValueFrom(
      this.transactionClient.send('history', { userId }),
    );
  }
}