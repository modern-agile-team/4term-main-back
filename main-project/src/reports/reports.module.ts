import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from 'src/boards/boards.service';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { UserProfileRepository } from 'src/users/repository/users-profile.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { UsersService } from 'src/users/users.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportRepository } from './repository/reports.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardRepository,
      ReportRepository,
      UsersRepository,
      UserProfileRepository,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService, BoardsService, UsersService],
})
export class ReportsModule {}
