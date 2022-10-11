import { EntityRepository, Repository } from 'typeorm';
import { ChatList } from '../entity/chat-list.entity';

@EntityRepository(ChatList)
export class ChatListRepository extends Repository<ChatList> {}
