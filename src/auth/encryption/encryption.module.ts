import { Module } from '@nestjs/common';
import { EncryptionController } from './encryption.controller';
import { EncryptionService } from './encryption.service';

@Module({
  controllers: [EncryptionController],
  providers: [EncryptionService],
  // optional (only if used in other modules)
})
export class EncryptionModule {}