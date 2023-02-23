import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoards } from '../entity/notice-board.entity';

@EntityRepository(NoticeBoards)
export class NoticeBoardsRepository extends Repository<NoticeBoards> {
  async getHostNotice(boardNo: number, userNo: number) {
    try {
      const notice = await this.createQueryBuilder('noticeBoards')
        .leftJoin('noticeBoards.noticeNo', 'notices')
        .select(['notices.no AS no'])
        .where('noticeBoards.boardNo = :boardNo', { boardNo })
        .andWhere('notices.userNo = :userNo', { userNo })
        .getRawOne();

      return notice;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getHostNotice-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

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
