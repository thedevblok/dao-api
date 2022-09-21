import { BigNumber } from 'ethers';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';
import { QAOVote } from '../entities/qao-vote.entity';

export class QAOVoteDao {
  voteId: BigNumber;
  creator: string;
  timestamp: BigNumber;
  votePositive: BigNumber;
  voteNegative: BigNumber;
  valid: boolean;
  heading: string;
  description: string;
  voteWeightNegative: string;
  voteWeightPositive: string;
}

export class QAOVoteAttendanceDao {
  voteId: BigNumber;
  attendanceId: BigNumber;
  address: string;
  amount: BigNumber;
  timestamp: BigNumber;
  lockWeeks: BigNumber;
  position: boolean;
  withdrawn: boolean;
  multiplier: BigNumber;
}

export class QAOVoteDto {
  voteId: string;
  creator: string;
  timestamp: string;
  votePositive: string;
  voteNegative: string;
  valid: boolean;
  heading: string;
  description: string;
  voteWeightNegative: string;
  voteWeightPositive: string;
}

export class QAOVoteAttendanceDto {
  voteId: string;
  attendanceId: string;
  address: string;
  amount: string;
  timestamp: string;
  unlockTimestamp: Date;
  lockWeeks: string;
  position: boolean;
  withdrawn: boolean;
  totalWeight: string;
}

export class QAOVoteAttendanceToDtoTransformer {
  public convertQAOVoteAttendanceToDto(
    qaoVoteAttendance: QAOVoteAttendance,
  ): QAOVoteAttendanceDto {
    return {
      voteId: qaoVoteAttendance.voteId,
      address: qaoVoteAttendance.address,
      amount: qaoVoteAttendance.amount,
      attendanceId: qaoVoteAttendance.attendanceId,
      lockWeeks: qaoVoteAttendance.lockWeeks,
      position: qaoVoteAttendance.position,
      timestamp: qaoVoteAttendance.timestamp,
      unlockTimestamp: qaoVoteAttendance.unlockTimestamp,
      totalWeight: qaoVoteAttendance.totalWeight,
      withdrawn: qaoVoteAttendance.withdrawn,
    };
  }
}

export class QAOVoteToDtoTransformer {
  public convertQAOVoteToDto(qaoVote: QAOVote): QAOVoteDto {
    return {
      voteId: qaoVote.voteId,
      creator: qaoVote.creator,
      timestamp: qaoVote.timestamp,
      votePositive: qaoVote.votePositive,
      voteNegative: qaoVote.voteNegative,
      valid: qaoVote.valid,
      heading: qaoVote.heading,
      description: qaoVote.description,
      voteWeightNegative: qaoVote.voteWeightNegative,
      voteWeightPositive: qaoVote.voteWeightPositive,
    };
  }
}
