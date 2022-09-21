import { registerAs } from '@nestjs/config';

export default registerAs('etherscan', () => ({
  apiKey: process.env.ETHERSCAN_API_KEY,
}));
