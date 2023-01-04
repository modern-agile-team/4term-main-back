import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './repository/users.repository';
import { UserProfilesRepository } from './repository/user-profiles.repository';
import { AwsService } from 'src/aws/aws.service';
import { ProfileImagesRepository } from './repository/profile-images.repository';
import { jwtModule } from 'src/common/configs/jwt-module.config';
import { cacheModule } from 'src/common/configs/redis.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersRepository,
      UserProfilesRepository,
      ProfileImagesRepository,
    ]),
    jwtModule,
    cacheModule,
  ],
  providers: [UsersService, AwsService],
  controllers: [UsersController],
})
export class UsersModule {}
