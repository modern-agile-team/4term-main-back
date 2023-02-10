import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { ReportUserImages } from '../entity/report-user-image.entity';
import { ReportImage } from '../interface/reports.interface';

@EntityRepository(ReportUserImages)
export class ReportUserImagesRepository extends Repository<ReportUserImages> {
  async createUserReportImages(images: ReportImage<string>[]): Promise<void> {
    try {
      await this.createQueryBuilder()
        .insert()
        .into(ReportUserImages)
        .values(images)
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} createUserReportImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async deleteUserReportImages(reportUserNo: number): Promise<void> {
    try {
      await this.createQueryBuilder()
        .delete()
        .from(ReportUserImages)
        .where('reportUserNo = :reportUserNo', { reportUserNo })
        .execute();
    } catch (error) {
      throw new InternalServerErrorException(
        `${error} deleteUserReportImages-repository: 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
