import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class EthTransaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  blockNumber: number;

  @Column()
  from: string;

  @Column()
  to: string;

  @Column({
    unique: true,
  })
  hash: string;

  @Column()
  amount: string;

  @Column({ default: 0 })
  confirmations: number;

  @Column({ default: 0 })
  processed: boolean;
}
