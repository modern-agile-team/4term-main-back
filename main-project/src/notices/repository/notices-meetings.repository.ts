import { InternalServerErrorException } from '@nestjs/common';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { NoticeMeetings } from '../entity/notice-meeting.entity';
import { NoticeMeetingDetail } from '../interface/notice.interface';

@EntityRepository(NoticeMeetings)
export class NoticeMeetingsRepository extends Repository<NoticeMeetings> {
  async saveNoticeMeeting(
    meetingDetail: NoticeMeetingDetail,
  ): Promise<InsertRaw> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'notice_meetings',
      )
        .insert()
        .into(NoticeMeetings)
        .values(meetingDetail)
        .execute();

      return raw;
    } catch (err) {
      throw new InternalServerErrorException(
        `${err} 알람 생성 에러(saveNoticeMeeting): 알 수 없는 서버 오류입니다.`,
      );
    }
  }
}
