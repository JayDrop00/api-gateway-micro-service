import { Module } from "@nestjs/common";

import { SecurityInterceptor } from "./security.interceptor";
import { EncryptionSecurityService } from "./security.service";

@Module({
  
  providers: [SecurityInterceptor, EncryptionSecurityService],
  exports: [SecurityInterceptor, EncryptionSecurityService],
})
export class SecurityModule {}