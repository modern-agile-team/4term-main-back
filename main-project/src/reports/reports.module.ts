import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportBoardRepository } from './repository/report-board.repository';
import { ReportRepository } from './repository/reports.repository';
import { ReportUserRepository } from './repository/report-user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardRepository,
      ReportRepository,
      UsersRepository,
      ReportBoardRepository,
      ReportUserRepository,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
