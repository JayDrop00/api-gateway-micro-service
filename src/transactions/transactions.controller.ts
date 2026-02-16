import { Controller, Post, Get, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(
    @Inject('TRANSACTION_SERVICE') private transactionClient: ClientProxy,
    @Inject('SCHEDULE_SERVICE') private scheduleClient: ClientProxy,
    @Inject('QUEUE_SERVICE') private queueClient: ClientProxy,
  ) {}

  // api-gateway/src/transactions/transactions.controller.ts

  @Post('schedule')
  async scheduleTransaction(
    @Req() req,
    @Body() body: { amount: number; type: 'DEPOSIT' | 'WITHDRAW'; scheduleAt: string },
  ) {

    console.log("YWA KA");
    await this.scheduleClient.connect();
    console.log("YWA KA 2");
    return firstValueFrom(
      this.scheduleClient.send('schedule_transaction', {
        userId: Number(req.user.userId),
        amount: body.amount,
        type: body.type,
        scheduleAt: body.scheduleAt,
      }),
    );
  }
  @Post('deposit')
  async deposit(@Req() req, @Body() body: { amount: number }) {
    return firstValueFrom(
      this.queueClient.send('deposit', {
        userId: req.user.userId,
        amount: body.amount,
      }),
    );
  }

  @Post('withdraw')
  async withdraw(@Req() req, @Body() body: { amount: number }) {
    return firstValueFrom(
      this.queueClient.send('withdraw', {
        userId: req.user.userId,
        amount: body.amount,
      }),
    );
  }

  @Get('balance')
  async balance(@Req() req) {
    return firstValueFrom(
      this.transactionClient.send('balance', {
        userId: req.user.userId,
      }),
    );
  }

  @Get('history')
  async history(@Req() req) {
    return firstValueFrom(
      this.transactionClient.send('history', {
        userId: req.user.userId,
      }),
    );
  }
}