/**
 * Example custom connector for DevPulse.
 *
 * This demonstrates how to create a connector that integrates
 * a custom data source with DevPulse.
 */
import { BaseConnector } from '@devpulse/connectors';
import { ConnectorOptions } from '@devpulse/core';

// Define the raw data shape from your API
interface MyApiRecord {
  id: string;
  metric_name: string;
  metric_value: number;
  timestamp: string;
}

// Define the transformed shape for DevPulse
interface TransformedMetric {
  name: string;
  value: number;
  collectedAt: Date;
}

interface ExampleConfig {
  apiUrl: string;
  apiKey: string;
}

export class ExampleConnector extends BaseConnector<MyApiRecord, TransformedMetric> {
  readonly name = 'example-connector';
  readonly type = 'custom';

  private config: ExampleConfig;

  constructor(config: ExampleConfig, options?: Partial<ConnectorOptions>) {
    super(options);
    this.config = config;
  }

  /**
   * Fetch raw data from your API.
   * The base class provides retry and rate limiting automatically.
   */
  async collect(): Promise<MyApiRecord[]> {
    const response = await fetch(`${this.config.apiUrl}/metrics`, {
      headers: { Authorization: `Bearer ${this.config.apiKey}` },
      signal: AbortSignal.timeout(this.options.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }

    // Check rate limit headers from the response
    const headers: Record<string, string> = {};
    response.headers.forEach((v, k) => { headers[k] = v; });
    this.checkRateLimitHeaders(headers);

    return response.json();
  }

  /**
   * Transform raw API data into the shape DevPulse expects.
   */
  transform(raw: MyApiRecord[]): TransformedMetric[] {
    return raw.map((record) => ({
      name: record.metric_name,
      value: record.metric_value,
      collectedAt: new Date(record.timestamp),
    }));
  }

  /**
   * Validate that transformed data meets quality requirements.
   */
  validate(data: TransformedMetric[]): boolean {
    return data.every(
      (item) =>
        item.name.length > 0 &&
        !isNaN(item.value) &&
        item.collectedAt instanceof Date,
    );
  }
}

// Usage:
// const connector = new ExampleConnector({
//   apiUrl: 'https://api.example.com',
//   apiKey: process.env.EXAMPLE_API_KEY!,
// });
// const result = await connector.run();
// console.log(result.data); // TransformedMetric[]
