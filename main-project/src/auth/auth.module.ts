import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { cacheModule } from 'src/common/configs/redis.config';
import { UserProfileRepository } from 'src/users/repository/users-profile.repository';
import { UsersService } from 'src/users/users.service';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { UsersRepository } from '../users/repository/users.repository';
import { JwtStrategy } from './jwt/jwt-refresh-strategy';

@Module({
  imports: [
    cacheModule,
    PassportModule,
    HttpModule,
    JwtModule.registerAsync({
      useFactory: (configServcie: ConfigService) => ({
        secret: configServcie.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configServcie.get<number>('ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),
    TypeOrmModule.forFeature([UsersRepository, UserProfileRepository]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersService],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
