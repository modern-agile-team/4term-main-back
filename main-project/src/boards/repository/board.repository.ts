import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import { ChatRoomOfBoard } from 'src/chats/interface/chat.interface';
import {
  EntityRepository,
  InsertResult,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';
import { BoardFilterDto } from '../dto/board-filter.dto';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { Boards } from '../entity/board.entity';
import { Board, BoardPagenation } from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardsRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async checkDeadline(): Promise<number[]> {
    try {
      const board = await this.createQueryBuilder()
        .select(['JSON_ARRAYAGG(no) AS no'])
        .where('isDone = :isDone', { isDone: false })
        .andWhere('is_impromptu = :isImpromptu', { isImpromptu: true })
        .andWhere('TIMESTAMPDIFF(hour, created_date, NOW()) >= 24')
        .getOne();

      const boards: number[] = JSON.parse(String(board.no));

      return boards;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} checkDeadline-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardByTeamNo(teamNo: number) {
    try {
      const board: Boards = await this.createQueryBuilder('boards')
        .leftJoin('boards.teamNo', 'guestTeams')
        .where('guestTeams.no = :teamNo', { teamNo })
        .getOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByTeamNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardByNo(
    no: number,
    userNo: number,
  ): Promise<Board<number[], string[]>> {
    try {
      const {
        hostMemberNums,
        hostMemberNicknames,
        ...board
      }: Board<string, string> = await this.createQueryBuilder('boards')
        .leftJoin('boards.userNo', 'users')
        .leftJoin('boards.boardBookmark', 'bookmarks')
        .leftJoin('users.userProfileNo', 'profile')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'boards.no AS no',
          'boards.userNo AS hostUserNo',
          'profile.nickname AS hostNickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.isDone AS isDone',
          'boards.recruitMale AS recruitMale',
          'boards.recruitFemale AS recruitFemale',
          'boards.isImpromptu AS isImpromptu',
          'boards.meetingTime AS meetingTime',
          `IF(bookmarks.board_no = boards.no AND bookmarks.user_no = ${userNo}, TRUE, FALSE) AS bookmakrs`,
          `DATE_FORMAT(boards.createdDate, '%Y.%m.%d %T') AS createdDate`,
          'JSON_ARRAYAGG(hosts.userNo) AS hostMemberNums',
          'JSON_ARRAYAGG(hostProfile.nickname) AS hostMemberNicknames',
        ])
        .where('boards.no = :no', { no })
        .andWhere('hosts.board_no = :no', { no })
        .getRawOne();

      const convertBoard: Board<number[], string[]> = {
        ...board,
        hostMemberNums: JSON.parse(hostMemberNums),
        hostMemberNicknames: JSON.parse(hostMemberNicknames),
      };

      return convertBoard;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoards({
    gender,
    people,
    page,
    isDone,
    isImpromptu,
    take,
  }: BoardFilterDto): Promise<BoardPagenation> {
    try {
      const query: SelectQueryBuilder<Boards> = this.createQueryBuilder(
        'boards',
      )
        .leftJoin('boards.userNo', 'users')
        .leftJoin('users.userProfileNo', 'profiles')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'DISTINCT boards.no AS no',
          'boards.userNo AS hostUserNo',
          'profiles.nickname AS hostNickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.isDone AS isDone',
          'boards.isImpromptu AS isImpromptu',
          'boards.recruitMale AS recruitMale',
          'boards.recruitFemale AS recruitFemale',
          'boards.meeting_time AS meetingTime',
          `DATE_FORMAT(boards.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .where('boards.is_accepted = 1')
        .orderBy('boards.no', 'DESC')
        .limit(10);

      if (gender) {
        query.andWhere(`boards.${gender} = :gender`, { gender: 0 });
      }
      if (people) {
        query.andWhere('boards.recruitMale + boards.recruitFemale = :people', {
          people,
        });
      }
      if (isDone) {
        query.andWhere(`boards.isDone = :isDone`, { isDone });
      }
      if (isImpromptu) {
        query.andWhere(`boards.isImpromptu = :isImpromptu`, {
          isImpromptu,
        });
      }
      if (take) {
        query.limit(take);
      }
      const totalPage: number = Math.ceil((await query.getCount()) / 10);

      if (page > 1) {
        query.offset((page - 1) * 10);
      }
      const boards: Board<number[], string[]>[] = await query.getRawMany();

      return { boards, totalPage, page };
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoardsByUser(
    userNo: number,
    type: number,
  ): Promise<Board<void, void>[]> {
    try {
      const boards: SelectQueryBuilder<Boards> = this.createQueryBuilder(
        'boards',
      )
        .leftJoin('boards.userNo', 'users')
        .leftJoin('boards.boardBookmark', 'bookmarks')
        .leftJoin('users.userProfileNo', 'profiles')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('boards.teamNo', 'guestTeam')
        .leftJoin('guestTeam.boardGuest', 'guests')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'DISTINCT boards.no AS no',
          'boards.userNo AS hostUserNo',
          'profiles.nickname AS hostNickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.isDone AS isDone',
          'boards.isImpromptu AS isImpromptu',
          'boards.recruitMale AS recruitMale',
          'boards.recruitFemale AS recruitFemale',
          'boards.meetingTime AS meetingTime',
          `DATE_FORMAT(boards.createdDate, '%Y.%m.%d %T') AS createdDate`,
        ])
        .orderBy('boards.no', 'DESC');

      switch (type) {
        case 1:
          boards.where('boards.userNo = :userNo', { userNo });
          break;
        case 2:
          boards.where('hosts.userNo = :userNo', { userNo });
          break;
        case 3:
          boards.where('guests.userNo = :userNo', { userNo });
          break;
        case 4:
          boards.where('bookmarks.userNo = :userNo', { userNo });
          break;
        default:
          throw new BadRequestException(
            '유저별 게시글 검색(getBoardsByUser-repository): type을 잘못 입력했습니다.',
          );
      }

      return await boards.getRawMany();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardsByUser-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 생성 관련
  async createBoard(
    userNo: number,
    board: Omit<CreateBoardDto, 'hostMembers'>,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(Boards)
        .values({ userNo, ...board })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Boards)
        .set(updateBoardDto)
        .where('no = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateBoardAccepted(boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Boards)
        .set({ isAccepted: true })
        .where('no = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoardAccepted-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeImpromptuBoard(): Promise<void> {
    try {
      await this.createQueryBuilder()
        .update(Boards)
        .set({ isDone: true })
        .where('isDone = :isDone', { isDone: false })
        .andWhere('isImpromptu = :isImpromptu', { isImpromptu: true })
        .andWhere('TIMESTAMPDIFF(hour, created_date, NOW()) >= 24')
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} closeImpromptuBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async closeBoard(boardNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Boards)
        .set({ isDone: true })
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} closeBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 게시글 삭제 관련
  async deleteBoard(boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder('boards')
        .delete()
        .from(Boards)
        .where('no = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getUsersByBoardNo(
    boardNo: number,
    userNo: number,
    guestTeamNo,
  ): Promise<ChatRoomOfBoard> {
    try {
      const users: ChatRoomOfBoard = await this.createQueryBuilder('boards')
        .leftJoin('boards.hosts', 'hostTeam')
        .leftJoin('hostTeam.userNo', 'hostUser')
        .leftJoin('hostUser.userProfileNo', 'hostProfile')
        .leftJoin('boards.teamNo', 'guestTeams')
        .leftJoin('guestTeams.boardGuest', 'guestTeam')
        .leftJoin('guestTeam.userNo', 'guestUser')
        .leftJoin('guestUser.userProfileNo', 'guestProfile')
        .select([
          'boards.no AS boardNo',
          'GROUP_CONCAT(DISTINCT hostProfile.nickname) AS hostsNickname',
          'GROUP_CONCAT(DISTINCT guestProfile.nickname) AS guestsNickname',
          'GROUP_CONCAT(DISTINCT hostTeam.userNo) AS hostsUserNo',
          'GROUP_CONCAT(DISTINCT guestTeam.userNo) AS guestsUserNo',
        ])
        .where(
          `boards.no = :boardNo 
           AND boards.userNo = :userNo 
           AND guestTeams.no = :guestTeamNo
           `,
          {
            boardNo,
            userNo,
            guestTeamNo,
          },
        )
        .getRawOne();

      return users;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getUserListByBoardNo: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getBoard(boardNo: number): Promise<Boards> {
    try {
      const board: Boards = await this.createQueryBuilder('boards')
        .select('user_no AS userNo')
        .where('no = :boardNo ', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoard: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
