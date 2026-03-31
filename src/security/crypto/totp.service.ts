import * as crypto from 'crypto';
import * as speakeasy from 'speakeasy';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TotpCryptoService {
  private readonly secret = process.env.TOTP_SECRET || 'supersecret';

  generateKey() {
    return speakeasy.totp({
      secret: this.secret,
      encoding: 'ascii',
    });
  }

  encrypt(data: any) {
    const key = crypto
      .createHash('sha256')
      .update(this.generateKey())
      .digest();

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return {
      iv: iv.toString('base64'),
      data: encrypted,
    };
  }

  decrypt(payload: { iv: string; data: string }) {
    const key = crypto
      .createHash('sha256')
      .update(this.generateKey())
      .digest();

    const iv = Buffer.from(payload.iv, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    let decrypted = decipher.update(payload.data, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}