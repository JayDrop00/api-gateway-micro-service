import { Injectable } from '@nestjs/common';
import { createDecipheriv, randomBytes, createCipheriv} from 'crypto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class EncryptionSecurityService {

  private readonly key: Buffer;

  constructor(private readonly logger: Logger) {
    const keyBase64 = process.env.ENCRYPTION_KEY;
    if (!keyBase64) throw new Error('Missing env variable: ENCRYPTION_KEY');

    this.key = Buffer.from(keyBase64, 'base64');

    if (this.key.length !== 32) {
      throw new Error(`AES key must be 32 bytes, got ${this.key.length}`);
    }
  }

  async DecryptRequest(encryptedBase64: string, ivBase64: string): Promise<any> {
    this.logger.debug({ encryptedBase64 }, 'Decrypting request payload');
    this.logger.debug({ ivBase64 }, 'Using IV');

    const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    const ciphertext = encryptedBuffer.subarray(0, encryptedBuffer.length - 16);

    try {
      const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final(),
      ]);

      const result = JSON.parse(decrypted.toString('utf8'));

      this.logger.debug({ result }, 'Decryption successful');

      return result;
    } catch (error) {
      this.logger.error(
        { err: error, encryptedBase64, ivBase64 },
        'Decryption failed',
      );
      throw error;
    }
  }

  async encryptResponse(payload: any): Promise<{ data: string; iv: string }> {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const json = JSON.stringify(payload);

    const encrypted = Buffer.concat([
      cipher.update(json, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();
    const finalBuffer = Buffer.concat([encrypted, authTag]);

    const result = {
      data: finalBuffer.toString('base64'),
      iv: iv.toString('base64'),
    };

    this.logger.debug({ payload }, 'Encrypting response payload');
    this.logger.debug({ result }, 'Encrypted response generated');

    return result;
  }
}