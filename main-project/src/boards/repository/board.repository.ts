import { InternalServerErrorException } from '@nestjs/common';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BoardDto } from '../dto/board.dto';
import { BoardHosts } from '../entity/board-host.entity';
import { Boards } from '../entity/board.entity';
import { BoardIF } from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async getBoardByNo(boardNo: number): Promise<BoardIF> {
    try {
      const board = await this.createQueryBuilder('boards')
        .leftJoin('boards.boardMemberInfo', 'boardMemberInfo')
        .leftJoin('boards.userNo', 'users')
        .leftJoin('users.userProfileNo', 'profile')
        .leftJoin('boards.hosts', 'hosts')
        .leftJoin('hosts.userNo', 'hostUsers')
        .leftJoin('hostUsers.userProfileNo', 'hostProfile')
        .select([
          'boards.no AS no',
          'boards.userNo AS userNo',
          'profile.nickname AS nickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meetingTime',
          'boards.isDone AS isDone',
          'boardMemberInfo.male AS male',
          'boardMemberInfo.female AS female',
          'GROUP_CONCAT(hosts.userNo) AS hostUserNums',
          'GROUP_CONCAT(hostProfile.nickname) AS hostNicknames',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .where('hosts.boardNo = :boardNo', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllBoards(): Promise<BoardIF[]> {
    try {
      const boards = await this.createQueryBuilder('boards')
        .select([
          'boards.no AS no',
          'boards.userNo AS user_no',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meeting_time',
          'boards.isDone AS isDone',
        ])
        .orderBy('boards.no', 'DESC')
        .getRawMany();

      return boards;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getAllBoards-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 생성 관련
  async createBoard(userNo: number, newBoard: Omit<BoardDto, 'hostMembers' | 'userNo'>): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Boards)
        .values({ userNo, ...newBoard })
        .execute();

      return raw.insertId;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    board: Partial<BoardDto>,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('boards')
        .update(Boards)
        .set(board)
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateHostMember(boardNo: number, userNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder('boards')
        .update(BoardHosts)
        .set({ userNo })
        .where('userNo = :userNo', { userNo })
        .where('boardNo = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoardMember-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 게시글 삭제 관련
  async deleteBoard(boardNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder('boards')
        .delete()
        .from(Boards)
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async cancelBookmark(boardNo: number, userNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'boardBookmark',
      )
        .delete()
        .from(BoardBookmarks)
        .where('boardNo = :boardNo', { boardNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteBookmark(boardNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'boardBookmark',
      )
        .delete()
        .from(BoardBookmarks)
        .where('boardNo = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  async getUserListByBoardNo(boardNo) {
    try {
      const userList = await this.createQueryBuilder('boards')
        .leftJoin('boards.hosts', 'hostList')
        .leftJoin('boards.guests', 'guestList')
        .leftJoin('hostList.userNo', 'hostUser')
        .leftJoin('guestList.userNo', 'guestUser')
        .leftJoin('hostUser.userProfileNo', 'hostProfile')
        .leftJoin('guestUser.userProfileNo', 'guestProfile')
        .select([
          'GROUP_CONCAT(DISTINCT hostProfile.nickname) AS hostNickname',
          'GROUP_CONCAT(DISTINCT guestProfile.nickname) AS guestNickname',
          'GROUP_CONCAT(DISTINCT hostList.user_no) AS hostUserNo',
          'GROUP_CONCAT(DISTINCT guestList.user_no) AS guestUserNo',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .getRawOne();

      return userList;
    } catch (error) { }
  }
}

// 삭제 예정
@EntityRepository(Users)
export class TestUserRepo extends Repository<UsersRepository> {
  async getUserByNickname(nickname: string) {
    try {
      const userNo = await this.createQueryBuilder('users')
        .leftJoin('users.userProfileNo', 'profile')
        .select(['users.no AS no'])
        .where('profile.nickname = :nickname', { nickname })
        .getRawOne();

      return userNo;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getUserByNickname-testRepo: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
