import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ChatLog } from './chat-log.entity';

@Entity('chat_file_urls')
export class ChatFileUrls extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @ManyToOne((type) => ChatLog, (chatLog) => chatLog.chatFileUrl, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_log_no' })
  chatLogNo: number;

  @Column({ name: 'file_url', type: 'varchar', length: 255, nullable: false })
  fileUrl: string;
}
