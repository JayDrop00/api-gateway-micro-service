import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { TransactionsController } from './transactions/transactions.controller';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ClientsModule.registerAsync([
      {
        name: 'USER_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('USER_SERVICE_HOST'),
            port: config.get<number>('USER_SERVICE_PORT'),
          },
        }),
      },
      {
        name: 'TRANSACTION_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get('TRANSACTION_SERVICE_HOST'),
            port: config.get<number>('TRANSACTION_SERVICE_PORT'),
          },
        }),
      },
    ]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES') },
      }),
    }),
  ],
  controllers: [AuthController, TransactionsController],
  providers: [JwtStrategy],
})
export class AppModule {}
