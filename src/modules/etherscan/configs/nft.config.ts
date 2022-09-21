import { registerAs } from '@nestjs/config';

export default registerAs('nft', () => ({
  maticProvider: {
    url: process.env.MATIC_PROVIDER_URL,
    chainId: process.env.MATIC_CHAIN_ID,
    privateKey: process.env.MATIC_PRIVATE_KEY
  },
  contractAddress: {
    globeheads: process.env.GLOBEHEADS_CONTRACT_ADDRESS
  },
}));
