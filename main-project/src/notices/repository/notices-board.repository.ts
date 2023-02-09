import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeBoards } from '../entity/notice-board.entity';

@EntityRepository(NoticeBoards)
export class NoticeBoardsRepository extends Repository<NoticeBoards> {
  async saveNoticeBoard(noticeNo: number, boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(NoticeBoards)
        .values({ noticeNo, boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNoticeBoard): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
