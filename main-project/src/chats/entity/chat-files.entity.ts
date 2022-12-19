import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_files')
export class ChatList extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string;
}
