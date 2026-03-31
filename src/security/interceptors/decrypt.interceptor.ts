import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TotpCryptoService } from '../crypto/totp.service';

@Injectable()
export class DecryptInterceptor implements NestInterceptor {
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
      return next.handle(); // 🚀 skip decryption
    }

    const request = context.switchToHttp().getRequest();

    if (request.body?.data && request.body?.iv) {
      request.body = this.cryptoService.decrypt(request.body);
    }

    return next.handle();
  }
}