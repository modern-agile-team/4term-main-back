import { InternalServerErrorException } from '@nestjs/common';
import { ResultSetHeader } from 'mysql2';
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { EventImages } from '../entity/events-image.entity';

@EntityRepository(EventImages)
export class EventImagesRepository extends Repository<EventImages> {
  // 생성 관련
  async uploadEventImagesUrl(
    images: { eventNo: number; imageUrl: string }[],
  ): Promise<ResultSetHeader> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
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
  async deleteEventImages(eventNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder()
        .delete()
        .from(EventImages)
        .where('eventNo = :eventNo', { eventNo })
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteEventImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
