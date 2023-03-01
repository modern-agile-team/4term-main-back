import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Board } from 'src/boards/interface/boards.interface';
import { BoardsRepository } from 'src/boards/repository/board.repository';
import { EntityManager } from 'typeorm';
import { CreateReportBoardDto } from './dto/create-report-board.dto';
import { UpdateReportDto } from './dto/update-report-board.dto';
import {
  Report,
  ReportImage,
  ReportPagenation,
} from './interface/reports.interface';
import { ReportBoardRepository } from './repository/report-board.repository';
import { ReportRepository } from './repository/reports.repository';
import { ReportUserRepository } from './repository/report-user.repository';
import { ResultSetHeader } from 'mysql2';
import { ReportFilterDto } from './dto/report-filter.dto';
import { AwsService } from 'src/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { ReportBoardImagesRepository } from './repository/report-board-image.repository';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import { CreateReportUserDto } from './dto/create-report-user.dto';
import { ReportUserImagesRepository } from './repository/report-user-image.repository';
import { ReportBoards } from './entity/report-board.entity';
import { ReportUsers } from './entity/report-user.entity';

@Injectable()
export class ReportsService {
  constructor(
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER = this.configService.get<number>('ADMIN_USER');

  // 조회 관련
  async getReports(
    manager: EntityManager,
    { type, page }: ReportFilterDto,
  ): Promise<ReportPagenation> {
    let reportMetaData: ReportPagenation;

    if (type) {
      reportMetaData =
        type === 0
          ? await this.readReportUsers(manager, page)
          : await this.readReportBoards(manager, page);
    } else {
      reportMetaData = await this.readReports(manager, page);
    }

    if (!reportMetaData.reports.length) {
      throw new NotFoundException(
        '신고내역 상세 조회(getReports-service): 신고내역이 없습니다!',
      );
    }

    return reportMetaData;
  }

  private async readReports(
    manager: EntityManager,
    page: number,
  ): Promise<ReportPagenation> {
    const reportMetaData: ReportPagenation = await manager
      .getCustomRepository(ReportRepository)
      .getReports(page);

    return reportMetaData;
  }

  private async readReportBoards(
    manager: EntityManager,
    page: number,
  ): Promise<ReportPagenation> {
    const reportMetaData: ReportPagenation = await manager
      .getCustomRepository(ReportBoardRepository)
      .getReportBoards(page);

    return reportMetaData;
  }

  private async readReportUsers(
    manager: EntityManager,
    page: number,
  ): Promise<ReportPagenation> {
    const reportMetaData: ReportPagenation = await manager
      .getCustomRepository(ReportUserRepository)
      .getReportUsers(page);

    return reportMetaData;
  }

  async getReport(
    manager: EntityManager,
    reportNo: number,
    userNo: number,
  ): Promise<Report<string[]>> {
    const report: Report<string[]> = await this.readReport(manager, reportNo);
    this.validateWriter(userNo, report.userNo);

    if (!report.no) {
      throw new NotFoundException(
        `신고내역 상세 조회(getReport): ${reportNo}번 신고내역이 없습니다.`,
      );
    }

    return report;
  }

  private async readReport(
    manager: EntityManager,
    reportNo: number,
  ): Promise<Report<string[]>> {
    const report: Report<string[]> = await manager
      .getCustomRepository(ReportRepository)
      .getReport(reportNo);

    return report;
  }

  private async readReportBoard(
    manager: EntityManager,
    reportNo: number,
  ): Promise<ReportBoards> {
    const reportBoard: ReportBoards = await manager
      .getCustomRepository(ReportBoardRepository)
      .getReportBoard(reportNo);

    return reportBoard;
  }

  private async readReportUser(
    manager: EntityManager,
    reportNo: number,
  ): Promise<ReportUsers> {
    const reportUser: ReportUsers = await manager
      .getCustomRepository(ReportUserRepository)
      .getReportUser(reportNo);

    return reportUser;
  }

  // 생성 관련
  async createBoardReport(
    manager: EntityManager,
    { boardNo, ...createReportDto }: CreateReportBoardDto,
    files: Express.Multer.File[],
    userNo: number,
  ): Promise<void> {
    await this.validateBoard(manager, boardNo);

    const reportNo: number = await this.setReport(manager, {
      ...createReportDto,
      userNo,
    });
    const reportBoardNo: number = await this.setBoardReport(
      manager,
      boardNo,
      reportNo,
    );

    if (files.length) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setReportBoardImages(manager, imageUrls, reportBoardNo);
    }
  }

  private async setBoardReport(
    manager: EntityManager,
    boardNo: number,
    reportNo: number,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(ReportBoardRepository)
      .createBoardReport(reportNo, boardNo);

    return insertId;
  }

  private async setReportBoardImages(
    manager: EntityManager,
    imageUrls: string[],
    reportBoardNo: number,
  ): Promise<void> {
    const images: ReportImage<string>[] = this.convertReportBoardImageArray(
      imageUrls,
      reportBoardNo,
    );

    await manager
      .getCustomRepository(ReportBoardImagesRepository)
      .createBoardReportImages(images);
  }

