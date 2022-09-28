import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { CreateAnnouncementDto } from '../dto/create-announcement.dto';
import { Announcements } from '../entity/announcement.entity';
import { AnnouncementCreateResponse } from '../interface/announcement.interface';

@EntityRepository(Announcements)
export class AnnouncementsRepository extends Repository<Announcements> {
  //게시글 생성 관련
  async createAnnouncement(
    createAnnouncementDto: CreateAnnouncementDto,
  ): Promise<AnnouncementCreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder('boards')
        .insert()
        .into(Announcements)
        .values(createAnnouncementDto)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createAnnouncement-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
