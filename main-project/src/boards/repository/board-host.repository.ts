import { InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, InsertResult, Repository } from "typeorm";
import { CreateResponse } from "../boards.service";
import { BoardHosts } from "../entity/board-host.entity";

@EntityRepository(BoardHosts)
export class BoardHostRepository extends Repository<BoardHosts> {
    async createHostMember(
        hostArr: object[],
    ): Promise<CreateResponse> {
        try {
            const { raw }: InsertResult = await this.createQueryBuilder(
                'board_hosts',
            )
                .insert()
                .into(BoardHosts)
                .values(hostArr)
                .execute();

            return raw;
        } catch (error) {
            throw new InternalServerErrorException(
                `${error} createHostMember-repository: 알 수 없는 서버 에러입니다.`,
            );
        }
    }
}