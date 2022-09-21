import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import discordConfig from '../configs/discord.config';

@Injectable()
export class EtherscanInterceptor implements NestInterceptor {
  private discord: any;
  private webhookClient: any;
  private embed: any;

  constructor(
    @Inject(discordConfig.KEY)
    config: ConfigType<typeof discordConfig>,
  ) {
    this.discord = require('discord.js');
    this.webhookClient = new this.discord.WebhookClient(
      config.id,
      config.token,
    );
    this.embed = new this.discord.MessageEmbed().setColor('#ff0000');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(
        catchError((err) =>
          this.webhookClient.send(err, { embeds: [this.embed] }),
        ),
      );
  }
}
