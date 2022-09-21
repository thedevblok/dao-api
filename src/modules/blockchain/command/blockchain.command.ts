import { JsonRpcProvider } from '@ethersproject/providers';
import { Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Decimal from 'decimal.js';
import { BigNumber, ethers } from 'ethers';
import { Command, Console } from 'nestjs-console';
import { getRepository } from 'typeorm';
import blockchainConfig from '../configs/blockchain.config';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';
import { QAOVote } from '../entities/qao-vote.entity';
import { abi } from '../votingAbi.json';

@Console({
  command: 'blockchain',
  description: 'CLI Commands for blockchain module',
})
export class BlockchainCommands {
  constructor(
    @Inject(blockchainConfig.KEY)
    private readonly config: ConfigType<typeof blockchainConfig>,
  ) {}

  @Command({
    command: 'sync-vote <voteId>',
    description: 'Sync the vote from the blockchain',
  })
  async syncVoteFromBlockchain(voteId: number): Promise<void> {
    const provider: JsonRpcProvider = new ethers.providers.JsonRpcProvider({
      url: this.config.provider.url,
    });
    const qaoContract = new ethers.Contract(
      this.config.contractAddress.vote,
      abi,
      provider,
    );
    const voteIdBN = BigNumber.from(voteId);
    const qaoVoteData = await qaoContract.getVote(voteIdBN);
    const qaoVote: QAOVote = new QAOVote();
    qaoVote.voteId = voteIdBN.toString();
    qaoVote.creator = qaoVoteData[0];
    qaoVote.timestamp = qaoVoteData[1].toString();
    qaoVote.description = '';
    const repository = getRepository(QAOVote);
    try {
      await repository.save(qaoVote);
    } catch (e) {
      console.log(e);
    }
    console.log('Job done');
  }

  @Command({
    command: 'sync-attendance <attendanceId>',
    description: 'Sync the vote from the blockchain',
  })
  async syncVoteAttendanceFromBlockchain(attendanceId: number): Promise<void> {
    const provider: JsonRpcProvider = new ethers.providers.JsonRpcProvider({
      url: this.config.provider.url,
    });
    const qaoContract = new ethers.Contract(
      this.config.contractAddress.vote,
      abi,
      provider,
    );
    const voteAttendanceIdBN = BigNumber.from(attendanceId);
    const qaoVoteAttendanceData = await qaoContract.getAttendance(
      voteAttendanceIdBN,
    );
    const qaoVoteAttendance: QAOVoteAttendance = new QAOVoteAttendance();
    qaoVoteAttendance.attendanceId = voteAttendanceIdBN.toString();
    qaoVoteAttendance.voteId = qaoVoteAttendanceData[1].toString();
    qaoVoteAttendance.address = qaoVoteAttendanceData[0];
    qaoVoteAttendance.amount = qaoVoteAttendanceData[2].toString();
    qaoVoteAttendance.timestamp = qaoVoteAttendanceData[3].toString();
    qaoVoteAttendance.lockWeeks = qaoVoteAttendanceData[4].toString();
    qaoVoteAttendance.position = qaoVoteAttendanceData[5];
    qaoVoteAttendance.withdrawn = qaoVoteAttendanceData[6];
    const voteAttendanceRepository = getRepository(QAOVoteAttendance);
    const voteRepository = getRepository(QAOVote);

    try {
      await voteAttendanceRepository.save(qaoVoteAttendance);
      const qaoVote: QAOVote = await voteRepository.findOne({
        voteId: qaoVoteAttendance.voteId,
      });

      const qaoAttendanceAmount = new Decimal(qaoVoteAttendance.amount);
      const qaoAttendanceTotalWeight = new Decimal(
        qaoVoteAttendance.totalWeight,
      );

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
      await voteRepository.update({ id: qaoVote.id }, qaoVote);
    } catch (e) {
      console.log(e);
    }
    console.log('Job done');
  }
}
