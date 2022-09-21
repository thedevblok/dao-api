import { registerAs } from '@nestjs/config';

export default registerAs('discord', () => ({
  id: process.env.DISCORD_ID,
  token: process.env.DISCORD_TOKEN,
}));
