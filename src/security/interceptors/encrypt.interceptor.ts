import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map } from 'rxjs/operators';
import { TotpCryptoService } from '../crypto/totp.service';

@Injectable()
export class EncryptInterceptor implements NestInterceptor {
  constructor(
    private readonly cryptoService: TotpCryptoService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const skip = this.reflector.getAllAndOverride<boolean>('skip_encrypt', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skip) {
      return next.handle(); // 🚀 DO NOT encrypt
    }

    return next.handle().pipe(
      map((data) => {
        return this.cryptoService.encrypt(data);
      }),
    );
  }
}