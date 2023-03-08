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
import {
  GuestProfile,
  GuestTeam,
  GuestTeamPagenation,
} from '../interface/boards.interface';

@EntityRepository(BoardGuestTeams)
export class BoardGuestTeamsRepository extends Repository<BoardGuestTeams> {
  // 조회
  async getTeamNoByUser(
    boardNo: number,
    userNo: number,
  ): Promise<GuestTeam<number[], GuestProfile>> {
    try {
      const { guests, isAccepted, ...applies }: GuestTeam<string, string> =
        await this.createQueryBuilder('teams')
          .leftJoin('teams.boardGuest', 'guests')
          .select([
            'teams.no AS no',
            'teams.board_no AS boardNo',
            'teams.title AS title',
            'teams.description AS description',
            'JSON_ARRAYAGG(guests.userNo) AS guests',
            'JSON_ARRAYAGG(guests.isAccepted) AS isAccepted',
          ])
          .where('teams.board_no = :boardNo', { boardNo })
          .andWhere('guests.userNo = :userNo', { userNo })
          .getRawOne();

      const infomation: GuestTeam<number[], GuestProfile> = {
        ...applies,
        guests: JSON.parse(guests),
        isAccepted: JSON.parse(isAccepted),
      };

      return infomation;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getTeamNoByUser-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getGuestTeamInfo(
    teamNo: number,
  ): Promise<GuestTeam<number[], GuestProfile>> {
    try {
      const { guests, isAccepted, ...applies }: GuestTeam<string, string> =
        await this.createQueryBuilder('teams')
          .leftJoin('teams.boardGuest', 'guests')
          .leftJoin('guests.userNo', 'users')
          .leftJoin('users.userProfileNo', 'profiles')
          .leftJoin('profiles.profileImage', 'profileImages')
          .select([
            'teams.no AS no',
            'teams.board_no AS boardNo',
            'teams.title AS title',
            'teams.description AS description',
            'teams.createdDate AS createdDate',
            'JSON_ARRAYAGG(guests.isAccepted) AS isAccepted',
            'JSON_ARRAYAGG(JSON_OBJECT("userNo", guests.userNo, "nickname",profiles.nickname, "profileImage", profileImages.image_url)) AS guests',
          ])
          .where('teams.no = :teamNo', { teamNo })
          .getRawOne();

      const infomation: GuestTeam<number[], GuestProfile> = {
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
  ): Promise<Omit<GuestTeamPagenation, 'acceptedGuestTeamNo'>> {
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
          .andWhere('teams.isAccepted = TRUE')
          .limit(10);

      const totalPage: number = Math.ceil((await query.getCount()) / 10);

      if (page > 1) {
        query.offset((page - 1) * 10);
      }

      const guestTeams = await query.getRawMany();

      const convertGuestTeams: GuestTeam<number[], GuestProfile>[] =
        guestTeams.map(({ guests, ...guetTemaInfo }) => {
          const guetTeam: GuestTeam<number[], GuestProfile> = {
            ...guetTemaInfo,
            guests: JSON.parse(guests),
          };

          return guetTeam;
        });

      return { guestTeams: convertGuestTeams, totalPage, page };
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamsByBoardNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAcceptedGuestTeamNo(
    boardNo: number,
  ): Promise<Pick<BoardGuestTeams, 'no'>> {
    try {
      const guestTeam: Pick<BoardGuestTeams, 'no'> =
        await this.createQueryBuilder('teams')
          .leftJoin('teams.boardNo', 'boards')
          .leftJoin('boards.chatBoard', 'chatLists')
          .select(['teams.no AS no'])
          .where('chatLists.board_no = :boardNo', { boardNo })
          .getRawOne();

      return guestTeam;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getGuestTeamInfo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 생성
  async createGuestTeam(
    participation: GuestTeam<boolean, GuestProfile>,
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
