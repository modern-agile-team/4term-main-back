import { InternalServerErrorException } from '@nestjs/common';
import { InsertRaw } from 'src/meetings/interface/meeting.interface';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatFileUrls } from '../entity/chat-file-urls.entity';
import { FileUrlDetail } from '../interface/chat.interface';

@EntityRepository(ChatFileUrls)
export class ChatFileUrlsRepository extends Repository<ChatFileUrls> {
  async saveFileUrl(fileUrlDetail: FileUrlDetail): Promise<InsertRaw> {
    try {
      const { raw }: InsertResult = await this.createQueryBuilder()
        .insert()
        .into(ChatFileUrls)
        .values(fileUrlDetail)
        .execute();

      return raw;
    } catch (error) {
      throw new InternalServerErrorException(
        `${error}: 파일 url 저장(saveFileUrl): 알 수 없는 서버 에러입니다.`,
      );
    }
  }
}
