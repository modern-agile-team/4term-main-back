import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { NoticeBoards } from '../entity/notice-board.entity';
import { Notices } from '../entity/notices.entity';

@EntityRepository(NoticeBoards)
export class NoticeBoardsRepository extends Repository<NoticeBoards> {
  async getNoticeByBoardNo(boardNo: number): Promise<Notices[]> {
    try {
      const notices: Notices[] = await this.createQueryBuilder('noticeBoards')
        .leftJoin('noticeBoards.noticeNo', 'notices')
        .select(['notices.no AS no'])
        .where('noticeBoards.board_no = :boardNo', { boardNo })
        .getRawMany();

      return notices;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 게시글 번호로 알림 조회(getNoticeByBoardNo): 알 수 없는 서버 오류입니다.`,
      );
    }
  }

  async getHostNotice(boardNo: number, userNo: number): Promise<Notices> {
    try {
      const notice: Notices = await this.createQueryBuilder('noticeBoards')
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

  async getGuestNotice(boardNo: number, userNo: number): Promise<Notices> {
    try {
      const notice: Notices = await this.createQueryBuilder('noticeBoards')
        .leftJoin('noticeBoards.noticeNo', 'notices')
        .select(['notices.no AS no'])
        .where('noticeBoards.board_no = :boardNo', { boardNo })
        .andWhere('notices.user_no = :userNo', { userNo })
        .andWhere('notices.type = 5')
        .getRawOne();

      return notice;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestNotice-repository: 알 수 없는 서버 에러입니다.`,
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
