import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NoticeBoardsRepository } from 'src/notices/repository/notices-board.repository';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { BoardsController } from './boards.controller';
import { BoardsService } from './boards.service';
import { BoardBookmarkRepository } from './repository/board-bookmark.repository';
import { BoardGuestRepository } from './repository/board-guest.repository';
import { BoardHostRepository } from './repository/board-host.repository';
import { BoardRepository } from './repository/board.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardRepository,
      BoardGuestRepository,
      BoardHostRepository,
      BoardBookmarkRepository,
      UsersRepository,
      NoticesRepository,
      NoticeBoardsRepository,
    ]),
  ],
  providers: [BoardsService],
  controllers: [BoardsController],
})
export class BoardsModule {}
