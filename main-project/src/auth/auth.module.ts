import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cacheModule } from 'src/common/configs/redis.config';
import { AuthRepository } from './repository/authentication.repository';
import { UserProfilesRepository } from 'src/users/repository/user-profiles.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/access-token.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    cacheModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
        },
        secret: configService.get<string>('JWT_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UsersRepository,
      AuthRepository,
      UserProfilesRepository,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
