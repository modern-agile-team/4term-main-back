import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { DeleteResult, EntityManager, UpdateResult } from 'typeorm';
import { AnnounceDto } from './dto/announce.dto';
import { Announce, AnnounceImage } from './interface/announces.interface';
import { AnnouncesRepository } from './repository/announce.repository';
import { AnnouncesImagesRepository } from './repository/announces-images.repository';

@Injectable()
export class AnnouncesService {
  constructor(
    @InjectRepository(AnnouncesRepository)
    private readonly announcesRepository: AnnouncesRepository,

    @InjectRepository(AnnouncesImagesRepository)
    private readonly announcesImagesRepository: AnnouncesImagesRepository,

    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}
  // 생성 관련
  async createAnnounces(
    manager: EntityManager,
    announcesDto: AnnounceDto,
    files: Express.Multer.File[],
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const announceNo: number = await this.setAnnounce(manager, announcesDto);

    if (files.length) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setAnnounceImages(manager, imageUrls, announceNo);
    }
  }

  private async setAnnounce(
    manager: EntityManager,
    announcesDto: AnnounceDto,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(AnnouncesRepository)
      .createAnnounce(announcesDto);

    return insertId;
  }

  private async setAnnounceImages(
    manager: EntityManager,
    imageUrls: string[],
    announceNo: number,
  ): Promise<void> {
    const images: AnnounceImage[] = await this.convertImageArray(
      announceNo,
      imageUrls,
    );

    await manager
      .getCustomRepository(AnnouncesImagesRepository)
      .createAnnounceImages(images);
  }

  // 조회 관련
  async getAnnounces(manager: EntityManager): Promise<Announce<string[]>[]> {
    const announces: Announce<string[]>[] = await manager
      .getCustomRepository(AnnouncesRepository)
      .getAnnounces();

    if (!announces.length) {
      throw new NotFoundException(
        `공지사항 조회(getAnnounces-service): 공지사항이 없습니다.`,
      );
    }

    return announces;
  }

  async getAnnounce(
    manager: EntityManager,
    announceNo: number,
  ): Promise<Announce<string[]>> {
    const announce: Announce<string[]> = await manager
      .getCustomRepository(AnnouncesRepository)
      .getAnnounce(announceNo);

    if (!announce.no) {
      throw new NotFoundException(
        `공지사항 상세 조회(getAnnounce-service): ${announceNo}번 공지사항이 없습니다.`,
      );
    }

    return announce;
  }

  // 수정 관련
  async updateAnnounces(
    manager: EntityManager,
    announcesNo: number,
    announcesDto: AnnounceDto,
  ): Promise<void> {
    await this.getAnnounce(manager, announcesNo);

    const { affected }: UpdateResult =
      await this.announcesRepository.updateAnnounces(announcesNo, announcesDto);

    if (!affected) {
      throw new InternalServerErrorException(
        `공지사항 수정(updateAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesByNo(
    manager: EntityManager,
    announcesNo: number,
  ): Promise<string> {
    await this.getAnnounce(manager, announcesNo);

    const { affected }: DeleteResult =
      await this.announcesRepository.deleteAnnouncesByNo(announcesNo);

    if (!affected) {
      throw new BadRequestException(
        `공지사항 삭제(deleteAnnouncesByNo-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${announcesNo}번 공지사항 삭제 성공`;
  }

  async deleteAnnouncesImages(
    manager: EntityManager,
    announcesNo: number,
  ): Promise<string> {
    await this.getAnnounce(manager, announcesNo);

    const { affected }: DeleteResult =
      await this.announcesImagesRepository.deleteAnnouncesImages(announcesNo);

    if (!affected) {
      throw new BadRequestException(
        `이미지 삭제(deleteAnnouncesImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `이미지 삭제 성공`;
  }

  // functions
  private async convertImageArray(
    announceNo: number,
    imageUrls: string[],
  ): Promise<AnnounceImage[]> {
    const images: AnnounceImage[] = imageUrls.map((imageUrl: string) => {
      return { announceNo, imageUrl };
    });

    return images;
  }

  private async validateAdmin(manager: EntityManager, userNo: number) {
    const ADMIN_USER = this.configService.get<number>('ADMIN_USER');
    const { no } = await manager
      .getCustomRepository(UsersRepository)
      .getUserByNo(userNo);

    if (no !== ADMIN_USER) {
      throw new BadRequestException(
        '관리자 검증(validateAdmin-service): 관리자가 아닙니다.',
      );
    }
  }

  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'announce',
    );

    return imageUrls;
  }
}
