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

  
}