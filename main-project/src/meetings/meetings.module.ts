import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import {
  MeetingInfoRepository,
  MeetingRepository,
} from './repository/meeting.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingInfoRepository } from './repository/meeting-info.repository';
import { HostMembersRepository } from 'src/members/repository/host-members.repository';
import { GuestMembersRepository } from 'src/members/repository/guest-members.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeetingRepository,
      MeetingInfoRepository,
      HostMembersRepository,
      GuestMembersRepository,
      NoticesRepository,
    ]),
  ],
  providers: [MeetingsService],
  controllers: [MeetingsController],
})
export class MeetingsModule {}
