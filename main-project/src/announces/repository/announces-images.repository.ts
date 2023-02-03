import { InternalServerErrorException } from '@nestjs/common';
<<<<<<< HEAD
import { ResultSetHeader } from 'mysql2';
<<<<<<< HEAD
import { CreateResponse } from 'src/boards/interface/boards.interface';
=======
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
import {
  DeleteResult,
  EntityRepository,
  InsertResult,
  Repository,
} from 'typeorm';
import { AnnouncesImages } from '../entity/announce-images.entity';
=======
import { EntityRepository, Repository } from 'typeorm';
import { AnnounceImages } from '../entity/announce-images.entity';
import { AnnounceImage } from '../interface/announces.interface';
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f

@EntityRepository(AnnounceImages)
export class AnnouncesImagesRepository extends Repository<AnnounceImages> {
  // 생성 관련
<<<<<<< HEAD
  async uploadImageUrls(
    images: { announcesNo: number; imageUrl: string }[],
  ): Promise<ResultSetHeader> {
=======
  async createAnnounceImages(images: AnnounceImage<string>[]): Promise<void> {
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
    try {
      await this.createQueryBuilder()
        .insert()
        .into(AnnounceImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
<<<<<<< HEAD
        `${error} uploadImageUrls-repository: 알 수 없는 서버 에러입니다.`,
=======
        `${error} createAnnounceImages-repository: 알 수 없는 서버 에러입니다.`,
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
      );
    }
  }

  // 삭제 관련
<<<<<<< HEAD
  async deleteAnnouncesImages(announcesNo: number): Promise<ResultSetHeader> {
    try {
      const { raw }: DeleteResult = await this.createQueryBuilder(
        'announcesImages',
      )
=======
  async deleteAnnounceImages(announceNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
        .delete()
        .from(AnnounceImages)
        .where('announceNo = :announceNo', { announceNo })
        .execute();
<<<<<<< HEAD

      return raw;
=======
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteAnnounceImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
