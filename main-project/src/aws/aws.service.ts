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

  async uploadImage(files: any, chatRoomNo: number) {
    const uploadImageList: object[] = files.map((file) => {
      const key = `chat/${chatRoomNo}/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    await uploadImageList.map((uploadFile: any) => {
      this.s3.upload(uploadFile, (err, data) => {
        if (err) {
          throw new InternalServerErrorException(
            '이미지 업로드에 실패하였습니다.',
          );
        }
      });
    });

    const imageUrlList: string[] = uploadImageList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return imageUrlList;
  }
}
