import { BaseEntity, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('credits')
export class Credits extends BaseEntity {
  @PrimaryGeneratedColumn()
  no: number;
}
