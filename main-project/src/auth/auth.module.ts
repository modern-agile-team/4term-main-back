import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from 'src/users/repository/users.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { cacheModule } from 'src/common/configs/redis.config';

@Module({
  imports: [cacheModule, TypeOrmModule.forFeature([UsersRepository])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
