import { InternalServerErrorException } from '@nestjs/common';
import { JsonArray } from 'src/common/interface/interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { NoticeBoardHosts } from '../entity/notice-board-host.entity';

@EntityRepository(NoticeBoardHosts)
export class NoticeBoardHostsRepository extends Repository<NoticeBoardHosts> {
  // 조회
  async getIsAcceptedsByBoardNo(boardNo: number): Promise<number[]> {
    try {
      const { isAccepted }: JsonArray = await this.createQueryBuilder()
        .select(['JSON_ARRAYAGG(isAccepted) AS isAccepted'])
        .where('board_no = :boardNo', { boardNo })
        .getRawOne();

      const isAccepteds: number[] = JSON.parse(isAccepted);

      return isAccepteds;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 조회 에러(getIsAcceptedsByBoardNo-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  // 생성
  async saveNoticeBoardHosts(noticeNo: number, boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(NoticeBoardHosts)
        .values({ noticeNo, boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNoticeBoardHosts-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
