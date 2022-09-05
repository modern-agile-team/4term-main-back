import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// fk없음, entity취합 후 생성예정
@Entity()
export class BoardMemberInfo extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;

  @Column({ type: 'int' })
  male: number;

  @Column({ type: 'int' })
  female: number;
}
