import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { SessionInfo } from '../interfaces/session-info.interface';
import { EnvVariables } from '../enums/env_variables.emum';
import { PinoLogger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedLoginException } from '../exceptions/unauthorized-login.exception';
import { RedisDb } from '../enums/redis_db.enum';

@Injectable()
export class SessionService {
  private client: any;
  private serverTokenExpiration: number;

  private static readonly SERVICE_NAME = 'SessionService';

  // 10 minutes
  private static readonly TIME_BEFORE_SESSION_EXPIRE_MS = 2101350;

  constructor(
    private configService: ConfigService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(SessionService.name);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    this.serverTokenExpiration = this.configService.get<number>(EnvVariables.TIME_BEFORE_SESSION_EXPIRE_MS) || 
                                 SessionService.TIME_BEFORE_SESSION_EXPIRE_MS;

    const conn = {
        host: this.configService.get<string>(EnvVariables.REDIS_HOST),
        port: Number(this.configService.get<string>(EnvVariables.REDIS_PORT)),
        password: this.configService.get<string>(EnvVariables.REDIS_PASSWORD),
        db: RedisDb.Sessions,
        connectTimeout: 10000,
    }
    this.client = new Redis({
        host: this.configService.get<string>(EnvVariables.REDIS_HOST) || '',
        port: Number(this.configService.get<string>(EnvVariables.REDIS_PORT)) || 6379,
        password: this.configService.get<string>(EnvVariables.REDIS_PASSWORD),
        db: RedisDb.Sessions,
        connectTimeout: 10000,
    });
    this.logger.info(`Session, connecting to redis`);

    this.client.on('connect', () => {
      self.logger.info(`Session redis, connected to redis`);
    });

    this.client.on('error', (err: Error) => {
      if (err.message.indexOf('ECONNREFUSED')) {
        self.logger.warn('Session redis, disconnected');
      } else {
        self.logger.warn(`Session redis, error ${err}`);
      }
    });

    this.client.on('ready', () => {
      self.logger.info('Session redis, ready');
    });
  }

  public async createExternalSession(sessionInfo: SessionInfo, userIp: string, token: string, ttl?: number): Promise<string> {
    await this.client.set(
      token,
      JSON.stringify({ userIp, sessionInfo, id: sessionInfo.userId }),
      'EX',
      ttl ? ttl : this.serverTokenExpiration,
    );
    return token;
  }

  public async createSessionWithToken(sessionInfo: SessionInfo, userIp: string, token: string, ttl?: number): Promise<string> {
    await this.client.set(
      token,
      JSON.stringify({ userIp, sessionInfo, id: sessionInfo.userId }),
      'EX',
      ttl ? ttl : this.serverTokenExpiration,
    );
    return token;
  }

  public async createSession(sessionInfo: SessionInfo, userIp: string, ttl?: number): Promise<string> {
    const token = SessionService.createToken();
    await this.createSessionWithToken(sessionInfo, userIp, token, ttl);
    return token;
  }

  public async getSession(sessionToken: string): Promise<SessionInfo | null> {
    const res = await this.client.get(sessionToken);
    return res ? JSON.parse(res).sessionInfo : null;
  }

  public async updateSession(sessionToken: string, sessionInfo: SessionInfo) {
    const res = await this.client.get(sessionToken);
    if (res) {
      const data = JSON.parse(res);
      data.sessionInfo = sessionInfo;
      await this.client.set(sessionToken, JSON.stringify(data), 'EX', this.serverTokenExpiration);
    } else {
        throw new UnauthorizedLoginException('Admin login failed, missing token!');
    }
  }

  public async killSessionByToken(sessionToken: string): Promise<void> {
    try {
      await this.client.del(sessionToken);
    } catch (err) {
      this.logger.warn(`Session redis,${err}`);
    }
  }

  public async getAllSessions(activeForSec: number): Promise<SessionRecord[]> {
    const keys = await this.client.keys('*');
    const multi = this.client.multi();
    keys.forEach((k: string) => multi.ttl(k));
    const ttls = await multi.exec();
    const result = keys
      .map((k: string, i: number) => ({ key: k, ttl: ttls[i][1] }))
      .filter((item: { key: string; ttl: number }) => {
        return this.serverTokenExpiration - item.ttl <= activeForSec;
      });

    const resultKeys = result.map((item: { key: string; ttl: number }) => item.key);
    const values: string[] = await this.client.mget(resultKeys);
    return values.map((item: string) => JSON.parse(item));
  }

  public static createToken() {
    let t = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 55; i++) {
      t += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return `${t}Z${new Date().getTime().toString(36)}`;
  }

  public async ping(): Promise<boolean> {
    const pingResult = await this.client.ping();
    return pingResult === 'PONG';
  }
}

export interface SessionRecord {
  userIp: string;
  sessionInfo: SessionInfo;
  id: string;
}
