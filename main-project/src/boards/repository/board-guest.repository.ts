import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { BoardGuests } from '../entity/board-guest.entity';
import { Boards } from '../entity/board.entity';
import { CreateResponse } from '../interface/boards.interface';

@EntityRepository(BoardGuests)
export class BoardGuestRepository extends Repository<BoardGuests> {
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
  async createGuests(guests: object[]): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(BoardGuests)
        .values(guests)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createGuestMembers-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
