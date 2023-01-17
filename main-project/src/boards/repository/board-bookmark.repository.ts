import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { BoardBookmarks } from '../entity/board-bookmark.entity';

@EntityRepository(BoardBookmarks)
export class BoardBookmarksRepository extends Repository<BoardBookmarks> {
  // 생성
  async createBookmark(boardNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(BoardBookmarks)
        .values({ boardNo, userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBookmark-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async cancelBookmark(boardNo: number, userNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(BoardBookmarks)
        .where('boardNo = :boardNo', { boardNo })
        .andWhere('userNo = :userNo', { userNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoard-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
