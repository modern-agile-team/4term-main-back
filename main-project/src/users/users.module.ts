import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './repository/users.repository';
import { UserProfilesRepository } from './repository/user-profiles.repository';
import { AwsService } from 'src/aws/aws.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRepository, UserProfilesRepository]),
  ],
  providers: [UsersService, AwsService],
  controllers: [UsersController],
})
export class UsersModule {}
