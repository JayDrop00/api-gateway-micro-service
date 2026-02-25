import {
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Interval } from '../enums/interval.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export class IntervalDto {
  @IsEnum(Interval)
  unit: Interval;

  @IsNumber()
  @Min(1)
  value: number;
}

export class ScheduleTransactionDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsDateString()
  scheduleAt: string;

  @IsOptional()
  @IsNumber()
  frequency?: number;
  
  @IsOptional()
  @ValidateNested()
  @Type(() => IntervalDto)
  interval?: IntervalDto;

  
}