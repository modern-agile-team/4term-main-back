import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice, NoticeConditions } from './interface/notice.interface';
import { NoticesRepository } from './repository/notices.repository';

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(NoticesRepository)
    private readonly noticeRepository: NoticesRepository,
  ) {}
  async getNoticeByUserNo(userNo: number) {
    const notices: Notice[] = await this.noticeRepository.getNoticeByUserNo(
      userNo,
    );

    return notices.map((notice) => {
      notice = { ...notice, ...JSON.parse(notice.value) };
      delete notice.value;
      return notice;
    });
  }

  async getNoticeByConditions(
    noticeConditions: NoticeConditions,
  ): Promise<Notice[]> {
    try {
      const notices: Notice[] =
        await this.noticeRepository.getNoticeByConditions(noticeConditions);

      return notices;
    } catch (err) {
      throw err;
    }
  }

  async readNotice(noticeNo: number) {
    try {
      const a = await this.noticeRepository.readNotice(noticeNo);
      console.log(a);
    } catch (err) {
      throw err;
    }
  }
}
