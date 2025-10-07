import { Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { CryptoService } from "./crypto.service";
import { ServerToServerSessionInfoDto } from "@medorion/types";
import { PinoLogger } from "nestjs-pino";
import { Utils } from "./utils";
import { ConfigService } from "@nestjs/config";
import { EnvVariables } from "../enums/env_variables.emum";
import { RedisDb } from "../enums/redis_db.enum";
import Redis from "ioredis";

@Injectable()
export class ServerToServerAuthService {
  private static readonly VALID_SESSION_REGEX = /^([a-zA-Z0-9]){64}$/;

  private client: any;
  private serverTokenExpiration: number;

  // 10 minutes
  private static readonly TIME_BEFORE_SESSION_EXPIRE_MS = 2101350;

  constructor(
    private readonly cryptoService: CryptoService,
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger
  ) {
    this.logger.setContext(ServerToServerAuthService.name);
    const self = this;
    this.serverTokenExpiration =
      this.configService.get<number>(
        EnvVariables.TIME_BEFORE_SESSION_EXPIRE_MS
      ) || ServerToServerAuthService.TIME_BEFORE_SESSION_EXPIRE_MS;

    const conn = {
      host: this.configService.get<string>(EnvVariables.REDIS_HOST),
      port: Number(this.configService.get<string>(EnvVariables.REDIS_PORT)),
      password: this.configService.get<string>(EnvVariables.REDIS_PASSWORD),
      db: RedisDb.ServerToServerSessions,
      connectTimeout: 10000,
    };
    this.client = new Redis({
      host: this.configService.get<string>(EnvVariables.REDIS_HOST) || "",
      port:
        Number(this.configService.get<string>(EnvVariables.REDIS_PORT)) || 6379,
      password: this.configService.get<string>(EnvVariables.REDIS_PASSWORD),
      db: RedisDb.Sessions,
      connectTimeout: 10000,
    });
    this.logger.info(`Session, connecting to redis`);

    this.client.on("connect", () => {
      self.logger.info(`Session redis, connected to redis`);
    });

    this.client.on("error", (err: Error) => {
      if (err.message.indexOf("ECONNREFUSED")) {
        self.logger.warn("Session redis, disconnected");
      } else {
        self.logger.warn(`Session redis, error ${err}`);
      }
    });

    this.client.on("ready", () => {
      self.logger.info("Session redis, ready");
    });
  }

  public async validateToken(
    request: Request
  ): Promise<ServerToServerSessionInfoDto> {
    const token: string = request.headers["authorization"] as string;

    const secretProof: string = request.headers["secretproof"] as string;
    if (!token || !secretProof) {
      throw new UnauthorizedException("Unauthorized");
    }
    const sessionInfo = await this.getSession(token);
    if (!sessionInfo) {
      throw new UnauthorizedException("Token is invalid or expired");
    }
    const hash = this.cryptoService.crateSHA256(token, sessionInfo.orgSecret);
    if (!this.cryptoService.timingSafeEqual(hash, secretProof)) {
      throw new UnauthorizedException("Unauthorized");
    }
    return sessionInfo;
  }

  public async createSession(
    orgId: string,
    orgCode: string,
    orgSecret: string,
    userIp: string,
    ttl?: number
  ): Promise<string | null> {
    const sessionInfo: ServerToServerSessionInfoDto = {
      orgId,
      orgCode,
      orgSecret,
      createdAt: new Date().getTime(),
      expiresAt: new Date().getTime(),
      serverVersion: "", // TODO
    };
    const token = Utils.createToken();
    await this.client.set(
      token,
      JSON.stringify({ userIp, sessionInfo, id: sessionInfo.orgCode }),
      "EX",
      ttl ? ttl : this.serverTokenExpiration
    );
    return token;
  }

  public async getSession(
    sessionToken: string
  ): Promise<ServerToServerSessionInfoDto | null> {
    const res = await this.client.get(sessionToken);
    if (res) {
      const ttl = await this.client.ttl(sessionToken);
      const expireIn =
        ttl && !isNaN(ttl) && Number(ttl) > this.serverTokenExpiration
          ? Number(ttl)
          : this.serverTokenExpiration;
      await this.client.expire(sessionToken, expireIn);
      const sessionInfo: ServerToServerSessionInfoDto =
        JSON.parse(res).sessionInfo;
      return sessionInfo;
    }
    return null;
  }
}
