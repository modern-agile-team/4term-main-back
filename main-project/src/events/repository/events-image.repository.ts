import { InternalServerErrorException } from '@nestjs/common';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { EventImages } from '../entity/events-image.entity';

@EntityRepository(EventImages)
export class EventImagesRepository extends Repository<EventImages> {
  // 조회 관련
  async getEventImages(eventNo: number): Promise<EventImages> {
    try {
      const images = this.createQueryBuilder('eventsImages')
        .select(['JSON_ARRAYAGG(eventsImages.imageUrl) AS imageUrl'])
        .where('eventsImages.eventNo = :eventNo', { eventNo })
        .getRawOne();

      return images;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} getEventImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
  // 생성 관련
  async uploadEventImagesUrl(
    images: { eventNo: number; imageUrl: string }[],
  ): Promise<CreateResponse> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder(
        'eventsImages',
      )
        .insert()
        .into(EventImages)
        .values(images)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} uploadEventImagesUrl-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteEventImages(eventNo: number): Promise<DeleteResult> {
    try {
      const affected: DeleteResult = await this.createQueryBuilder(
        'eventsImages',
      )
        .delete()
        .from(EventImages)
        .where('eventNo = :eventNo', { eventNo })
        .execute();

      return affected;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEventImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