  async createUserReport(
    manager: EntityManager,
    { targetUserNo, ...createReportUserDto }: CreateReportUserDto,
    files: Express.Multer.File[],
    userNo: number,
  ): Promise<void> {
    await this.validateUser(manager, targetUserNo);

    const reportNo: number = await this.setReport(manager, {
      ...createReportUserDto,
      userNo,
    });

    const reportUserNo: number = await this.setUserReport(
      manager,
      targetUserNo,
      reportNo,
    );

    if (files) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setReportUserImages(manager, imageUrls, reportUserNo);
    }
  }

  private async setUserReport(
    manager: EntityManager,
    userNo: number,
    reportNo: number,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(ReportUserRepository)
      .createUserReport(reportNo, userNo);

    return insertId;
  }

  private async setReportUserImages(
    manager: EntityManager,
    imageUrls: string[],
    reportUserNo: number,
  ): Promise<void> {
    const images: ReportImage<string>[] = this.convertReportUserImageArray(
      imageUrls,
      reportUserNo,
    );

    await manager
      .getCustomRepository(ReportUserImagesRepository)
      .createUserReportImages(images);
  }

  private async setReport(
    manager: EntityManager,
    report: Report<void>,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(ReportRepository)
      .createReport(report);

    return insertId;
  }

  //수정 관련
  async editReport(
    manager: EntityManager,
    reportNo: number,
    updateReportDto: UpdateReportDto,
    userNo: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    const { imageUrls, ...report }: Report<string[]> = await this.getReport(
      manager,
      reportNo,
      userNo,
    );

    await this.updateReport(manager, reportNo, updateReportDto);
    report.targetBoardNo
      ? await this.editReportBoardImages(manager, files, reportNo, imageUrls)
      : await this.editReportUserImages(manager, files, reportNo, imageUrls);
  }

  private async updateReport(
    manager: EntityManager,
    reportNo: number,
    updateReportDto: UpdateReportDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(ReportRepository)
      .updateReport(reportNo, updateReportDto);
  }

  private async editReportBoardImages(
    manager: EntityManager,
    files: Express.Multer.File[],
    reportNo: number,
    imageUrls: string[],
  ): Promise<void> {
    const { no }: ReportBoards = await this.readReportBoard(manager, reportNo);

    if (!imageUrls.includes(null)) {
      await this.deleteReportBoardImages(manager, no);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setReportBoardImages(manager, images, reportNo);
    }
  }

  private async editReportUserImages(
    manager: EntityManager,
    files: Express.Multer.File[],
    reportNo: number,
    imageUrls: string[],
  ): Promise<void> {
    const { no }: ReportUsers = await this.readReportUser(manager, reportNo);

    if (!imageUrls.includes(null)) {
      await this.deleteReportUserImages(manager, no);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setReportUserImages(manager, images, reportNo);
    }
  }

  // 삭제 관련
  async deleteReport(
    manager: EntityManager,
    reportNo: number,
    userNo: number,
  ): Promise<void> {
    const { imageUrls, ...report }: Report<string[]> = await this.getReport(
      manager,
      reportNo,
      userNo,
    );

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeReport(manager, reportNo);
  }

  private async removeReport(
    manager: EntityManager,
    reportNo: number,
  ): Promise<void> {
    await manager.getCustomRepository(ReportRepository).deleteReport(reportNo);
  }

  private async deleteReportBoardImages(
    manager: EntityManager,
    reportBoardNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(ReportBoardImagesRepository)
      .deleteBoardReportImages(reportBoardNo);
  }

  private async deleteReportUserImages(
    manager: EntityManager,
    reportUserNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(ReportUserImagesRepository)
      .deleteUserReportImages(reportUserNo);
  }

  // functions
  private validateWriter(userNo: number, writerNo: number): void {
    if (writerNo !== userNo && this.ADMIN_USER !== userNo) {
      throw new BadRequestException(
        `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
      );
    }
  }

  private convertReportBoardImageArray(
    imageUrls: string[],
    reportBoardNo: number,
  ): ReportImage<string>[] {
    const images: ReportImage<string>[] = imageUrls.map((imageUrl: string) => {
      return { reportBoardNo, imageUrl };
    });

    return images;
  }

  private convertReportUserImageArray(
    imageUrls: string[],
    reportUserNo: number,
  ): ReportImage<string>[] {
    const images: ReportImage<string>[] = imageUrls.map((imageUrl: string) => {
      return { reportUserNo, imageUrl };
    });

    return images;
  }

  private async validateUser(
    manager: EntityManager,
    targetUserNo: number,
  ): Promise<void> {
    const user: Users = await manager
      .getCustomRepository(UsersRepository)
      .getUserByNo(targetUserNo);

    if (!user) {
      throw new BadRequestException(
        '사용자 확인(validateUser-service): 존재하지 않는 사용자 입니다',
      );
    }
  }

  private async validateBoard(
    manager: EntityManager,
    boardNo: number,
  ): Promise<void> {
    const { no }: Board<number[], string[]> = await manager
      .getCustomRepository(BoardsRepository)
      .getBoardByNo(boardNo, null);

    if (!no) {
      throw new BadRequestException(
        `게시글 신고 생성(validateBoard-service): ${boardNo}번 게시글을 찾을 수 없습니다.`,
      );
    }
  }

  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'report',
    );

    return imageUrls;
  }
}
