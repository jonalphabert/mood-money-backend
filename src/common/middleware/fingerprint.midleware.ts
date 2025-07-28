import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class FingerprintMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const deviceId = req.headers['x-device-id'] as string;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;

    req['fingerprint'] = createHash('sha256')
      .update(`${userAgent}|${ip}|${deviceId}`)
      .digest('hex');

    next();
  }
}
