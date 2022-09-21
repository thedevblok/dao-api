import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class QAOVote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  voteId: string;

  @Column()
  creator: string;

  @Column()
  timestamp: string;

  @Column({
    default: '0',
  })
  votePositive: string;

  @Column({
    default: '0',
  })
  voteNegative: string;

  @Column({
    default: 0,
  })
  valid: boolean;

  @Column({
    default: '',
  })
  heading: string;

  @Column({
    type: 'longtext',
  })
  description: string;

  @Column({
    default: '0',
  })
  voteWeightPositive: string;

  @Column({
    default: '0',
  })
  voteWeightNegative: string;
}
