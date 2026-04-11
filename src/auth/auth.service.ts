import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/logIn.dto';
import { config } from 'process';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  async register(body: LoginDto) {
    return firstValueFrom(
      this.userClient.send('register_user', body),
    );
  }

  async login(body: LoginDto) {
    const user = await firstValueFrom(
      this.userClient.send('validate_user', body),
    );

    if (!user) throw new UnauthorizedException();

    const token = this.jwtService.sign({
      userId: user.id,
      username: user.username,
    });

    return { accessToken: token };
  }

  async testTimestamp(
    x_client_timestamp: number,
    x_client_totp: string,
  ) {
    const x_server_time = Math.floor(Date.now() / 1000);
    const x_server_timestamp = Math.floor(x_server_time / 30);
    const secretkey = process.env.TOTP_SECRET as string;

    console.log("SECRET RAW:", secretkey);
    console.log("SECRET LENGTH:", secretkey.length);

    // Accept ±1 window
    const allow_window_time: number[] = [x_server_timestamp - 1, x_server_timestamp, x_server_timestamp + 1];

    let message = "";
    const isValid = allow_window_time.includes(x_client_timestamp);
    if (isValid) {
      message = "Timestamp is valid";
    } else {
      return { message: `${x_client_timestamp} is not valid` };
    }

  // ── TOTP ────────────────────────────────────────────────────────────────────

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
    const keyBytes     = Buffer.from(base32ToBytes(secret));
    const counterBytes = Buffer.from(intToBytesBigInt(counter));

    const hmac = crypto.createHmac("sha1", keyBytes).update(counterBytes).digest();
    console.log("HMAC:", hmac);

    const offset = hmac[hmac.length - 1] & 0xf;
    const binary =
      ((hmac[offset]     & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8)  |
      (hmac[offset + 3]  & 0xff);

    console.log("BINARY:", binary);

    return (binary % Math.pow(10, digits)).toString().padStart(digits, "0");
  }

  const x_server_totp = generateTOTP(secretkey, x_server_timestamp, 6);

  return {
    x_client_timestamp,
    x_server_timestamp,
    x_server_totp,
    x_client_totp,
    message,
  };
}
}