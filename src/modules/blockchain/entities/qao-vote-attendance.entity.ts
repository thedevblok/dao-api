import {
  BaseEntity,
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import Decimal from 'decimal.js';
import * as luxon from 'luxon';

@Entity()
@Unique('unique_vote_attendance', ['voteId', 'attendanceId', 'address'])
export class QAOVoteAttendance extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  voteId: string;

  @Column()
  attendanceId: string;

  @Column()
  address: string;

  @Column()
  amount: string;

  @Column()
  timestamp: string;

  @Column({ type: 'timestamp' })
  unlockTimestamp: Date;

  @Column()
  lockWeeks: string;

  @Column({ type: 'bool' })
  position: boolean;

  @Column({ type: 'bool' })
  withdrawn: boolean;

  @Column({
    default: 1,
  })
  multiplier: string;

  @Column({
    default: null,
  })
  totalWeight: string;

  @DeleteDateColumn()
  deleted: Date;

  @CreateDateColumn()
  createdAt: Date;

  async multiplierCalculation() {
    const lockweeks = new Decimal(this.lockWeeks);
    const powFactor = new Decimal(1.4);
    const initialValue = new Decimal(1);
    const factor = new Decimal(0.005);
    const multiplier = lockweeks.pow(powFactor).mul(factor).plus(initialValue);
    this.multiplier = multiplier.toFixed(6);
    return multiplier;
  }

  @BeforeInsert()
  async totalWeightCalculation() {
    const multiplier = await this.multiplierCalculation();
    this.totalWeight = new Decimal(this.amount).mul(multiplier).toString();
    this.unlockTimestamp = luxon.DateTime.fromMillis(
      parseInt(this.timestamp) * 1000,
    )
      .plus({ weeks: parseInt(this.lockWeeks) })
      .toJSDate();
  }
}
