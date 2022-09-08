import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { MeetingRepository } from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeetingRepository,
      MeetingInfoRepository,
      HostMembersRepository,
      GuestMembersRepository,
    ]),
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
