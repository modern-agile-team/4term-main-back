import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { NoticeType } from 'src/common/configs/notice-type.config';
import { Notices } from 'src/notices/entity/notices.entity';
import { NoticesRepository } from 'src/notices/repository/notices.repository';
import { EntityManager } from 'typeorm';
import { UpdateMannerDto } from './dto/update-manner.dto';
import { Manners } from './entity/manners.entity';
import { updatedManner } from './interface/manner.interface';
import { MannersRepository } from './repository/manners.repository';

@Injectable()
export class MannersService {
  constructor(
    private readonly mannersRepository: MannersRepository,
    private readonly noticesRepository: NoticesRepository,
  ) {}

  async updateManner(
    senderNo: number,
    { grade, noticeNo }: UpdateMannerDto,
    manager: EntityManager,
  ): Promise<void> {
    if (grade % 0.5) {
      throw new BadRequestException('올바르지 않은 평점 형식입니다.');
    }

    const manner: Manners = await this.getMannerByNotice(noticeNo, senderNo);
    const updatedManner: updatedManner = {
      gradeCount: manner.gradeCount + 1,
      grade: manner.grade + grade,
    };

    const updateMannerResult: number = await manager
      .getCustomRepository(MannersRepository)
      .updateManner(manner.userNo, updatedManner);
    if (!updateMannerResult) {
      throw new InternalServerErrorException(
        '평점 수정(updateManner): 알 수 없는 서버 에러입니다.',
      );
    }
    await this.deleteNotice(noticeNo, manager);
  }

  private async deleteNotice(
    noticeNo: number,
    manager: EntityManager,
  ): Promise<void> {
    const noticeDeleted: number = await manager
      .getCustomRepository(NoticesRepository)
      .deleteNotice(noticeNo);

    if (!noticeDeleted) {
      throw new InternalServerErrorException(
        '알림 삭제(deleteNotice): 알 수 없는 서버 에러입니다.',
      );
    }
  }

  private async getMannerByNotice(
    noticeNo: number,
    senderNo: number,
  ): Promise<Manners> {
    const notice: Notices = await this.noticesRepository.getNoticeByNo(
      noticeNo,
    );
    if (!notice || notice.userNo !== senderNo) {
      throw new NotFoundException('존재하지 않는 알림입니다.');
    }
    if (notice.type !== NoticeType.MANNER_REQUEST) {
      throw new BadRequestException('다른 타입의 알림입니다.');
    }

    const manner: Manners = await this.mannersRepository.getMannerByUserNo(
      notice.targetUserNo,
    );
    if (!manner) {
      throw new NotFoundException('탈퇴한 유저입니다.');
    }

    return manner;
  }
}
