import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { UsersRepository } from 'src/users/repository/users.repository';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { BoardReportRepository } from './repository/board-report.repository';
import { ReportRepository } from './repository/reports.repository';
import { UserReportRepository } from './repository/user-report.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardRepository,
      ReportRepository,
      UsersRepository,
      BoardReportRepository,
      UserReportRepository,
    ]),
  ],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
