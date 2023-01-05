import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
import { Connection, QueryRunner } from 'typeorm';
import { AnnouncesFilterDto } from './dto/announce-filter.dto';
import { AnnouncesDto } from './dto/announce.dto';
import { Announces } from './entity/announce.entity';
import { AnnouncesRepository } from './repository/announce.repository';

@Injectable()
export class AnnouncesService {
  private readonly s3: AWS.S3;

  constructor(
    @InjectRepository(AnnouncesRepository)
    private readonly announcesRepository: AnnouncesRepository,

    private readonly connection: Connection,
  ) {}
  // 공지사항 생성 관련
  async createAnnounces(
    announcesDto: AnnouncesDto,
    files: Express.Multer.File[],
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { insertId }: CreateResponse = await queryRunner.manager
        .getCustomRepository(AnnouncesRepository)
        .createAnnounces(announcesDto);

      if (!insertId) {
        throw new InternalServerErrorException(
          `공지사항 생성(createAnnouncement-service): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return `${insertId}번 공지사항 생성 성공`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }

  private async uploadImg(files: Express.Multer.File[]) {
    const uploadFileList: object[] = files.map((file) => {
      const key = `announces/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    const upload = await uploadFileList.map((uploadFile: any) => {
      this.s3.upload(uploadFile, (err, data) => {
        if (err) {
          throw new InternalServerErrorException(
            '파일 업로드에 실패하였습니다.',
          );
        }
      });
    });
    console.log(upload);

    const fileUrlList: string[] = uploadFileList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return fileUrlList;
  }

  // 공지사항 조회 관련
  async getAnnounces({ type }: AnnouncesFilterDto): Promise<Announces[]> {
    const announces: Announces[] = await this.announcesRepository.getAnnounces(
      type,
    );

    if (announces.length === 0) {
      throw new NotFoundException(
        `공지사항 조회(getAnnouncements-service): 조건에 맞는 공지사항이 없습니다.`,
      );
    }

    return announces;
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

  // 공지사항 수정 관련
  async updateAnnounces(
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<string> {
    const queryRunner: QueryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await this.getAnnouncesByNo(announcesNo);

      const affectedRows: number = await queryRunner.manager
        .getCustomRepository(AnnouncesRepository)
        .updateAnnounces(announcesNo, announcesDto);

      if (!affectedRows) {
        throw new InternalServerErrorException(
          `공지사항 수정(updateAnnouncement-service): 알 수 없는 서버 에러입니다.`,
        );
      }

      await queryRunner.commitTransaction();

      return `${announcesNo}번 공지사항이 수정되었습니다.`;
    } catch (error) {
      await queryRunner?.rollbackTransaction();

      throw error;
    } finally {
      await queryRunner?.release();
    }
  }
}
