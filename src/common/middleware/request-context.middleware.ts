import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

export interface RequestInfo {
  correlationId: string;
  path: string;
  wallet: string;
  userAgent: string;
}

@Injectable()
export class RequestContextMiddleWare implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const correlationHeader: any = req.headers['x-correlation-id'] || uuidv4();
    // make sure this is lower-cased, otherwise downstream stuff will barf.
    req.rawHeaders['x-correlation-id'] = correlationHeader;
    res.setHeader('X-Correlation-Id', correlationHeader);

    const requestInfo: RequestInfo = {
      correlationId: correlationHeader,
      path: req.baseUrl,
      userAgent: req.headers['user-agent'],
      wallet: req.headers['wallet'] as string,
    };

    this.cls.set('requestInfo', requestInfo);

    next();
  }
}
