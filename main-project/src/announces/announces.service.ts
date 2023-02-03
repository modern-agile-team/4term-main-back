import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ResultSetHeader } from 'mysql2';
<<<<<<< HEAD
<<<<<<< HEAD
import { CreateResponse } from 'src/boards/interface/boards.interface';
=======
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
import { DeleteResult, UpdateResult } from 'typeorm';
import { AnnouncesDto } from './dto/announce.dto';
import { AnnouncesImages } from './entity/announce-images.entity';
import { Announces } from './entity/announce.entity';
=======
import { AwsService } from 'src/aws/aws.service';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EntityManager, UpdateResult } from 'typeorm';
import { CreateAnnounceDto } from './dto/create-announce.dto';
import { Announce, AnnounceImage } from './interface/announces.interface';
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
import { AnnouncesRepository } from './repository/announce.repository';
import { AnnouncesImagesRepository } from './repository/announces-images.repository';

@Injectable()
export class AnnouncesService {
  constructor(
    private readonly announcesRepository: AnnouncesRepository,
<<<<<<< HEAD
    private readonly announcesImagesRepository: AnnouncesImagesRepository,
=======

    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
  ) {}

  ADMIN_USER: number = Number(this.configService.get<number>('ADMIN_USER'));

  // 생성 관련
  async createAnnounces(
    manager: EntityManager,
    announcesDto: CreateAnnounceDto,
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

<<<<<<< HEAD
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

<<<<<<< HEAD
    const { insertId }: CreateResponse =
      await this.announcesImagesRepository.uploadImageUrls(images);
=======
    const { insertId }: ResultSetHeader =
      await this.announcesImagesRepository.uploadAnnouncesimagesUrl(images);
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2

    if (!insertId) {
      throw new InternalServerErrorException(
        `이미지 업로드(uploadImageUrls-service): 알 수 없는 서버 에러입니다.`,
      );
    }
=======
  private async setAnnounce(
    manager: EntityManager,
    announcesDto: CreateAnnounceDto,
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
    const images: AnnounceImage<string>[] = await this.convertImageArray(
      announceNo,
      imageUrls,
    );
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f

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
  async editAnnounce(
    manager: EntityManager,
    userNo: number,
    announcesNo: number,
    announcesDto: CreateAnnounceDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Announce<string[]> = await this.getAnnounce(
      manager,
      announcesNo,
    );

    await this.editAnnounceImages(manager, files, announcesNo);
    await this.updateAnnounce(manager, announcesNo, announcesDto);
  }

  private async editAnnounceImages(
    manager: EntityManager,
    files: Express.Multer.File[],
    announceNo: number,
  ): Promise<void> {
    const { imageUrls }: Announce<string[]> = await this.getAnnounce(
      manager,
      announceNo,
    );

    if (!imageUrls.includes(null)) {
      await this.deleteAnnounceImages(manager, announceNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setAnnounceImages(manager, images, announceNo);
    }
  }

  private async updateAnnounce(
    manager: EntityManager,
    announceNo: number,
    announcesDto: CreateAnnounceDto,
  ) {
    await manager
      .getCustomRepository(AnnouncesRepository)
      .updateAnnounces(announceNo, announcesDto);
  }

  // 삭제 관련
  async deleteAnnounceByNo(
    manager: EntityManager,
    announceNo: number,
    userNo: number,
  ): Promise<void> {
    await this.validateAdmin(manager, userNo);
    const { imageUrls }: Announce<string[]> = await this.getAnnounce(
      manager,
      announceNo,
    );

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeAnnounce(manager, announceNo);
  }

  private async removeAnnounce(
    manager: EntityManager,
    announceNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(AnnouncesRepository)
      .deleteAnnouncesByNo(announceNo);
  }

  private async deleteAnnounceImages(
    manager: EntityManager,
    announceNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(AnnouncesImagesRepository)
      .deleteAnnounceImages(announceNo);
  }

  // functions
  private async convertImageArray(
    announceNo: number,
    imageUrls: string[],
  ): Promise<AnnounceImage<string>[]> {
    const images: AnnounceImage<string>[] = imageUrls.map(
      (imageUrl: string) => {
        return { announceNo, imageUrl };
      },
    );

    return images;
  }

  private async validateAdmin(manager: EntityManager, userNo: number) {
    const { no }: Users = await manager
      .getCustomRepository(UsersRepository)
      .getUserByNo(userNo);

<<<<<<< HEAD
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
  ): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

<<<<<<< HEAD
    const { affectedRows }: ResultSetHeader =
=======
    const { affected }: UpdateResult =
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
      await this.announcesRepository.updateAnnounces(announcesNo, announcesDto);

    if (!affected) {
      throw new InternalServerErrorException(
        `공지사항 수정(updateAnnounces-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  // 삭제 관련
  async deleteAnnouncesByNo(announcesNo: number): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

    const { affectedRows }: ResultSetHeader =
      await this.announcesRepository.deleteAnnouncesByNo(announcesNo);

    if (!affectedRows) {
=======
    if (no !== this.ADMIN_USER) {
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
      throw new BadRequestException(
        '관리자 검증(validateAdmin-service): 관리자가 아닙니다.',
      );
    }
  }

<<<<<<< HEAD
  async deleteAnnouncesImages(announcesNo: number): Promise<void> {
    await this.getAnnouncesByNo(announcesNo);

    const { affectedRows }: ResultSetHeader =
      await this.announcesImagesRepository.deleteAnnouncesImages(announcesNo);

<<<<<<< HEAD
    if (!affectedRows) {
=======
    if (!affected) {
>>>>>>> 99a22fd33993957b148bda24bbd5d8abbad9c6b2
      throw new BadRequestException(
        `이미지 삭제(deleteAnnouncesImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }
=======
  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'announce',
    );

    return imageUrls;
>>>>>>> 44f7cbffe7e221adab85db634a646f1daa9bd42f
  }
}
