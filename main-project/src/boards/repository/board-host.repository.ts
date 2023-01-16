import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { BoardHosts } from '../entity/board-host.entity';

@EntityRepository(BoardHosts)
export class BoardHostsRepository extends Repository<BoardHosts> {
  // 생성
  async createHosts(hosts: object[]): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(BoardHosts)
        .values(hosts)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async deleteHosts(boardNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(BoardHosts)
        .where('boardNo = :boardNo', { boardNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
