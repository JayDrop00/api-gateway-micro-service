import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import * as crypto from 'crypto';
import { EncryptionSecurityService } from './security.service';
@Injectable()
export class SecurityInterceptor implements NestInterceptor {
  constructor(private readonly encryptionService: EncryptionSecurityService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    console.log("\n================ 🛡️ INTERCEPTOR START ================");

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const url = request.url;
    console.log("🌐 URL:", url);

    const isAuthRoute =
      url.includes('/auth/login') || url.includes('/auth/register');

    // ─────────────────────────────────────────
    // 🔐 HEADERS
    // ─────────────────────────────────────────
    const x_client_timestamp = Number(request.headers['x_client_timestamp']);
    const x_client_totp = request.headers['x_totp'];

    if (!isAuthRoute) {
    console.log("📥 CLIENT TIMESTAMP:", x_client_timestamp);
    console.log("📥 CLIENT TOTP:", x_client_totp);
    }
    // ─────────────────────────────────────────
    // 🧠 SERVER TIME + TOTP
    // ─────────────────────────────────────────
    let x_server_timestamp: number | undefined;
    let x_server_totp: string | undefined;

    if (!isAuthRoute) {
    const x_server_time = Math.floor(Date.now() / 1000);
    x_server_timestamp = Math.floor(x_server_time / 30);
    const secretkey = process.env.TOTP_SECRET as string;

    console.log("🕒 SERVER TIMESTAMP:", x_server_timestamp);

    function base32ToBytes(base32: string): number[] {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let bits = "";
      const bytes: number[] = [];
      base32 = base32.replace(/=+$/, "").toUpperCase();
      for (let i = 0; i < base32.length; i++) {
        const val = alphabet.indexOf(base32[i]);
        bits += val.toString(2).padStart(5, "0");
      }
      for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substring(i, i + 8), 2));
      }
      return bytes;
    }

    function intToBytesBigInt(counter: number | bigint): number[] {
      const buffer = new Array(8).fill(0);
      let big = BigInt(counter);
      for (let i = 7; i >= 0; i--) {
        buffer[i] = Number(big & 0xffn);
        big >>= 8n;
      }
      return buffer;
    }

    function generateTOTP(secret: string, counter: number, digits = 6): string {
      const keyBytes = Buffer.from(base32ToBytes(secret));
      const counterBytes = Buffer.from(intToBytesBigInt(counter));

      const hmac = crypto.createHmac("sha1", keyBytes).update(counterBytes).digest();
      console.log("🔐 SERVER HMAC:", hmac);

      const offset = hmac[hmac.length - 1] & 0xf;
      const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

      const totp = (binary % Math.pow(10, digits)).toString().padStart(digits, "0");

      console.log("🔢 SERVER TOTP:", totp);
      return totp;
    }

    x_server_totp = generateTOTP(secretkey, x_server_timestamp, 6);

    // ─────────────────────────────────────────
    // ✅ VALIDATE CLIENT (SKIP AUTH ROUTES)
    // ─────────────────────────────────────────
    
      console.log("🔍 VALIDATING CLIENT TOTP...");

      const allowedWindow = [
        x_server_timestamp - 1,
        x_server_timestamp,
        x_server_timestamp + 1,
      ];

      if (!allowedWindow.includes(x_client_timestamp)) {
        throw new ForbiddenException("❌ Invalid timestamp");
      }

      const expectedTotp = generateTOTP(secretkey, x_client_timestamp, 6);

      console.log("🧮 EXPECTED CLIENT TOTP:", expectedTotp);

      if (expectedTotp !== x_client_totp) {
        throw new ForbiddenException("❌ Invalid TOTP");
      }

      console.log("✅ CLIENT VERIFIED");
    }

    // ─────────────────────────────────────────
    // 🔓 DECRYPT REQUEST BODY
    // ─────────────────────────────────────────
    if (request.body?.data && request.body?.iv) {
      console.log("🔓 DECRYPTING REQUEST BODY...");
      request.body = await this.encryptionService.DecryptRequest(
        request.body.data,
        request.body.iv
      );
      console.log("✅ DECRYPTED BODY:", request.body);
    }

    // ─────────────────────────────────────────
    // ▶️ CONTINUE → ENCRYPT RESPONSE
    // ─────────────────────────────────────────
    return next.handle().pipe(
      switchMap((data) => {
        console.log("📤 ORIGINAL RESPONSE:", data);

        return from(this.encryptionService.encryptResponse(data)).pipe(
          switchMap((encrypted) => {
            console.log("🔐 ENCRYPTED RESPONSE READY");

            // Attach server headers
            if (!isAuthRoute && x_server_timestamp !== undefined && x_server_totp !== undefined){
              response.setHeader('x_server_timestamp', x_server_timestamp);
              response.setHeader('x_server_totp', x_server_totp);
              
              console.log("📦 HEADERS SET:", {
              x_server_timestamp,
              x_server_totp,
              });
            
            }
            
            

            return [encrypted];
          })
        );
      })
    );
  }
}