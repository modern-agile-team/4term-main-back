import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultSetHeader } from 'mysql2';
import { DeleteResult, EntityManager, UpdateResult } from 'typeorm';
import { AnnouncesDto } from './dto/announce.dto';
import { AnnouncesImages } from './entity/announce-images.entity';
import { Announces } from './entity/announce.entity';
import { Announce } from './interface/announces.interface';
import { AnnouncesRepository } from './repository/announce.repository';
import { AnnouncesImagesRepository } from './repository/announces-images.repository';

@Injectable()
export class AnnouncesService {
  private readonly s3: AWS.S3;

  constructor(
    @InjectRepository(AnnouncesRepository)
    private readonly announcesRepository: AnnouncesRepository,

    @InjectRepository(AnnouncesImagesRepository)
    private readonly announcesImagesRepository: AnnouncesImagesRepository,
  ) {}
  // 생성 관련
  async createAnnounces(announcesDto: AnnouncesDto): Promise<void> {
    const { affectedRows }: ResultSetHeader =
      await this.announcesRepository.createAnnounces(announcesDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `공지사항 생성(createAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async uploadAnnouncesimagesUrl(
    announcesNo: number,
    uploadedImagesUrlList: string[],
  ): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);
    if (uploadedImagesUrlList.length === 0) {
      throw new BadRequestException('사진이 없습니다.');
    }
    const images = uploadedImagesUrlList.map((url) => {
      return { announcesNo, imageUrl: url };
    });

    const { insertId }: ResultSetHeader =
      await this.announcesImagesRepository.uploadAnnouncesimagesUrl(images);

    if (!insertId) {
      throw new InternalServerErrorException(
        `이미지 업로드(uploadimagesUrl-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `이미지 업로드 성공`;
  }

  // 조회 관련
  async getAllAnnounces(manager: EntityManager): Promise<Announce<string[]>[]> {
    const announces: Announce<string[]>[] = await manager
      .getCustomRepository(AnnouncesRepository)
      .getAllAnnounces();

    if (!announces.length) {
      throw new NotFoundException(
        `공지사항 조회(getAllAnnounces-service): 공지사항이 없습니다.`,
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
        `공지사항 상세 조회(getBoardByNo-service): ${announcesNo}번 공지사항이 없습니다.`,
      );
    }

    return announces;
  }

  // 수정 관련
  async updateAnnounces(
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

    const { affected }: UpdateResult =
      await this.announcesRepository.updateAnnounces(announcesNo, announcesDto);

    if (!affected) {
      throw new InternalServerErrorException(
        `공지사항 수정(updateAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesByNo(announcesNo: number): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);

    const { affected }: DeleteResult =
      await this.announcesRepository.deleteAnnouncesByNo(announcesNo);

    if (!affected) {
      throw new BadRequestException(
        `공지사항 삭제(deleteAnnouncesByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${announcesNo}번 공지사항 삭제 성공`;
  }

  async deleteAnnouncesImages(announcesNo: number): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);

    const { affected }: DeleteResult =
      await this.announcesImagesRepository.deleteAnnouncesImages(announcesNo);

    if (!affected) {
      throw new BadRequestException(
        `이미지 삭제(deleteAnnouncesImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `이미지 삭제 성공`;
  }
}
