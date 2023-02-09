import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ReportBoardImages } from '../entity/report-board-images.entity';
import { ReportImage } from '../interface/reports.interface';

@EntityRepository(ReportBoardImages)
export class ReportBoardImagesRepository extends Repository<ReportBoardImages> {
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

  async deleteBoardReportImages(reportBoardNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(ReportBoardImages)
        .where('reportBoardNo = :reportBoardNo', { reportBoardNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteBoardReportImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
