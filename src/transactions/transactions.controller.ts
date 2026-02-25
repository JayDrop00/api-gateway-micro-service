import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleTransactionDto } from './dto/schedule-transaction.dto';
import { TransactionService } from './transactions.service';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('schedule')
  async scheduleTransaction(@Req() req, @Body() dto: ScheduleTransactionDto) {
    const userId = Number(req.user.userId);
    return this.transactionService.scheduleTransaction(userId, dto);
  }

  @Post('deposit')
  async deposit(@Req() req, @Body() body: { amount: number }) {
    const userId = Number(req.user.userId);
    return this.transactionService.deposit(userId, body.amount);
  }

  @Post('withdraw')
  async withdraw(@Req() req, @Body() body: { amount: number }) {
    const userId = Number(req.user.userId);
    return this.transactionService.withdraw(userId, body.amount);
  }

  @Get('balance')
  async balance(@Req() req) {
    const userId = Number(req.user.userId);
    return this.transactionService.balance(userId);
  }

  @Get('history')
  async history(@Req() req) {
    const userId = Number(req.user.userId);
    return this.transactionService.history(userId);
  }
}