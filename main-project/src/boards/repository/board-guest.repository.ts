import { InternalServerErrorException } from "@nestjs/common";
import { EntityRepository, InsertResult, Repository } from "typeorm";
import { BoardGuests } from "../entity/board-guest.entity";
import { BoardAndUserNumber, CreateResponse } from "../interface/boards.interface";

@EntityRepository(BoardGuests)
export class BoardGuestRepository extends Repository<BoardGuests> {
    // 생성
    async createGuestMembers(
        boardNo: number, userNo: number
    ): Promise<CreateResponse> {
        try {
            const { raw }: InsertResult = await this.createQueryBuilder(
                'board_guests',
            )
                .insert()
                .into(BoardGuests)
                .values({ userNo, boardNo })
                .execute();

            return raw;
        } catch (error) {
            throw new InternalServerErrorException(
                `${error} createGuestMembers-repository: 알 수 없는 서버 에러입니다.`,
            );
        }
    }
}