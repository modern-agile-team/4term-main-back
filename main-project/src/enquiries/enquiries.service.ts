import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EntityManager } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { EnquiryReplies } from './entity/enquiry-reply.entity';
import { Enquiries } from './entity/enquiry.entity';
import { EnquiryImagesRepository } from './repository/enquiry-image.repository';
import { EnquiryRepliesRepository } from './repository/enquiry-reply.repository';
import { EnquirysRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly enquirysRepository: EnquirysRepository,
    private readonly enquiryRepliesRepository: EnquiryRepliesRepository,
    private readonly usersRepository: UsersRepository,

    private readonly awsService: AwsService,
  ) {}
  // 문의사항 조회 관련
  async getAllEnquiries(): Promise<Enquiries[]> {
    const enquiries: Enquiries[] =
      await this.enquirysRepository.getAllEnquiries();

    if (!enquiries) {
      throw new NotFoundException(
        `문의 전체 조회(getAllEnquiries): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiryByNo(enquiryNo: number): Promise<Enquiries> {
    const enquiry: Enquiries = await this.enquirysRepository.getEnquiryByNo(
      enquiryNo,
    );

    if (!enquiry) {
      throw new NotFoundException(
        `문의 상세 조회(getEnquiryByNo-service): ${enquiryNo}번 문의 사항이 없습니다.`,
      );
    }

    return enquiry;
  }

  async getAllReplies(): Promise<EnquiryReplies[]> {
    const replies: EnquiryReplies[] =
      await this.enquiryRepliesRepository.getAllReplies();

    if (!replies.length) {
      throw new NotFoundException(
        `문의 답변 전체조회(getAllReplies-service): 답변이 없습니다.`,
      );
    }

    return replies;
  }

  async getReplyByNo(enquiryNo: number): Promise<EnquiryReplies> {
    await this.getEnquiryByNo(enquiryNo);

    const reply: EnquiryReplies =
      await this.enquiryRepliesRepository.getReplyByNo(enquiryNo);

    if (!reply) {
      throw new NotFoundException(
        `문의 답변 상세조회(getReplyByNo-service): ${enquiryNo}번 문의사항의 답변이 없습니다.`,
      );
    }

    return reply;
  }

  // 문의사항 생성 관련
  async createEnquiry(
    manager: EntityManager,
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    const imageUrls: string[] = await this.uploadEnquiryImages(manager, files);

    const enquiryNo: number = await this.setEnquiry(manager, {
      ...createEnquiryDto,
      userNo,
    });
    console.log('enquiryNo : ', enquiryNo);

    await this.setEnquiryImages(manager, imageUrls, enquiryNo);
  }

  private async setEnquiry(manager: EntityManager, enquiry): Promise<number> {
    console.log(enquiry);

    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquirysRepository)
      .createEnquiry(enquiry);
    console.log(insertId);

    if (!insertId) {
      throw new InternalServerErrorException(
        `문의 사항 생성(createEnquiry-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  private async uploadEnquiryImages(
    manager: EntityManager,
    files: Express.Multer.File[],
  ): Promise<string[]> {
    const imageUrls = await this.awsService.uploadImages(files, 'enquiry');

    return imageUrls;
  }

  private async setEnquiryImages(
    manager: EntityManager,
    imageUrls: string[],
    enquiryNo: number,
  ): Promise<void> {
    const images = await this.setImageUrlArray(imageUrls, enquiryNo);

    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiryImagesRepository)
      .setEnquiryImages(images);

    if (!insertId) {
      throw new InternalServerErrorException(
        `문의사항 이미지 DB upload(setEnquiryImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  async createReply(reply): Promise<void> {
    const { affectedRows }: ResultSetHeader =
      await this.enquiryRepliesRepository.createReply(reply);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의 답변 생성(createReply-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Patch Methods
  async updateEnquiry(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);

    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.updateEnquiry(enquiryNo, updateEnquiryDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의사항 수정 오류 updateEnquiry-service.`,
      );
    }
  }

  async updateReply(
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);
    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.updateEnquiry(enquiryNo, updateEnquiryDto);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의사항 수정 오류 updateEnquiry-service.`,
      );
    }
  }

  //문의사항 삭제 관련
  async deleteEnquiryByNo(enquiryNo: number): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);

    const { affectedRows }: ResultSetHeader =
      await this.enquirysRepository.deleteEnquiry(enquiryNo);

    if (!affectedRows) {
      throw new InternalServerErrorException(
        `문의사항 삭제 오류 updateEnquiry-service.`,
      );
    }
  }

  async deleteReplyByEnquiryNo(enquiryNo: number): Promise<void> {
    await this.getEnquiryByNo(enquiryNo);

    const isDeleted: number = await this.enquiryRepliesRepository.deleteReply(
      enquiryNo,
    );

    if (!isDeleted) {
      throw new InternalServerErrorException(
        `답변 삭제 오류 deleteReplyByEnquiryNo-service.`,
      );
    }
  }

  //function
  private async validateWriter(
    userNo: number,
    enquiryNo: number,
  ): Promise<void> {
    const { userNo: writerNo }: Enquiries = await this.getEnquiryByNo(
      enquiryNo,
    );

    if (writerNo != userNo) {
      throw new BadRequestException(
        `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
      );
    }
  }

  private async setImageUrlArray(imageUrls: string[], enquiryNo: number) {
    return imageUrls.map((imageUrl: string) => {
      return { enquiryNo, imageUrl };
    });
  }
}
