import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuestMembersRepository } from './repository/guest-members.repository';
import { HostMembersRepository } from './repository/host-members.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([HostMembersRepository, GuestMembersRepository]),
  ],
  providers: [MembersService],
  controllers: [MembersController],
})
export class MembersModule {}
