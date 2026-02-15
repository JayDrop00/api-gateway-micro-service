import {
  Controller,
  Post,
  Body,
  Inject,
  UnauthorizedException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from './dto/logIn.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: LoginDto) {
    return firstValueFrom(
      this.userClient.send('register_user', body),
    );
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
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

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@Req() req) {
    return req.user;
  }
}
