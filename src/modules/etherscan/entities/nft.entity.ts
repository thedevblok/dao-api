import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Nft extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  editionNumber: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  address: string;

  @Column({ default: 0 })
  minted: boolean;

  @Column({ default: 0 })
  transferred: boolean;

  @Column()
  ethTransaction: number;
}
