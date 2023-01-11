import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultSetHeader } from 'mysql2';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AnnouncesDto } from './dto/announce.dto';
import { AnnouncesImages } from './entity/announce-images.entity';
import { Announces } from './entity/announce.entity';
import { AnnouncesRepository } from './repository/announce.repository';
import { AnnouncesImagesRepository } from './repository/announces-images.repository';

@Injectable()
export class AnnouncesService {
  private readonly s3: AWS.S3;

  constructor(
    private readonly announcesRepository: AnnouncesRepository,
    private readonly announcesImagesRepository: AnnouncesImagesRepository,
  ) {}
  // 생성 관련
  async createAnnounces(manager, announcesDto: AnnouncesDto): Promise<string> {
    const { insertId }: CreateResponse =
      await this.announcesRepository.createAnnounces(announcesDto);

    if (!insertId) {
      throw new InternalServerErrorException(
        `공지사항 생성(createAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${insertId}번 공지사항 생성 성공`;
  }

  async uploadImageUrls(
    announcesNo: number,
    imageUrls: string[],
  ): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);
    if (imageUrls.length === 0) {
      throw new BadRequestException('사진이 없습니다.');
    }
    const images = imageUrls.map((url) => {
      return { announcesNo, imageUrl: url };
    });

    const { insertId }: CreateResponse =
      await this.announcesImagesRepository.uploadImageUrls(images);

    if (!insertId) {
      throw new InternalServerErrorException(
        `이미지 업로드(uploadImageUrls-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `이미지 업로드 성공`;
  }

  // 조회 관련
  async getAllAnnounces(): Promise<Announces[]> {
    const announces: Announces[] =
      await this.announcesRepository.getAllAnnounces();

    if (announces.length === 0) {
      throw new NotFoundException(
        `공지사항 조회(getAnnouncements-service): 조건에 맞는 공지사항이 없습니다.`,
      );
    }

    return announces;
  }

  async getAnnouncesImages(announcesNo: number): Promise<string[]> {
    const { imageUrl }: AnnouncesImages =
      await this.announcesImagesRepository.getAnnouncesImages(announcesNo);

    if (!imageUrl) {
      throw new NotFoundException(
        `이미지 조회(getImages-service): 이미지가 없습니다.`,
      );
    }

    const images = JSON.parse(imageUrl);

    return images;
  }

  async getAnnouncesByNo(announcesNo: number): Promise<Announces> {
    const announces: Announces =
      await this.announcesRepository.getAnnouncesByNo(announcesNo);

    if (!announces) {
      throw new NotFoundException(
        `공지사항 상세 조회(getAnnouncesByNo-service): ${announcesNo}번 공지사항이 없습니다.`,
      );
    }

    return announces;
  }

  // 수정 관련
  async updateAnnounces(
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);

    const { affectedRows }: ResultSetHeader =
      await this.announcesRepository.updateAnnounces(announcesNo, announcesDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `공지사항 수정(updateAnnounces-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${announcesNo}번 공지사항이 수정되었습니다.`;
  }

  // 삭제 관련
  async deleteAnnouncesByNo(announcesNo: number): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

    const { affectedRows }: ResultSetHeader =
      await this.announcesRepository.deleteAnnouncesByNo(announcesNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `공지사항 삭제(deleteAnnouncesByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteAnnouncesImages(announcesNo: number): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

    const { affectedRows }: ResultSetHeader =
      await this.announcesImagesRepository.deleteAnnouncesImages(announcesNo);

    if (!affectedRows) {
      throw new BadRequestException(
        `이미지 삭제(deleteAnnouncesImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
