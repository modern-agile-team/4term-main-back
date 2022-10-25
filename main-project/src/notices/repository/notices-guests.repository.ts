import { InternalServerErrorException } from '@nestjs/common';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeGuests } from '../entity/notice-guest.entity';
import { NoticeGuestDetail } from '../interface/notice.interface';

@EntityRepository(NoticeGuests)
export class NoticeGuestsRepository extends Repository<NoticeGuests> {
  async saveNoticeGuest(guestDetails: NoticeGuestDetail[]): Promise<InsertRaw> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('notices')
        .insert()
        .into(NoticeGuests)
        .values(guestDetails)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알람 생성 에러(saveNoticeGuest): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
