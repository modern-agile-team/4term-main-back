import {
  BaseEntity,
  Column,
  Entity,
  EntityColumnNotFound,
  PrimaryColumn,
} from 'typeorm';

@Entity('chat_list')
export class ChatList extends BaseEntity {
  @PrimaryColumn()
  no: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column()
  memberNo: number;
}
