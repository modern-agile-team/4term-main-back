import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async uploadImage(file: Express.Multer.File) {
    const key = `chat/${file.originalname}`;
    const log = {
      Bucket: process.env.AWS_BUCKET_NAME,
      ACL: 'public-read',
      Key: key,
      Body: file.buffer,
    };
    await this.s3.upload(log, (err, data) => {
      if (err) {
        throw new InternalServerErrorException(
          '이미지 업로드에 실패하였습니다.',
        );
      }
    });
    return key;
  }
}
