import { Injectable, HttpStatus, HttpException, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class EtherscanMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: Function) {
    next();
  }
}

