import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { BoardBookmarks } from '../entity/board-bookmark.entity';

@EntityRepository(BoardBookmarks)
export class BoardBookmarkRepository extends Repository<BoardBookmarks> {
  // 생성
  async createBookmark(boardNo: number, userNo: number): Promise<number> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'boardBookmark',
      )
        .insert()
        .into(BoardBookmarks)
        .values({ boardNo, userNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async cancelBookmark(
    boardNo: number,
    userNo: number,
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(BoardBookmarks)
        .where('boardNo = :boardNo', { boardNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
