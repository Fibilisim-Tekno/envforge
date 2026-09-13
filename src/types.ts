export type ProviderName = 'openai' | 'anthropic' | 'stripe' | 'resend' | 'sendgrid' | 's3';

export interface SynthesizeOptions {
  mockPort?: number;
  mockHost?: string;
  forceOverwrite?: boolean;
}

export interface SynthesizeResult {
  envVars: Map<string, string>;
  detectedProviders: ProviderName[];
  generatedRedirects: Map<string, string>;
  rawOutput: string;
}

export interface MockServerOptions {
  port?: number;
  host?: string;
  quiet?: boolean;
  onIntercept?: (provider: ProviderName, method: string, path: string, status: number) => void;
}

export interface MockServerInstance {
  start(): Promise<number>;
  stop(): Promise<void>;
  getPort(): number;
}
