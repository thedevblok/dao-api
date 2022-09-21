import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { Command, Console } from 'nestjs-console';
import { getRepository } from 'typeorm';

import { Nft } from '../entities/nft.entity';
import { globeHeadsNFTAbi } from '../globeHeadsNFTAbi.json';

@Console({
  command: 'nft',
  description: 'CLI Commands for nft module',
})
export class NftCommands {
  constructor() {}

  @Command({
    command: 'transfer-globeheads',
    description: '',
  })
  async transferGlobeheads(): Promise<void> {
    const maticProvider: JsonRpcProvider = new ethers.providers.JsonRpcProvider({
      url: process.env.MATIC_PROVIDER_URL,
    });
    const globeheadsContract = new ethers.Contract(
        process.env.GLOBEHEADS_CONTRACT_ADDRESS,
        globeHeadsNFTAbi,
        maticProvider,
    );

    const wallet = new ethers.Wallet(process.env.MATIC_PRIVATE_KEY, maticProvider);
    let walletSigner = wallet.connect(maticProvider)
    const contractAsSigner = await globeheadsContract.connect(walletSigner);

    const nftRepository = getRepository(Nft);

    const nftsToTransfer = nftRepository.find({
      where: {
        'minted': true,
        'transferred': false
      },
      take: 1
    })

    let nftToTransfer = nftsToTransfer[0]

    console.log(nftToTransfer)
  }
}
