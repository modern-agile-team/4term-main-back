import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { BoardGuestTeams } from '../entity/board-guest-team.entity';
import { Boards } from '../entity/board.entity';
import { GuestTeam } from '../interface/boards.interface';

@EntityRepository(BoardGuestTeams)
export class BoardGuestTeamsRepository extends Repository<BoardGuestTeams> {
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
  async createGuestTeam(participation: GuestTeam): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(BoardGuestTeams)
        .values(participation)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createGuestTeam-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
