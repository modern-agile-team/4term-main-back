import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// fk없음, entity취합 후 생성예정
@Entity()
export class BoardBookmark extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;
}
