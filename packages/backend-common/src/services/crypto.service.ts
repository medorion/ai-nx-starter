import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";

@Injectable()
export class CryptoService {
  public createHash(input: string): string {
    return crypto.createHash("md5").update(input).digest("hex");
  }

  public crateSHA256(value: string, secret: string): string {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(value)
      .digest("hex");
    return hash;
  }

  public timingSafeEqual(first: string, second: string): boolean {
    if (!first || !second || first.length !== second.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(first), Buffer.from(second));
  }
}
