import { InternalServerErrorException } from '@nestjs/common';
import { JsonArray } from 'src/common/interface/interface';
import { EntityRepository, Repository } from 'typeorm';
import { BoardGuests } from '../entity/board-guest.entity';
import { Boards } from '../entity/board.entity';
import { Guest } from '../interface/boards.interface';

@EntityRepository(BoardGuests)
export class BoardGuestsRepository extends Repository<BoardGuests> {
  // 조회
  async getAllGuestsByBoardNo(boardNo: number): Promise<JsonArray> {
    try {
      const guests: JsonArray = await this.createQueryBuilder('boardGuest')
        .leftJoin('boardGuest.teamNo', 'team')
        .select('JSON_ARRAYAGG(boardGuest.userNo) AS userNo')
        .where('team.boardNo = :boardNo', { boardNo })
        .getRawOne();

      return guests;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllGuestsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createGuests(guests: Guest[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(BoardGuests)
        .values(guests)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createGuests-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
