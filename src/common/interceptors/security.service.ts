import { Injectable } from '@nestjs/common';
import { createDecipheriv } from 'crypto';
import { randomBytes, createCipheriv } from 'crypto';

@Injectable()
export class EncryptionSecurityService {

  private readonly key: Buffer;

  constructor() {
    const keyBase64 = process.env.ENCRYPTION_KEY;
    if (!keyBase64) throw new Error('Missing env variable: ENCRYPTION_KEY');

    this.key = Buffer.from(keyBase64, 'base64');

    if (this.key.length !== 32) {
      throw new Error(`AES key must be 32 bytes, got ${this.key.length}`);
    }
  }

  async DecryptRequest(encryptedBase64: string, ivBase64: string): Promise<any> {
    console.log("ENCRYPTED BASE64:", encryptedBase64);
    console.log("IV BASE64:", ivBase64);
    // 1. Decode Base64 inputs

    const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');

    // 2. AES-256-GCM: last 16 bytes are the auth tag
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    const ciphertext = encryptedBuffer.subarray(0, encryptedBuffer.length - 16);

    // 3. Decrypt
    const decipher = createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    // 4. Parse and return
    return JSON.parse(decrypted.toString('utf8'));
  }

  async encryptResponse(payload: any): Promise<{ data: string; iv: string }> {
    // 1. Generate IV (12 bytes for GCM is standard)
    const iv = randomBytes(12);

    // 2. Create cipher
    const cipher = createCipheriv('aes-256-gcm', this.key, iv);

    const json = JSON.stringify(payload);

    const encrypted = Buffer.concat([
      cipher.update(json, 'utf8'),
      cipher.final(),
    ]);

    // 3. Get auth tag
    const authTag = cipher.getAuthTag();

    // 4. Combine ciphertext + authTag
    const finalBuffer = Buffer.concat([encrypted, authTag]);

    const result = {
      data: finalBuffer.toString('base64'),
      iv: iv.toString('base64'),
    };

    // 🔥 IMPORTANT: log before sending
    console.log("ENCRYPTED RESPONSE:", result);

    return result;
  }  
}