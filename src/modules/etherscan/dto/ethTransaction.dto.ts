import { EthTransaction } from '../entities/ethTransaction.entity';

export class EthTransactionDto {
  updatedAt: Date;
  blockNumber: number;
  from: string;
  to: string;
  hash: string;
  amount: string;
  confirmations: number;
  processed: boolean;
}

export class EthTransactionToDtoTransformer {
  public convertEthTransactionToDto(
    ethTransaction: EthTransaction,
  ): EthTransactionDto {
    return {
      updatedAt: ethTransaction.updatedAt,
      blockNumber: ethTransaction.blockNumber,
      from: ethTransaction.from,
      to: ethTransaction.to,
      hash: ethTransaction.hash,
      amount: ethTransaction.amount,
      confirmations: ethTransaction.confirmations,
      processed: ethTransaction.processed,
    };
  }
}
