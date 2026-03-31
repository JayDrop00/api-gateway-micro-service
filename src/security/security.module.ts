import { Module } from '@nestjs/common';
import { TotpCryptoService } from './crypto/totp.service';
import { EncryptInterceptor } from './interceptors/encrypt.interceptor';
import { DecryptInterceptor } from './interceptors/decrypt.interceptor';

@Module({
  providers: [
    TotpCryptoService,
    EncryptInterceptor,
    DecryptInterceptor,
  ],
  exports: [
    TotpCryptoService,
    EncryptInterceptor,
    DecryptInterceptor,
  ],
})
export class SecurityModule {}