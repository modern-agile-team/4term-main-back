import { EntityRepository, Repository } from 'typeorm';
import { ChatLog } from '../entity/chat-log.entity';

@EntityRepository(ChatLog)
export class ChatLogRepository extends Repository<ChatLog> {}
