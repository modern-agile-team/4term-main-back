import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { Manners } from '../entity/manners.entity';

@EntityRepository(Manners)
export class MannersRepository extends Repository<Manners> {
  async findMeetingById(meetingNo: number): Promise<any> {
    try {
      const meeting = await this.createQueryBuilder('')
        .where('meetings.no = :meetingNo', { meetingNo })
        .getOne();

      return meeting;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 약속 조회 에러(findMeetingById): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async findAllMembersByBoardNo(boardNo: number): Promise<any> {
    //   async findAllMembersByBoardNo(boardNo: number, userNo : number): Promise<any> {
    try {
      const anything = await this.createQueryBuilder('manners')
        .leftJoin('manners.userNo', 'users')
        .leftJoin('manners.boardNo', 'board')
        .leftJoin('board.hostMembers', 'boardHosts')
        .leftJoin('board.guestMembers', 'boardGuests')
        // .leftJoin('boardHostMembers.boardNo', 'boardNo')
        // .leftJoin('boardGuestTeams.boardNo', 'boardNo')
        .select(['boardHosts.userNo AS userNo'])
        .where('board.no = :boardNo', { boardNo })
        // .andWhere('boardGuestTeams.boardNo = :boardNo', { boardNo })
        .getRawMany();

      return anything;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 멤버 조회(findAllMembersByBoardNo): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
