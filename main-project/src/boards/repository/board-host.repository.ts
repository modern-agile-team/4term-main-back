import { InternalServerErrorException } from '@nestjs/common';
import { JsonArray } from 'src/common/interface/interface';
import { EntityRepository, Repository } from 'typeorm';
import { BoardHosts } from '../entity/board-host.entity';

@EntityRepository(BoardHosts)
export class BoardHostsRepository extends Repository<BoardHosts> {
  // 조회
  async getHosts(boardNo: number): Promise<number[]> {
    try {
      const { userNo }: JsonArray = await this.createQueryBuilder()
        .select('JSON_ARRAYAGG(user_no) AS userNo')
        .where('board_no = :boardNo', { boardNo })
        .getRawOne();

      const hosts: number[] = JSON.parse(userNo);

      return hosts;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // 생성
  async createHosts(
    hosts: Pick<BoardHosts, 'boardNo' | 'userNo'>[],
  ): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(BoardHosts)
        .values(hosts)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제
  async deleteHosts(boardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(BoardHosts)
        .where('boardNo = :boardNo', { boardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteHosts-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
