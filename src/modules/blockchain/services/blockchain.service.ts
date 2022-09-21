import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { BigNumber, Contract, ethers } from 'ethers';
import { getRepository } from 'typeorm';
import blockchainConfig from '../configs/blockchain.config';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';
import { QAOVote } from '../entities/qao-vote.entity';
import { abi } from '../votingAbi.json';
import { VoteService } from './vote.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private qaoContract: Contract;

  constructor(
    @Inject(blockchainConfig.KEY)
    private readonly config: ConfigType<typeof blockchainConfig>,
    private readonly voteService: VoteService,
  ) {
    const provider = this.getProvider();
    this.qaoContract = new ethers.Contract(
      this.config.contractAddress.vote,
      abi,
      provider,
    );
  }

  onModuleInit() {
    if (process.env.APP_INSTANCE_SEQ === '0' || process.env.NODE_ENV == 'DEV') {
      this.listenOnStartOfVote();
      this.listenOnAttendanceSubmitted();
    }
  }

  async listenOnStartOfVote() {
    console.log('listenOnStartOfVote Started');
    this.qaoContract.on('StartOfVote', async (voteId: BigNumber) => {
      console.log('StartOfVote Triggered');
      await this.getAndCreateQaoVoteFromId(voteId);
    });
  }

  async getAndCreateQaoVoteFromId(voteId: BigNumber) {
    const qaoVoteData = await this.qaoContract.getVote(voteId);
    const qaoVote: QAOVote = new QAOVote();
    qaoVote.voteId = voteId.toString();
    qaoVote.creator = qaoVoteData[0];
    qaoVote.timestamp = qaoVoteData[1].toString();
    qaoVote.description = '';
    const repository = getRepository(QAOVote);
    try {
      await repository.save(qaoVote);
    } catch (e) {
      console.log(e);
    }
  }

  async listenOnAttendanceSubmitted() {
    console.log('listenOnAttendanceSubmitted Started');
    this.qaoContract.on('AttendanceSubmitted', async (attendanceId) => {
      console.log('AttendanceSubmitted Triggered');
      await this.getAndCreateVoteAttendanceFromId(attendanceId);
    });
  }

  async getAndCreateVoteAttendanceFromId(attendanceId) {
    const qaoVoteAttendanceData = await this.qaoContract.getAttendance(
      attendanceId,
    );
    console.log(qaoVoteAttendanceData);
    const qaoVoteAttendance: QAOVoteAttendance = new QAOVoteAttendance();
    qaoVoteAttendance.attendanceId = attendanceId.toString();
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
      await new Promise((resolve) => setTimeout(resolve, 5000));
      const qaoVote: QAOVote = await voteRepository.findOne({
        voteId: qaoVoteAttendance.voteId,
      });
      if (qaoVote !== undefined)
        this.voteService.updateVoteWeightByPositions(
          qaoVoteAttendance,
          qaoVote,
        );
    } catch (e) {
      console.log(e);
    }
  }

  getProvider(): ethers.providers.Provider {
    const nodeNetwork = this.config.provider.nodeNetwork;
    if (nodeNetwork == 'localhost') {
      return new ethers.providers.JsonRpcProvider({
        url: this.config.provider.url,
      });
    } else if (
      this.config.provider.name == 'infura' &&
      (nodeNetwork == 'rinkeby' || nodeNetwork == 'mainnet')
    ) {
      return new ethers.providers.WebSocketProvider(
        `wss://${nodeNetwork}.infura.io/ws/v3/${this.config.infura.id}`,
      );
    } else {
      throw new Error('Provier wrongly configured');
    }
  }
}
