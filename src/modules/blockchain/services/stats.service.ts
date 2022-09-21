import { BadRequestException, Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { getRepository, MoreThan } from 'typeorm';
import { QAOVoteAttendance } from '../entities/qao-vote-attendance.entity';

@Injectable()
export class StatsService {
  static readonly DIVIDER = 1000000000000000000;
  static readonly MAX_STAKED_WEEK = 521;

  async getTotalLockedAmount(): Promise<number> {
    const repository = getRepository(QAOVoteAttendance);

    const votes = await repository.find({
      where: {
        unlockTimestamp: MoreThan(DateTime.utc().toString()),
      },
    });

    return this.getTotalAmount(votes);
  }

  async getLockedAmountsPerWeeks(
    periodsCount: number = StatsService.MAX_STAKED_WEEK,
  ): Promise<any> {
    const repository = getRepository(QAOVoteAttendance);
    const periods = this.getPeriods(periodsCount);

    const votes = await repository.find({
      where: {
        unlockTimestamp: MoreThan(
          periods[0].start.toJSDate(),
          // periods[periods.length - 1].end.toJSDate(),
        ),
      },
    });

    const totalAmount = this.getTotalAmount(votes);

    const groupedVotes = _.chain(votes)
      .groupBy((vote) =>
        periods.findIndex((period) => {
          const date = DateTime.fromJSDate(vote.unlockTimestamp);
          return date >= period.start && date <= period.end;
        }),
      )
      .map((values, key) => ({
        period: +key,
        total: values.reduce(
          (old, vote) =>
            old +
            new Decimal(vote.amount).dividedBy(StatsService.DIVIDER).toNumber(),
          0,
        ),
      }))
      .value();

    return periods.reduce((old, period, index) => {
      const lastPeriodIndex = index - 1;
      const votes = groupedVotes.find((votes) => votes.period === index);
      const lastVotes = groupedVotes.find(
        (votes) => votes.period === lastPeriodIndex,
      );
      const lastPeriod = old[lastPeriodIndex];
      const lastPeriodAmountLocked = lastVotes?.total || 0;
      const currentTotalAmountLocked = !!lastPeriod
        ? lastPeriod.currentAmountLocked
        : totalAmount;

      return [
        ...old,
        {
          ...period,
          period: index,
          currentAmountLocked: _.max([
            currentTotalAmountLocked - lastPeriodAmountLocked,
            0,
          ]),
          currentUnlockedAmount: votes?.total || 0,
        },
      ];
    }, []);
  }

  async getPeriodTotalWeight(address: string | null): Promise<any> {
    const repository = getRepository(QAOVoteAttendance);
    const nextPaymentDate = this.getNextPaymentDate().toJSDate();
    let totalWeightForAddress = null;

    const allVotes = await repository.find({
      where: {
        unlockTimestamp: MoreThan(nextPaymentDate),
      },
    });

    const totalNetworkWeight = allVotes.reduce(
      (old, vote) =>
        old +
        new Decimal(vote.totalWeight)
          .dividedBy(StatsService.DIVIDER)
          .toNumber(),
      0,
    );

    if (address) {
      const votes = await repository.find({
        where: {
          address,
          unlockTimestamp: MoreThan(nextPaymentDate),
        },
      });
      totalWeightForAddress = votes.reduce(
        (old, vote) =>
          old +
          new Decimal(vote.totalWeight)
            .dividedBy(StatsService.DIVIDER)
            .toNumber(),
        0,
      );
    }

    const response = {
      nextPaymentDate,
      totalNetworkWeight,
      totalWeightForAddress,
    };

    return response;
  }

  async getPayoutList(date: string, amount: string) {
    const repository = getRepository(QAOVoteAttendance);
    let paymentDate = DateTime.fromFormat(date, 'yyyy-MM-dd');

    paymentDate = paymentDate.setZone('UTC').set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const allVotes = await repository.find({
      where: {
        unlockTimestamp: MoreThan(paymentDate.toJSDate()),
      },
    });

    const totalNetworkWeight = allVotes.reduce(
      (old, vote) =>
        old +
        new Decimal(vote.totalWeight)
          .dividedBy(StatsService.DIVIDER)
          .toNumber(),
      0,
    );

    const admissibleVoteAttendances = await repository.find({
      where: {
        unlockTimestamp: MoreThan(paymentDate.toJSDate()),
      },
    });

    const weightByAddress = _.chain(admissibleVoteAttendances)
      .groupBy('address')
      .map(function (values, key) {
        const weight = values.reduce(
          (old, vote) =>
            old +
            new Decimal(vote.totalWeight)
              .dividedBy(StatsService.DIVIDER)
              .toNumber(),
          0,
        );

        const payout = new Decimal(weight)
          .dividedBy(new Decimal(totalNetworkWeight))
          .mul(new Decimal(amount))
          .toNumber();
        return {
          address: key,
          payoutAmount: payout.toFixed(0),
        };
      })
      .value();
    console.log(weightByAddress);

    let payoutString = '';

    _.each(weightByAddress, function (weight) {
      payoutString =
        payoutString + weight.address + ',' + weight.payoutAmount + '<br/>';
    });
    return payoutString;
  }

  private getPeriods(count: number) {
    const weeksNumber = 1;
    if (count < 1 || count > StatsService.MAX_STAKED_WEEK) {
      throw new BadRequestException(
        `You have to get between 1 and ${StatsService.MAX_STAKED_WEEK} periods.`,
      );
    }
    const period = this.getPeriod();

    return _.range(count / weeksNumber).map((value) => ({
      start: period.start.plus({ weeks: weeksNumber * value }),
      end: period.end.plus({ weeks: weeksNumber * (value + 1) - 1 }),
    }));
  }

  private getNextPaymentDate() {
    const now = DateTime.utc();
    const thisWenesday = now.set({
      weekday: 3,
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 1,
    });
    const paymentDate =
      now < thisWenesday ? thisWenesday : thisWenesday.plus({ week: 1 });

    return paymentDate;
  }

  private getPeriod(period = 0) {
    const now = DateTime.utc();
    const thisWenesday = now.set({
      weekday: 3,
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 1,
    });

    const start =
      now > thisWenesday ? thisWenesday : thisWenesday.minus({ week: 1 });

    const end = (
      now > thisWenesday ? thisWenesday.plus({ week: 1 }) : thisWenesday
    ).set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    return {
      start: start.plus({ week: period }),
      end: end.plus({ week: period }),
    };
  }

  private getTotalAmount(voteAttendences: QAOVoteAttendance[]): number {
    const totalAmount = voteAttendences.reduce(
      (old, voteAttendence) => old.add(new Decimal(voteAttendence.amount)),
      new Decimal(0),
    );

    return totalAmount.dividedBy(StatsService.DIVIDER).toNumber();
  }
}
