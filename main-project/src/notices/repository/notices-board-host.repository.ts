import { InternalServerErrorException } from '@nestjs/common';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeBoardHosts } from '../entity/notice-board-host.entity';
import { NoticeBoards } from '../entity/notice-board.entity';

@EntityRepository(NoticeBoardHosts)
export class NoticeBoardHostsRepository extends Repository<NoticeBoardHosts> {
  async saveNoticeBoardHosts(noticeNo: number, boardNo: number) {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'notice_board_hosts',
      )
        .insert()
        .into(NoticeBoardHosts)
        .values({ noticeNo, boardNo })
        .execute();

      return raw.affectedRows;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 알람 생성 에러(saveNoticeBoardHosts-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
