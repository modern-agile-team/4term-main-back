import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsService {
  private readonly s3: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_BUCKET_REGION,
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    this.s3 = new AWS.S3();
  }

  async uploadChatFiles(files: Express.Multer.File[], chatRoomNo: number) {
    if (!files.length) {
      throw new BadRequestException(`업로드 할 파일이 존재하지 않습니다.`);
    }
    const uploadFileList: object[] = files.map((file) => {
      const key = `chat/${chatRoomNo}/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    await uploadFileList.map((uploadFile: any) => {
      this.s3.upload(uploadFile, (err, data) => {
        if (err) {
          throw new InternalServerErrorException(
            '파일 업로드에 실패하였습니다.',
          );
        }
      });
    });

    const fileUrlList: string[] = uploadFileList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return fileUrlList;
  }

  async uploadProfileImage(userNo: number, image: Express.Multer.File) {
    const imageKey = `user_profile/${userNo}/${Date.now()}_${
      image.originalname
    }`.replace(/ /g, '');
    const profileImage = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: 'public-read',
      Key: imageKey,
      Body: image.buffer,
    };

    this.s3.upload(profileImage, (err, data) => {
      if (err) {
        throw new InternalServerErrorException(
          '이미지 업로드에 실패하였습니다.',
        );
      }
    });

    return process.env.AWS_BUCKET_LINK + imageKey;
  }

  async deleteProfileImage(imageUrl: string) {
    const profileImage = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: imageUrl.replace(process.env.AWS_BUCKET_LINK, ''),
    };

    this.s3.deleteObject(profileImage, (err) => {
      if (err) {
        throw new InternalServerErrorException('이미지 삭제에 실패하였습니다.');
      }
    });
  }
}
