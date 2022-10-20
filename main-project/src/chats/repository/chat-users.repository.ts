import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { ChatUsers } from '../entity/chat-users.entity';

@EntityRepository(ChatUsers)
export class ChatUsersRepository extends Repository<ChatUsers> {
  async setRoomUsers(roomUsers): Promise<number> {
    const { raw }: InsertResult = await this.createQueryBuilder('chat_users')
      .insert()
      .into(ChatUsers)
      .values(roomUsers)
      .execute();

    return raw.affectedRows;
  }
}
