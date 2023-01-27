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
  async getInviteNotcie(
    boardNo: number,
    userNo: number,
  ): Promise<NoticeBoardHosts> {
    const notice: NoticeBoardHosts = await this.createQueryBuilder(
      'noticeBoardHosts',
    )
      .leftJoin('noticeBoardHosts.noticeNo', 'notices')
      .select([
        'noticeBoardHosts.no AS no',
        'noticeBoardHosts.isAccepted AS isAccepted',
      ])
      .where('noticeBoardHosts.boardNo = :boardNo', { boardNo })
      .andWhere('notices.targetUserNo = :userNo', { userNo })
      .getRawOne();

    return notice;
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

  // 수정
  async acceptInvite(no: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update()
        .set({ isAccepted: true })
        .where('no = :no', { no })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} 게시글 호스트멤버 초대 수락(acceptInvite-repository): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
