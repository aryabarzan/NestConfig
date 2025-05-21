import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class Config {
  public readonly CLIENT_ID: string;
  public readonly CLIENT_SECRET: string;
  public readonly JWT_SECRET: string;
  public readonly AUTH_CALL_BACK_URL: string;

  public readonly LOCK_DURATION_MS: number;

  constructor(private readonly configService: ConfigService) {
    this.CLIENT_ID = this.configService.getOrThrow('CLIENT_ID');

    this.CLIENT_SECRET = this.configService.getOrThrow('CLIENT_SECRET');

    this.AUTH_CALL_BACK_URL =
      this.configService.getOrThrow('AUTH_CALL_BACK_URL');

    this.JWT_SECRET = this.configService.getOrThrow('JWT_SECRET');
  }
}
