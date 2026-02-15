import { Controller, Post, Get, Body, Req, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { firstValueFrom } from 'rxjs';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(
    @Inject('TRANSACTION_SERVICE') private transactionClient: ClientProxy,
  ) {}

  @Post('deposit')
  async deposit(@Req() req, @Body() body: { amount: number }) {
    return firstValueFrom(
      this.transactionClient.send('deposit', {
        userId: req.user.userId,
        amount: body.amount,
      }),
    );
  }

  @Post('withdraw')
  async withdraw(@Req() req, @Body() body: { amount: number }) {
    return firstValueFrom(
      this.transactionClient.send('withdraw', {
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