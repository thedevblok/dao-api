import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  Query,
} from '@nestjs/common';
import {
  QAOVoteAttendanceDto,
  QAOVoteAttendanceToDtoTransformer,
  QAOVoteDto,
  QAOVoteToDtoTransformer,
} from '../dto/vote.dto';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';
import { QAOVote } from '../entities/qao-vote.entity';
import { VoteService } from '../services/vote.service';

@Controller('api')
export class GetVotesController {
  constructor(private voteService: VoteService) {}

  @Get('get-vote')
  async getVote(@Query('voteId') voteId: string): Promise<QAOVoteDto> {
    const vote = await this.voteService.getVote(voteId);

    if (!vote) {
      throw new BadRequestException(
        `The vote with id #${voteId} doesn't exist.`,
      );
    }

    return new QAOVoteToDtoTransformer().convertQAOVoteToDto(vote);
  }

  @Get('get-active-votes')
  async getActiveVotes(): Promise<QAOVoteDto[]> {
    const votes = await this.voteService.getActiveVotes();
    return votes.map((vote: QAOVote) => {
      return new QAOVoteToDtoTransformer().convertQAOVoteToDto(vote);
    });
  }

  @Get('get-inactive-votes')
  async getInactiveVotes(@Query('count') count: number): Promise<QAOVoteDto[]> {
    const votes = await this.voteService.getInactiveVotes(count);
    return votes.map((vote: QAOVote) => {
      return new QAOVoteToDtoTransformer().convertQAOVoteToDto(vote);
    });
  }

  @Get('get-vote-attendances')
  async getVoteAttendances(
    @Query('address') address: string,
    @Query('voteId') voteId: string,
  ): Promise<QAOVoteAttendanceDto[]> {
    const voteAttendances = await this.voteService.getVoteAttendances(
      address,
      voteId,
    );
    return voteAttendances.map((voteAttendance: QAOVoteAttendance) => {
      return new QAOVoteAttendanceToDtoTransformer().convertQAOVoteAttendanceToDto(
        voteAttendance,
      );
    });
  }

  @Get('get-mature-vote-attendances')
  async getMatureVoteAttendances(
    @Query('address') address: string,
  ): Promise<QAOVoteAttendanceDto[]> {
    const voteAttendances = await this.voteService.getMatureVoteAttendances(
      address,
    );
    return voteAttendances.map((voteAttendance: QAOVoteAttendance) => {
      return new QAOVoteAttendanceToDtoTransformer().convertQAOVoteAttendanceToDto(
        voteAttendance,
      );
    });
  }
}
