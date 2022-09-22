import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateBoardDto } from '../dto/create-board.dto';
import { UpdateBoardDto } from '../dto/update-board.dto';
import { BoardBookmarks } from '../entity/board-bookmark.entity';
import { BoardMemberInfos } from '../entity/board-member-info.entity';
import { Boards } from '../entity/board.entity';
import {
  BoardMemberDetail,
  BoardCreateResponse,
  BookmarkDetail,
  BoardReadResponse,
} from '../interface/boards.interface';

@EntityRepository(Boards)
export class BoardRepository extends Repository<Boards> {
  // 게시글 조회 관련
  async getBoardByNo(boardNo: number): Promise<BoardReadResponse> {
    try {
      const board = this.createQueryBuilder('boards')
        .select([
          'boards.no AS no',
          'boards.userNo AS user_no',
          'boards.meetingNo AS meeting_no',
          'boards.title AS title',
          'boards.description AS description',
          'boards.location AS location',
          'boards.meetingTime AS meeting_time',
          'boards.isDone AS isDone',
        ])
        .where('boards.no=:boardNo', { boardNo })
        .getRawOne();

      return board;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getBoardByNo-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //게시글 생성 관련
  async createBoard(
    createBoardDto: CreateBoardDto,
  ): Promise<BoardCreateResponse> {
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
  ): Promise<BoardCreateResponse> {
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

  async createBookmark(
    bookmarkDetail: BookmarkDetail,
  ): Promise<BoardCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'board_bookmarks',
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
    dbData: BoardReadResponse,
    updateBoardDto: UpdateBoardDto,
  ): Promise<object> {
    try {
      const { title, description, isDone, location, meetingTime } =
        updateBoardDto;

      dbData.title = title;
      dbData.description = description;
      dbData.isDone = isDone;
      dbData.location = location;
      dbData.meetingTime = meetingTime;

      const save = await this.save(dbData);

      return save;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} updateBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
