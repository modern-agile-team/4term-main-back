import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { BoardParticipation } from '../entity/board-participation.entity';
import { Boards } from '../entity/board.entity';
import { CreateResponse } from '../interface/boards.interface';

@EntityRepository(BoardParticipation)
export class BoardParticipationRepository extends Repository<BoardParticipation> {
  // 조회
  async getAllGuestsByBoardNo(
    boardNo: number,
  ): Promise<Pick<Boards, 'userNo'>[]> {
    try {
      const guests = await this.createQueryBuilder('boardGuest')
        .select('boardGuest.userNo AS userNo')
        .where('boardGuest.boardNo = :boardNo', { boardNo })
        .getRawMany();

      return guests;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllGuestsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createGuestMembers(guests: object[]): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'board_guests',
      )
        .insert()
        .into(BoardParticipation)
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
