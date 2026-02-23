export interface ConnectorResult<T = unknown> {
  data: T[];
  metadata: {
    source: string;
    collectedAt: Date;
    recordCount: number;
    errors: string[];
  };
}

export interface BaseConnectorInterface<TRaw = unknown, TTransformed = unknown> {
  readonly name: string;
  readonly type: string;

  collect(): Promise<TRaw[]>;
  transform(raw: TRaw[]): TTransformed[];
  validate(data: TTransformed[]): boolean;
  run(): Promise<ConnectorResult<TTransformed>>;
}

export interface ConnectorOptions {
  maxRetries: number;
  retryDelayMs: number;
  rateLimitPerSecond: number;
  timeoutMs: number;
}

export const DEFAULT_CONNECTOR_OPTIONS: ConnectorOptions = {
  maxRetries: 3,
  retryDelayMs: 1000,
  rateLimitPerSecond: 10,
  timeoutMs: 30000,
};
