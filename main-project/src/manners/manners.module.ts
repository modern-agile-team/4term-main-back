import { Module } from '@nestjs/common';
import { MannersService } from './manners.service';
import { MannersController } from './manners.controller';
import { MannersRepository } from './repository/manners.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { MannersLogRepository } from './repository/mannersLog.repository';
import { ChatListRepository } from 'src/chats/repository/chat-list.repository';
import { ChatUsersRepository } from 'src/chats/repository/chat-users.repository';
import { MeetingRepository } from 'src/meetings/repository/meeting.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MannersRepository,
      MannersLogRepository,
      BoardRepository,
      ChatListRepository,
      ChatUsersRepository,
      MeetingRepository,
      NoticesRepository,
    ]),
  ],
  providers: [MannersService],
  controllers: [MannersController],
})
export class MannersModule {}
