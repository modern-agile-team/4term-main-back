import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cacheModule } from 'src/common/configs/redis.config';
import { AuthRepository } from './repository/authentication.repository';
import { UserProfilesRepository } from 'src/users/repository/user-profiles.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    cacheModule,
    JwtModule,
    TypeOrmModule.forFeature([
      UsersRepository,
      AuthRepository,
      UserProfilesRepository,
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
