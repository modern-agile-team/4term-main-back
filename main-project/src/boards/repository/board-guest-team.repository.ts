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
import { GuestTeam, GuestTeamPagenation } from '../interface/boards.interface';

@EntityRepository(BoardGuestTeams)
export class BoardGuestTeamsRepository extends Repository<BoardGuestTeams> {
  // 조회
  async getGuestTeamInfo(teamNo: number): Promise<GuestTeam<number[]>> {
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
          .where('teams.no = :teamNo', { teamNo })
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
    page: number,
  ): Promise<GuestTeamPagenation> {
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
          .where('teams.isAccepted = TRUE')
          .limit(10);

      const totalPage: number = Math.ceil((await query.getCount()) / 10);

      if (page > 1) {
        query.offset((page - 1) * 10);
      }

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

      return { guestTeams: convertGuestTeams, totalPage, page };
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getGuestTeamByTeamNo(teamNo: number): Promise<GuestTeam<number[]>> {
    try {
      const {
        guests,
        ...guestTeam
      }: Omit<GuestTeam<string>, 'isAccepted'> = await this.createQueryBuilder(
        'teams',
      )
        .leftJoin('teams.boardGuest', 'guestss')
        .select([
          'teams.no AS no',
          'teams.board_no AS boardNo',
          'teams.title AS title',
          'teams.description AS description',
          'JSON_ARRAYAGG(guestss.userNo) AS guests',
        ])
        .where('teams.no = :teamNo', { teamNo })
        .getRawOne();

      const guestTeamInfo: GuestTeam<number[]> = {
        ...guestTeam,
        guests: JSON.parse(guests),
      };

      return guestTeamInfo;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamByTeamNo-repository: 알 수 없는 서버 에러입니다.`,
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
        `${error} updateIsAccepted-repository: 알 수 없는 서버 에러입니다.`,
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
