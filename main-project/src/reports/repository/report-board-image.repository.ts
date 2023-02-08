import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ReportBoardImages } from '../entity/report-board-images.entity';
import { ReportImage } from '../interface/reports.interface';

@EntityRepository(ReportBoardImages)
export class ReportBoardImagesRepository extends Repository<ReportBoardImages> {
  // 신고글 작성 관련
  async createBoardReportImages(images: ReportImage<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(ReportBoardImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createBoardReportImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
