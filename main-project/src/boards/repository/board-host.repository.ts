import { InternalServerErrorException } from "@nestjs/common";
import { DeleteResult, EntityRepository, InsertResult, Repository, UpdateResult } from "typeorm";
import { BoardHosts } from "../entity/board-host.entity";
import { CreateResponse } from "../interface/boards.interface";

@EntityRepository(BoardHosts)
export class BoardHostRepository extends Repository<BoardHosts> {
    // 생성
    async createHosts(
        hosts: object[],
    ): Promise<CreateResponse> {
        try {
            const { raw }: InsertResult = await this.createQueryBuilder(
                'board_hosts',
            )
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
    async deleteHosts(boardNo: number): Promise<number> {
        try {
            const { affected }: DeleteResult = await this.createQueryBuilder('boardHosts')
                .delete()
                .from(BoardHosts)
                .where('boardNo = :boardNo', { boardNo })
                .execute();

            return affected;
        } catch (error) {
            throw new InternalServerErrorException(
                `${error} deleteHosts-repository: 알 수 없는 서버 에러입니다.`,
            );
        }
    }
}