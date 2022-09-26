import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardRepository } from 'src/boards/repository/board.repository';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportRepository } from './repository/reports.repository';

@Module({
  imports: [TypeOrmModule.forFeature([BoardRepository, ReportRepository])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
