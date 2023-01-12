import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { BoardGuests } from '../entity/board-guest.entity';
import { BoardParticipation } from '../entity/board-participation.entity';
import { Boards } from '../entity/board.entity';
import { CreateResponse, Participation } from '../interface/boards.interface';

@EntityRepository(BoardParticipation)
export class BoardParticipationRepository extends Repository<BoardParticipation> {
  // 조회
  async getAllGuestsByBoardNo(
    boardNo: number,
  ): Promise<Pick<Boards, 'userNo'>[]> {
    try {
      const guests = await this.createQueryBuilder('boardGuest')
        .leftJoin('boardGuest.teamNo', 'team')
        .select('boardGuest.userNo AS userNo')
        .where('team.boardNo = :boardNo', { boardNo })
        .getRawMany();

      return guests;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllGuestsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createParticipation(
    participation: Participation,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'board_participation',
      )
        .insert()
        .into(BoardParticipation)
        .values(participation)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createGuestMembers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
