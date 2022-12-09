import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AwsService } from './aws.service';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10)) // 10은 최대파일개수
  async uploadFile(@UploadedFiles() files) {
    const imgUrl: string[] = [];
    files.map(async (file: Express.Multer.File) => {
      const key = await this.awsService.uploadImage(file);
      imgUrl.push(process.env.AWS_BUCKET_LINK + key);
    });

    return {
      msg: `이미지 등록 성공`,
      response: imgUrl,
    };
  }
}
