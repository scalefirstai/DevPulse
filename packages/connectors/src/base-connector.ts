import {
  BaseConnectorInterface,
  ConnectorOptions,
  ConnectorResult,
  DEFAULT_CONNECTOR_OPTIONS,
} from '@devpulse/core';

export abstract class BaseConnector<TRaw = unknown, TTransformed = unknown>
  implements BaseConnectorInterface<TRaw, TTransformed>
{
  abstract readonly name: string;
  abstract readonly type: string;

  protected options: ConnectorOptions;
  private requestTimestamps: number[] = [];

  constructor(options?: Partial<ConnectorOptions>) {
    this.options = { ...DEFAULT_CONNECTOR_OPTIONS, ...options };
  }

  abstract collect(): Promise<TRaw[]>;
  abstract transform(raw: TRaw[]): TTransformed[];
  abstract validate(data: TTransformed[]): boolean;

  async run(): Promise<ConnectorResult<TTransformed>> {
    const errors: string[] = [];
    let data: TTransformed[] = [];

    try {
      const raw = await this.withRetry(() => this.collect());
      data = this.transform(raw);

      if (!this.validate(data)) {
        errors.push(`Validation failed for connector ${this.name}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Connector ${this.name} failed: ${message}`);
      this.log('error', message);
    }

    return {
      data,
      metadata: {
        source: this.name,
        collectedAt: new Date(),
        recordCount: data.length,
        errors,
      },
    };
  }

  protected async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.options.maxRetries; attempt++) {
      try {
        await this.enforceRateLimit();
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.options.maxRetries) {
          const delay = this.options.retryDelayMs * Math.pow(2, attempt) * (0.5 + Math.random());
          this.log('warn', `Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  protected async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const windowMs = 1000;
    this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < windowMs);

    if (this.requestTimestamps.length >= this.options.rateLimitPerSecond) {
      const oldestInWindow = this.requestTimestamps[0];
      const waitMs = windowMs - (now - oldestInWindow);
      if (waitMs > 0) {
        await this.sleep(waitMs);
      }
    }

    this.requestTimestamps.push(Date.now());
  }

  protected checkRateLimitHeaders(headers: Record<string, string>): void {
    const remaining = headers['x-ratelimit-remaining'];
    if (remaining !== undefined && parseInt(remaining, 10) <= 0) {
      const resetAt = headers['x-ratelimit-reset'];
      if (resetAt) {
        const resetMs = parseInt(resetAt, 10) * 1000 - Date.now();
        if (resetMs > 0) {
          this.log('warn', `Rate limit exhausted. Waiting ${Math.round(resetMs / 1000)}s...`);
        }
      }
    }
  }

  protected log(level: 'info' | 'warn' | 'error', message: string): void {
    const prefix = `[${this.name}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message);
        break;
      case 'warn':
        console.warn(prefix, message);
        break;
      case 'error':
        console.error(prefix, message);
        break;
    }
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
