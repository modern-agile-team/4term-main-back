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

  async uploadAnnouncesFiles(files: Express.Multer.File[]): Promise<string[]> {
    if (!files.length) {
      throw new BadRequestException(`업로드 할 파일이 존재하지 않습니다.`);
    }
    const uploadFileList: object[] = files.map((file) => {
      const key = `announces/${Date.now()}_${file.originalname}`;

      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        ACL: 'public-read',
        Key: key,
        Body: file.buffer,
      };
    });

    uploadFileList.map((uploadFile: any) => {
      this.s3
        .upload(uploadFile, (err, data) => {
          if (err) {
            throw new InternalServerErrorException(
              '파일 업로드에 실패하였습니다.',
            );
          }
        })
        .promise();
    });

    const fileUrlList: string[] = uploadFileList.map((file: any) => {
      return process.env.AWS_BUCKET_LINK + file.Key;
    });

    return fileUrlList;
  }

  async deleteFiles(imagesUrlList: string[], table: string): Promise<void> {
    const keys = imagesUrlList.map((el: string) => {
      let url = el.split('.com/');

      return { Key: url[1] };
    });

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: keys,
        Quiet: false,
      },
    };

    await this.s3
      .deleteObjects(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log(data);
      })
      .promise();
  }
}
