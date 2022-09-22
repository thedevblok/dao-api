import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';

@Entity()
export class Etherscan extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    default: '0',
  })
  numberOfHolders: string;

  @Column()
  circulatingSupply: string;

  @Column({ default: 0 })
  lastBlockSynced: number;
}
