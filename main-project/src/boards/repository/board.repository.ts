import { InternalServerErrorException } from '@nestjs/common';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BoardBookmarks } from '../entity/board-bookmark.entity';
import { BoardHostMembers } from '../entity/board-host-members.entity';
import { BoardMemberInfos } from '../entity/board-member-info.entity';
import { Boards } from '../entity/board.entity';
import {
  BoardMemberDetail,
  CreateResponse,
  BookmarkDetail,
  BoardReadResponse,
  BoardDetail,
  CreateHostMembers,
} from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async getBoardByNo(boardNo: number): Promise<BoardReadResponse> {
    try {
      const board = await this.createQueryBuilder('boards')
        .leftJoin('boards.boardMemberInfo', 'boardMemberInfo')
        .leftJoin('boards.userNo', 'users')
        .leftJoin('boards.hostMembers', 'hostMembers')
        .select([
          'boards.no AS no',
          'boards.userNo AS host_user_no',
          'users.nickname AS nickname',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meeting_time',
          'boards.isDone AS isDone',
          'boardMemberInfo.male AS male',
          'boardMemberInfo.female AS female',
          'GROUP_CONCAT(hostMembers.userNo) AS host_member_no',
          'GROUP_CONCAT(users.nickname) AS host_member_name',
        ])
        .where('boards.no = :boardNo', { boardNo })
        .where('hostMembers.boardNo = :boardNo', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async getAllBoards(): Promise<BoardReadResponse[]> {
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
  async createBoard(createBoardDto: BoardDetail): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Boards)
        .values(createBoardDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createBoardMember(
    boardMemberDetail: BoardMemberDetail,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'board_member_infos',
      )
        .insert()
        .into(BoardMemberInfos)
        .values(boardMemberDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createHostMember(
    hostMember: CreateHostMembers,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'board_member_infos',
      )
        .insert()
        .into(BoardHostMembers)
        .values(hostMember)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createBookmark(
    bookmarkDetail: BookmarkDetail,
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'boardBookmark',
      )
        .insert()
        .into(BoardBookmarks)
        .values(bookmarkDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 수정 관련
  async updateBoard(
    boardNo: number,
    boardDetail: BoardDetail,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(Boards)
        .set(boardDetail)
        .where('no = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateBoardMember(
    boardNo: number,
    boardMember: BoardMemberDetail,
  ): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(BoardMemberInfos)
        .set(boardMember)
        .where('boardNo = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoardMember-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async updateHostMember(boardNo: number, userNo: number): Promise<number> {
    try {
      const { affected }: UpdateResult = await this.createQueryBuilder()
        .update(BoardHostMembers)
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
  async deleteBoardMember(boardNo: number): Promise<number> {
    try {
      const { affected }: DeleteResult = await this.createQueryBuilder(
        'board_member_infos',
      )
        .delete()
        .from(BoardMemberInfos)
        .where('boardNo = :boardNo', { boardNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoardMember-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

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
}
