import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { BoardGuestTeam } from 'src/chats/interface/chat.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { BoardGuestTeams } from '../entity/board-guest-team.entity';
import { GuestTeam } from '../interface/boards.interface';

@EntityRepository(BoardGuestTeams)
export class BoardGuestTeamsRepository extends Repository<BoardGuestTeams> {
  // 조회
  async getGuestTeamInfo(boardNo: number): Promise<GuestTeam<number[]>> {
    try {
      const { guests, isAccepted, ...applies }: GuestTeam<string> =
        await this.createQueryBuilder('teams')
          .leftJoin('teams.boardGuest', 'guests')
          .select([
            'guests.teamNo AS teamNo',
            'teams.title AS title',
            'teams.description AS description',
            'JSON_ARRAYAGG(guests.userNo) AS guests',
            'JSON_ARRAYAGG(guests.isAccepted) AS isAccepted',
          ])
          .where('teams.boardNo = :boardNo', { boardNo })
          .getRawOne();

      const infomation: GuestTeam<number[]> = {
        ...applies,
        guests: JSON.parse(guests),
        isAccepted: JSON.parse(isAccepted),
      };

      return infomation;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamInfo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getGuestTeamsByBoardNo(
    boardNo: number,
  ): Promise<GuestTeam<number[]>[]> {
    try {
      const query: SelectQueryBuilder<BoardGuestTeams> =
        this.createQueryBuilder('teams')
          .leftJoin('teams.boardGuest', 'guests')
          .select([
            'guests.teamNo AS teamNo',
            'teams.title AS title',
            'teams.description AS description',
            'JSON_ARRAYAGG(guests.userNo) AS guests',
          ])
          .where('teams.boardNo = :boardNo', { boardNo })
          .groupBy('guests.teamNo')
          .where('teams.isAccepted = TRUE');

      const guestTeams = await query.getRawMany();

      const convertGuestTeams: GuestTeam<number[]>[] = guestTeams.map(
        ({ guests, ...guetTemaInfo }) => {
          const guetTeam: GuestTeam<number[]> = {
            ...guetTemaInfo,
            guests: JSON.parse(guests),
          };

          return guetTeam;
        },
      );

      return convertGuestTeams;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createGuestTeam(
    participation: GuestTeam<boolean>,
  ): Promise<ResultSetHeader> {
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

  // 수정
  async updateIsAccepted(teamNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update()
        .set({ isAccepted: true })
        .where('no = :teamNo', { teamNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateAppliesAccepted-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async deleteGuestTeam(teamNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('boards')
        .delete()
        .from(BoardGuestTeams)
        .where('no = :teamNo', { teamNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteGuestTeam-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getGuestTeams(boardNo: number): Promise<BoardGuestTeam[]> {
    try {
      const guestTeam: BoardGuestTeam[] = await this.createQueryBuilder(
        'board_guest_teams',
      )
        .select(['board_guest_teams.no as teamNo'])
        .where('board_guest_teams.board_no = :boardNo', { boardNo })
        .getRawMany();

      return guestTeam;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeam: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
