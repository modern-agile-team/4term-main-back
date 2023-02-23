import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { BoardGuests } from '../entity/board-guest.entity';
import { Board, Guest, GuestTeam } from '../interface/boards.interface';

@EntityRepository(BoardGuests)
export class BoardGuestsRepository extends Repository<BoardGuests> {
  // 조회
  async getAllGuestsByBoardNo(boardNo: number): Promise<number[]> {
    try {
      const guestTeam: GuestTeam<string> = await this.createQueryBuilder(
        'boardGuest',
      )
        .leftJoin('boardGuest.teamNo', 'team')
        .select('JSON_ARRAYAGG(boardGuest.userNo) AS guests')
        .where('team.boardNo = :boardNo', { boardNo })
        .getRawOne();

      const guests: number[] = JSON.parse(guestTeam.guests);

      return guests;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllGuestsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 수정
  async accpetGuestInvite(teamNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update()
        .set({ isAccepted: true })
        .where('teamNo = :teamNo', { teamNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} accpetGuestInvite-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createGuests(guests: Guest<boolean>[]): Promise<void> {
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
