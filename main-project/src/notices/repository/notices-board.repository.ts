import { InternalServerErrorException } from '@nestjs/common';
import { NoticeBoard } from 'src/boards/interface/boards.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeBoards } from '../entity/notice-board.entity';

@EntityRepository(NoticeBoards)
export class NoticeBoardsRepository extends Repository<NoticeBoards> {
    async saveNoticeBoard(noticeBoard: NoticeBoard) {
        try {
            const { raw }: InsertResult = await this.createQueryBuilder(
                'notice_boards',
            )
                .insert()
                .into(NoticeBoards)
                .values(noticeBoard)
                .execute();

            return raw.affectedRows;
        } catch (error) {
            throw new InternalServerErrorException(
                `${error} 알람 생성 에러(saveNoticeBoard): 알 수 없는 서버 오류입니다.`,
            );
        }
    }
}
