// src/app/services/fingerprint.service.ts
import { Injectable } from "@angular/core";
import FingerprintJS, { Agent, GetResult } from "@fingerprintjs/fingerprintjs";

@Injectable({
  providedIn: "root",
})
export class FingerprintService {
  private fpPromise: Promise<Agent>;

  constructor() {
    // Initialize the agent at app startup.
    this.fpPromise = FingerprintJS.load();
  }

  async getFingerprint(): Promise<GetResult> {
    // Get the visitor identifier when you need it.
    const fp = await this.fpPromise;
    return fp.get();
  }
}
