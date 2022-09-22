import { JsonRpcProvider } from '@ethersproject/providers';
import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import Decimal from 'decimal.js';
import { ethers } from 'ethers';
import * as _ from 'lodash';
import { lastValueFrom } from 'rxjs';
import { getRepository } from 'typeorm';
import etherscanConfig from '../configs/etherscan.config';
import { Etherscan } from '../entities/etherscan.entity';
import { EthTransaction } from '../entities/ethTransaction.entity';
import { Nft } from '../entities/nft.entity';
import { globeHeadsNFTAbi } from '../globeHeadsNFTAbi.json';

@Injectable()
export class EtherscanService {
  constructor(
    @Inject(etherscanConfig.KEY)
    private readonly config: ConfigType<typeof etherscanConfig>,
    private httpService: HttpService,
  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async syncTransactions() {
    if (process.env.APP_INSTANCE_SEQ === '0' || process.env.NODE_ENV == 'DEV') {
      const ethAddress = '0x4c3EFd41160E13D6d12002a1Aca923876B7Ef50f';
      const repository = getRepository(Etherscan);
      const etherscanData = await repository.findOne(1);
      let lastBlock = etherscanData.lastBlockSynced;
      const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${ethAddress}&startblock=${lastBlock + 1
        }&endblock=99999999&sort=asc&apikey=${this.config.apiKey}`;

      const transactions = await lastValueFrom(
        this.httpService.get(etherscanUrl),
      );

      const results = transactions.data.result;

      if (results.length > 0) {
        const ethTransactionRepository = getRepository(EthTransaction);
        _.each(results, async function (result) {
          if (
            result.to?.toLowerCase() == ethAddress.toLowerCase() &&
            result.confirmations >= 7 &&
            result.value > 0
          ) {
            console.log(results);
            const ethTransaction: EthTransaction = new EthTransaction();
            ethTransaction.blockNumber = result.blockNumber;
            ethTransaction.from = result.from;
            ethTransaction.to = result.to;
            ethTransaction.hash = result.hash;
            ethTransaction.amount = result.value;
            ethTransaction.confirmations = result.confirmations;
            lastBlock = result.blockNumber;
            try {
              await ethTransactionRepository.save(ethTransaction);
            } catch (e) {
              console.log(e);
            }
          }
        });

        etherscanData.lastBlockSynced = lastBlock;
        try {
          await repository.save(etherscanData);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processTransactions() {
    if (process.env.APP_INSTANCE_SEQ === '0' || process.env.NODE_ENV == 'DEV') {
      const ethTransactionRepository = getRepository(EthTransaction);
      const transactionToProcess = await ethTransactionRepository.findOne({
        processed: false,
      });

      if (transactionToProcess) {
        const nftRepository = getRepository(Nft);
        let totalNft = await nftRepository.count();
        const amount = transactionToProcess.amount;
        const nftCount = new Decimal(amount)
          .dividedBy(60000000000000000)
          .toNumber();

        console.log(nftCount);
        if (nftCount >= 1) {
          for (let i = 1; i <= nftCount; i++) {
            totalNft = totalNft + 1;
            await this.saveNft(transactionToProcess, totalNft);
          }
        }
        transactionToProcess.processed = true;
        try {
          await ethTransactionRepository.save(transactionToProcess);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }

  async saveNft(transaction, editionNumber) {
    const nftRepository = getRepository(Nft);
    const nft: Nft = new Nft();
    nft.address = transaction.from;
    nft.ethTransaction = transaction.id;
    nft.editionNumber = editionNumber;
    try {
      await nftRepository.save(nft);
    } catch (e) {
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async transferNft() {
    if (process.env.APP_INSTANCE_SEQ === '0' || process.env.NODE_ENV == 'DEV') {
      console.log('------ ERROR: ------- ');
      const nftRepository = getRepository(Nft);

      const nftsToTransfer = await nftRepository.find({
        where: {
          minted: true,
          transferred: false,
        },
        take: 1,
      });

      const nftToTransfer = nftsToTransfer[0];
      console.log(
        '------ TRANSFER NFT: ------- ' + nftToTransfer.editionNumber,
      );

      if (nftsToTransfer[0]) {
        const maticProvider: JsonRpcProvider =
          new ethers.providers.JsonRpcProvider({
            url: process.env.MATIC_PROVIDER_URL,
          });
        const globeheadsContract = new ethers.Contract(
          process.env.GLOBEHEADS_CONTRACT_ADDRESS,
          globeHeadsNFTAbi,
          maticProvider,
        );

        const wallet = new ethers.Wallet(
          process.env.MATIC_PRIVATE_KEY,
          maticProvider,
        );
        const walletSigner = wallet.connect(maticProvider);
        const contractAsSigner = await globeheadsContract.connect(walletSigner);

        const editionNumer = nftToTransfer.editionNumber;
        const ethAddress = nftToTransfer.address;
        const fromAddress = process.env.GLOBEHEADS_OWNER_ADDRESS;

        try {
          const transfer = await contractAsSigner.transferFrom(
            fromAddress,
            ethAddress,
            editionNumer,
            {
              gasPrice: 200000000000,
            },
          );

          nftToTransfer.transferred = true;
          nftRepository.save(nftToTransfer);
        } catch (e) {
          console.log('------ ERROR: ------- ' + e);
        }

        console.log(nftToTransfer.editionNumber);
      }
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async updateEtherscanData() {
    if (process.env.APP_INSTANCE_SEQ === '0' || process.env.NODE_ENV == 'DEV') {
      const repository = getRepository(Etherscan);
      const etherscan = new Etherscan();
      etherscan.circulatingSupply = await this.getCirculatingSupply();
      etherscan.id = 1;
      console.log('Etherscan data update');
      repository.save(etherscan);
    }
  }

  async getCirculatingSupply(): Promise<string> {
    const deadAddressBalance = await lastValueFrom(
      this.httpService.get(
        'https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x3402E15b3EA0f1aEC2679c4Be4c6d051ceF93953&address=0x000000000000000000000000000000000000dead&tag=latest&apikey=' +
        this.config.apiKey,
      ),
    );

    const burnAddressBalance = await lastValueFrom(
      this.httpService.get(
        'https://api.etherscan.io/api?module=account&action=tokenbalance&contractaddress=0x3402E15b3EA0f1aEC2679c4Be4c6d051ceF93953&address=0x0000000000000000000000000000000000000000&tag=latest&apikey=' +
        this.config.apiKey,
      ),
    );

    return this.countCirculatingSupply(
      deadAddressBalance,
      burnAddressBalance,
    ).toString();
  }

  async getNumberOfHolders(): Promise<string> {
    const htmlPayload = await lastValueFrom(
      this.httpService.get(
        'https://etherscan.io/token/0x3402e15b3ea0f1aec2679c4be4c6d051cef93953#balances',
      ),
    );

    let holdersNumber = '0';
    const str = 'Holders:';
    const index = htmlPayload.data.indexOf(str);
    const payloadsAfterHoldersTextField = htmlPayload.data.substring(
      index + 50,
      index + 110,
    );

    payloadsAfterHoldersTextField.split('\n').forEach((payload: string) => {
      // If number only, then is the number of holders
      if (/^\d+$/.test(payload)) {
        holdersNumber = payload;
      }
    });

    return holdersNumber;
  }

  countCirculatingSupply(
    deadAddressBalance: AxiosResponse<any>,
    burnAddressBalance: AxiosResponse<any>,
  ) {
    const circulatingSupply = 10000000000000;
    return Math.round(
      circulatingSupply -
      deadAddressBalance.data.result * 0.000000000000000001 -
      burnAddressBalance.data.result * 0.000000000000000001,
    );
  }
}
