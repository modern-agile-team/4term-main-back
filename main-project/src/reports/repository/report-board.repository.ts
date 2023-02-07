import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ReportBoards } from '../entity/report-board.entity';

@EntityRepository(ReportBoards)
export class ReportBoardRepository extends Repository<ReportBoards> {
  // 신고글 작성 관련
  async createBoardReport(reportNo: number, boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(ReportBoards)
        .values({ reportNo, targetBoardNo: boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoardReport-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
