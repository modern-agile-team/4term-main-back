import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateResponse } from 'src/boards/interface/boards.interface';
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
  ) {}
  // 공지사항 생성 관련
  async createAnnounces(
    manager,
    announcesDto: AnnouncesDto,
    files: Express.Multer.File[],
  ): Promise<string> {
    const { insertId }: CreateResponse = await manager
      .getCustomRepository(AnnouncesRepository)
      .createAnnounces(announcesDto);

    if (!insertId) {
      throw new InternalServerErrorException(
        `공지사항 생성(createAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${insertId}번 공지사항 생성 성공`;
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
    manager,
    announcesNo: number,
    announcesDto: AnnouncesDto,
  ): Promise<string> {
    await this.getAnnouncesByNo(announcesNo);

    const affectedRows: number = await manager
      .getCustomRepository(AnnouncesRepository)
      .updateAnnounces(announcesNo, announcesDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `공지사항 수정(updateAnnouncement-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return `${announcesNo}번 공지사항이 수정되었습니다.`;
  }
}
