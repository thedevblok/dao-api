import { Injectable, Query } from '@nestjs/common';
import { getRepository, LessThan, MoreThan } from 'typeorm';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';
import { QAOVote } from '../entities/qao-vote.entity';
import * as luxon from 'luxon';
import { QAOVoteAttendanceDto } from '../dto/vote.dto';
import Decimal from 'decimal.js';

@Injectable()
export class VoteService {
  async getVote(voteId: string): Promise<QAOVote> {
    const repository = getRepository(QAOVote);
    try {
      const vote = await repository.findOne({
        where: {
          voteId: voteId,
        },
      });

      return vote;
    } catch (error) {
      console.log(error);
    }
  }

  async getActiveVotes(): Promise<QAOVote[]> {
    const repository = getRepository(QAOVote);
    return await repository.find({
      where: {
        timestamp: MoreThan(
          Math.round(
            luxon.DateTime.utc().minus({ weeks: 1 }).toMillis() / 1000,
          ),
        ),
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async getInactiveVotes(@Query('count') count: number): Promise<QAOVote[]> {
    const repository = getRepository(QAOVote);
    return await repository.find({
      where: {
        timestamp: LessThan(
          Math.round(
            luxon.DateTime.utc().minus({ weeks: 1 }).toMillis() / 1000,
          ),
        ),
      },
      order: {
        timestamp: 'DESC',
      },
      take: count,
    });
  }

  async getVoteAttendances(
    @Query('address') address: string,
    @Query('voteId') voteId: string,
  ): Promise<QAOVoteAttendance[]> {
    const repository = getRepository(QAOVoteAttendance);
    return await repository.find({
      where: {
        address,
        voteId,
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async getMatureVoteAttendances(
    @Query('address') address: string,
  ): Promise<QAOVoteAttendance[]> {
    const repository = getRepository(QAOVoteAttendance);
    return await repository.find({
      where: {
        address,
        unlockTimestamp: LessThan(luxon.DateTime.utc().toString()),
      },
      order: {
        timestamp: 'DESC',
      },
    });
  }

  async updateVoteWeightByPositions(
    qaoVoteAttendance: QAOVoteAttendance,
    qaoVote: QAOVote,
  ) {
    const qaoAttendanceAmount = new Decimal(qaoVoteAttendance.amount);
    const qaoAttendanceTotalWeight = new Decimal(qaoVoteAttendance.totalWeight);

    if (qaoVoteAttendance.position) {
      const votePositive = new Decimal(qaoVote.votePositive);
      qaoVote.votePositive = qaoAttendanceAmount.add(votePositive).toString();

      const voteWeightPositive = new Decimal(qaoVote.voteWeightPositive);
      qaoVote.voteWeightPositive = qaoAttendanceTotalWeight
        .add(voteWeightPositive)
        .toString();
    } else {
      const voteNegative = new Decimal(qaoVote.voteNegative);
      qaoVote.voteNegative = qaoAttendanceAmount.add(voteNegative).toString();

      const voteWeightNegative = new Decimal(qaoVote.voteWeightNegative);
      qaoVote.voteWeightNegative = qaoAttendanceTotalWeight
        .add(voteWeightNegative)
        .toString();
    }

    const voteRepository = getRepository(QAOVote);

    try {
      await voteRepository.update({ id: qaoVote.id }, qaoVote);
    } catch (e) {
      console.log(e);
    }
  }
}
