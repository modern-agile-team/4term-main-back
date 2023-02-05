import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ConfigService } from '@nestjs/config';
import { ResultSetHeader } from 'mysql2';
import { AwsService } from 'src/aws/aws.service';
import { Users } from 'src/users/entity/user.entity';
import { UsersRepository } from 'src/users/repository/users.repository';
import { EntityManager } from 'typeorm';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { EnquiryReplies } from './entity/enquiry-reply.entity';
import {
  Enquiry,
  EnquiryImage,
  Reply,
  ReplyImage,
} from './interface/enquiry.interface';
import { EnquiryImagesRepository } from './repository/enquiry-image.repository';
import { EnquiryReplyImagesRepository } from './repository/enquiry-reply-image.repository';
import { EnquiryRepliesRepository } from './repository/enquiry-reply.repository';
import { EnquiriesRepository } from './repository/enquiry.repository';

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly awsService: AwsService,
    private readonly configService: ConfigService,
  ) {}

  ADMIN_USER: number = Number(this.configService.get<number>('ADMIN_USER'));

  // Get Methods
  async getEnquiries(manager: EntityManager): Promise<Enquiry<string[]>[]> {
    const enquiries: Enquiry<string[]>[] = await manager
      .getCustomRepository(EnquiriesRepository)
      .getEnquiries();

    if (!enquiries.length) {
      throw new NotFoundException(
        `문의 전체 조회(getAllEnquiries): 문의 사항이 없습니다.`,
      );
    }

    return enquiries;
  }

  async getEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<Enquiry<string[]>> {
    const enquiry: Enquiry<string[]> = await this.readEnquiry(
      manager,
      enquiryNo,
    );

    await this.validateWriter(enquiry.userNo, userNo);

    return enquiry;
  }

  private async readEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<Enquiry<string[]>> {
    const enquiry: Enquiry<string[]> = await manager
      .getCustomRepository(EnquiriesRepository)
      .getEnquiry(enquiryNo);

    if (!enquiry.no) {
      throw new NotFoundException(
        `문의 상세 조회(readEnquiry-service): ${enquiryNo}번 문의 사항이 없습니다.`,
      );
    }

    return enquiry;
  }

  async getAllReplies(manager: EntityManager): Promise<EnquiryReplies[]> {
    const replies: EnquiryReplies[] = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .getAllReplies();

    if (!replies.length) {
      throw new NotFoundException(
        `문의 답변 전체조회(getAllReplies-service): 답변이 없습니다.`,
      );
    }

    return replies;
  }

  async getReplyByNo(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<Reply> {
    await this.readEnquiry(manager, enquiryNo);

    const reply: Reply = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .getReplyByNo(enquiryNo);

    if (!reply) {
      throw new NotFoundException(
        `문의 답변 상세조회(getReplyByNo-service): ${enquiryNo}번 문의사항의 답변이 없습니다.`,
      );
    }

    return reply;
  }

  // Post Methods
  async createEnquiry(
    manager: EntityManager,
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    const enquiryNo: number = await this.setEnquiry(
      manager,
      createEnquiryDto,
      userNo,
    );

    if (files.length) {
      const imageUrls: string[] = await this.uploadImages(files);
      await this.setEnquiryImages(manager, imageUrls, enquiryNo);
    }
  }

  private async setEnquiry(
    manager: EntityManager,
    createEnquiryDto: CreateEnquiryDto,
    userNo: number,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiriesRepository)
      .createEnquiry({ ...createEnquiryDto, userNo });

    return insertId;
  }

  private async setEnquiryImages(
    manager: EntityManager,
    imageUrls: string[],
    enquiryNo: number,
  ): Promise<void> {
    const images: EnquiryImage<string>[] = await this.convertImageArray(
      enquiryNo,
      imageUrls,
    );

    await manager
      .getCustomRepository(EnquiryImagesRepository)
      .createEnquiryImages(images);
  }

  async createReply(
    createReplyDto: CreateReplyDto,
    enquiryNo: number,
    files: Express.Multer.File[],
    manager: EntityManager,
  ): Promise<void> {
    await this.readEnquiry(manager, enquiryNo);
    await this.isCreated(manager, enquiryNo);

    const reply: Reply = { ...createReplyDto, enquiryNo };
    const replyNo = await this.setReply(manager, reply);

    if (files.length) {
      await this.uploadReplyImages(manager, replyNo, files);
    }

    await this.closeEnquiry(manager, enquiryNo);
  }

  async isCreated(manager: EntityManager, enquiryNo: number): Promise<void> {
    const reply: Reply = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .getReplyByNo(enquiryNo);
    if (reply) {
      throw new BadRequestException(
        `답변 작성 확인(isCreated-service): 이미 답변이 작성된 문의사항입니다.`,
      );
    }
  }

  private async setReply(
    manager: EntityManager,
    reply: Reply,
  ): Promise<number> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .createReply(reply);

    if (!insertId) {
      throw new InternalServerErrorException(
        `문의 답변 생성(setReply-service): 알 수 없는 서버 에러입니다.`,
      );
    }

    return insertId;
  }

  private async uploadReplyImages(
    manager: EntityManager,
    replyNo: number,
    files: Express.Multer.File[],
  ): Promise<void> {
    const imageUrls = await this.awsService.uploadImages(files, 'reply');
    const images: ReplyImage<string>[] = imageUrls.map((imageUrl: string) => {
      return { replyNo, imageUrl };
    });
    await this.setReplyImages(manager, images);
  }

  private async setReplyImages(
    manager: EntityManager,
    images: ReplyImage<string>[],
  ): Promise<void> {
    const { insertId }: ResultSetHeader = await manager
      .getCustomRepository(EnquiryReplyImagesRepository)
      .setReplyImages(images);

    if (!insertId) {
      throw new InternalServerErrorException(
        `문의 답변 이미지 DB upload(setReplyImages-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  private async closeEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    const isClosed: number = await manager
      .getCustomRepository(EnquiriesRepository)
      .closeEnquiry(enquiryNo);

    if (!isClosed) {
      throw new InternalServerErrorException(
        `문의사항 답변상태 변경(closeEnquiry-service): 알 수 없는 서버 에러입니다.`,
      );
    }
  }

  //Patch Methods
  async editEnquiry(
    userNo: number,
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
    manager: EntityManager,
    files: Express.Multer.File[],
  ): Promise<void> {
    const { imageUrls, ...enquiry }: Enquiry<string[]> = await this.readEnquiry(
      manager,
      enquiryNo,
    );
    await this.validateWriter(enquiry.userNo, userNo);

    await this.updateEnquiry(manager, enquiryNo, updateEnquiryDto);
    await this.editEnquiryimages(manager, files, enquiryNo, imageUrls);
  }

  private async updateEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    updateEnquiryDto: UpdateEnquiryDto,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiriesRepository)
      .updateEnquiry(enquiryNo, updateEnquiryDto);
  }

  private async editEnquiryimages(
    manager: EntityManager,
    files: Express.Multer.File[],
    enquiryNo: number,
    imageUrls: string[],
  ): Promise<void> {
    if (!imageUrls.includes(null)) {
      await this.deleteEnquiryImages(manager, enquiryNo);
      await this.awsService.deleteFiles(imageUrls);
    }
    if (files.length) {
      const images: string[] = await this.uploadImages(files);
      await this.setEnquiryImages(manager, images, enquiryNo);
    }
  }

  async updateReply(
    manager: EntityManager,
    enquiryNo: number,
    updateReplyDto: UpdateReplyDto,
    files: Express.Multer.File[],
  ): Promise<void> {
    const reply: Reply = await this.getReplyByNo(manager, enquiryNo);

    await this.editReply(manager, enquiryNo, updateReplyDto);

    const { imageUrl, no }: Reply = reply;
    const images: string[] = JSON.parse(imageUrl);
    await this.editReplyimages(manager, images, files, no);
  }

  private async editReply(
    manager: EntityManager,
    enquiryNo: number,
    updateReplyDto: UpdateReplyDto,
  ): Promise<void> {
    const isEdited: number = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .updateReply(enquiryNo, updateReplyDto);

    if (!isEdited) {
      throw new InternalServerErrorException(
        `문의사항 답변 수정 오류 editReply-service.`,
      );
    }
  }

  private async editReplyimages(
    manager: EntityManager,
    images: string[],
    files: Express.Multer.File[],
    replyNo: number,
  ): Promise<void> {
    if (files.length) {
      await this.awsService.deleteFiles(images);
      await this.uploadReplyImages(manager, replyNo, files);
    } else {
      await this.awsService.deleteFiles(images);
      await this.deleteReplyImages(manager, replyNo);
    }
  }

  // Delete Methods
  async deleteEnquiry(
    manager: EntityManager,
    enquiryNo: number,
    userNo: number,
  ): Promise<void> {
    const { imageUrls, ...enquiry }: Enquiry<string[]> = await this.readEnquiry(
      manager,
      enquiryNo,
    );
    await this.validateWriter(enquiry.userNo, userNo);

    if (!imageUrls.includes(null)) {
      await this.awsService.deleteFiles(imageUrls);
    }
    await this.removeEnquiry(manager, enquiryNo);
  }

  private async removeEnquiry(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiriesRepository)
      .deleteEnquiry(enquiryNo);
  }

  private async deleteEnquiryImages(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await manager
      .getCustomRepository(EnquiryImagesRepository)
      .deleteEnquiryImages(enquiryNo);
  }

  async deleteReplyByEnquiryNo(
    manager: EntityManager,
    enquiryNo: number,
  ): Promise<void> {
    await this.readEnquiry(manager, enquiryNo);

    const isDeleted: number = await manager
      .getCustomRepository(EnquiryRepliesRepository)
      .deleteReply(enquiryNo);

    if (!isDeleted) {
      throw new InternalServerErrorException(
        `답변 삭제 오류 deleteReplyByEnquiryNo-service.`,
      );
    }
  }

  async deleteReplyImages(
    manager: EntityManager,
    replyNo: number,
  ): Promise<void> {
    const isDeleted: number = await manager
      .getCustomRepository(EnquiryReplyImagesRepository)
      .deleteReplyImages(replyNo);

    if (!isDeleted) {
      throw new InternalServerErrorException(
        `답변 삭제 오류 deleteReplyImages-service.`,
      );
    }
  }

  //function
  private async validateWriter(
    userNo: number,
    writerNo: number,
  ): Promise<void> {
    if (writerNo !== userNo) {
      throw new BadRequestException(
        `사용자 검증(validateWriter-service): 잘못된 사용자의 접근입니다.`,
      );
    }
  }

  private async validateAdmin(manager: EntityManager, userNo: number) {
    const { no }: Users = await manager
      .getCustomRepository(UsersRepository)
      .getUserByNo(userNo);

    if (no !== this.ADMIN_USER) {
      throw new BadRequestException(
        '관리자 검증(validateAdmin-service): 관리자가 아닙니다.',
      );
    }
  }

  private async convertImageArray(
    enquiryNo: number,
    imageUrls: string[],
  ): Promise<EnquiryImage<string>[]> {
    const images: EnquiryImage<string>[] = imageUrls.map((imageUrl: string) => {
      return { enquiryNo, imageUrl };
    });

    return images;
  }

  // s3
  private async uploadImages(files: Express.Multer.File[]): Promise<string[]> {
    const imageUrls: string[] = await this.awsService.uploadImages(
      files,
      'enquiry',
    );

    return imageUrls;
  }
}
