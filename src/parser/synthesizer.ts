import crypto from 'node:crypto';
import type { ProviderName, SynthesizeOptions, SynthesizeResult } from '../types.js';

/**
 * Inspects parsed environment keys, detects recognized SaaS services,
 * generates realistic synthetic dummy tokens, and establishes redirect URLs
 * pointing to the local EnvForge mock server.
 */
export function synthesizeEnvironment(
  parsedEnv: Map<string, string>,
  options: SynthesizeOptions = {}
): SynthesizeResult {
  const mockPort = options.mockPort ?? 9999;
  const mockHost = options.mockHost ?? 'localhost';
  const mockOrigin = `http://${mockHost}:${mockPort}`;

  const resultEnv = new Map<string, string>();
  const detectedProviders = new Set<ProviderName>();
  const generatedRedirects = new Map<string, string>();

  // Helper to safely synthesize an identifier
  const uid = () => crypto.randomBytes(6).toString('hex');
  const secretHex = () => crypto.randomBytes(32).toString('hex');

  for (const [key, originalValue] of parsedEnv.entries()) {
    const upperKey = key.toUpperCase();

    // 1. OpenAI Detection
    if (upperKey.includes('OPENAI_API_KEY') || upperKey === 'OPENAI_KEY') {
      resultEnv.set(key, `sk-proj-envforge-${uid()}`);
      detectedProviders.add('openai');
      continue;
    }

    // 2. Anthropic Detection
    if (upperKey.includes('ANTHROPIC_API_KEY') || upperKey.includes('CLAUDE_API_KEY')) {
      resultEnv.set(key, `sk-ant-envforge-${uid()}`);
      detectedProviders.add('anthropic');
      continue;
    }

    // 3. Stripe Detection
    if (upperKey.includes('STRIPE_SECRET_KEY') || upperKey.includes('STRIPE_API_KEY')) {
      resultEnv.set(key, `sk_test_envforge_${uid()}`);
      detectedProviders.add('stripe');
      continue;
    }
    if (upperKey.includes('STRIPE_PUBLISHABLE_KEY') || upperKey.includes('NEXT_PUBLIC_STRIPE_KEY')) {
      resultEnv.set(key, `pk_test_envforge_${uid()}`);
      detectedProviders.add('stripe');
      continue;
    }
    if (upperKey.includes('STRIPE_WEBHOOK_SECRET')) {
      resultEnv.set(key, `whsec_envforge_${uid()}`);
      detectedProviders.add('stripe');
      continue;
    }

    // 4. Resend Detection
    if (upperKey.includes('RESEND_API_KEY')) {
      resultEnv.set(key, `re_envforge_${uid()}`);
      detectedProviders.add('resend');
      continue;
    }

    // 5. SendGrid Detection
    if (upperKey.includes('SENDGRID_API_KEY')) {
      resultEnv.set(key, `SG.envforge.${uid()}`);
      detectedProviders.add('sendgrid');
      continue;
    }

    // 6. AWS / S3 Detection
    if (upperKey === 'AWS_ACCESS_KEY_ID') {
      resultEnv.set(key, `AKIA_ENVFORGE_${uid().toUpperCase()}`);
      detectedProviders.add('s3');
      continue;
    }
    if (upperKey === 'AWS_SECRET_ACCESS_KEY') {
      resultEnv.set(key, `envforge_secret_${secretHex()}`);
      detectedProviders.add('s3');
      continue;
    }

    // 7. Generic JWT / NextAuth / Secret keys
    if (
      upperKey.includes('SECRET') ||
      upperKey.includes('JWT') ||
      upperKey.includes('AUTH_SECRET') ||
      upperKey.includes('COOKIE_KEY')
    ) {
      resultEnv.set(key, secretHex());
      continue;
    }

    // 8. Database Fallback (if completely empty or points to remote)
    if (upperKey.includes('DATABASE_URL') || upperKey.includes('POSTGRES_URL')) {
      if (!originalValue || originalValue.includes('placeholder') || originalValue.includes('your-')) {
        resultEnv.set(key, 'file:./dev.db');
      } else {
        resultEnv.set(key, originalValue);
      }
      continue;
    }

    // Default: keep existing non-empty value or supply a dummy value
    if (originalValue && !originalValue.includes('your-') && !originalValue.includes('placeholder')) {
      resultEnv.set(key, originalValue);
    } else {
      resultEnv.set(key, originalValue || `envforge_val_${uid()}`);
    }
  }

  // Inject Localhost Base URL Overrides for Detected Services
  if (detectedProviders.has('openai')) {
    const baseKey = 'OPENAI_BASE_URL';
    const baseVal = `${mockOrigin}/v1`;
    resultEnv.set(baseKey, baseVal);
    generatedRedirects.set(baseKey, baseVal);
  }

  if (detectedProviders.has('anthropic')) {
    const baseKey = 'ANTHROPIC_BASE_URL';
    const baseVal = mockOrigin;
    resultEnv.set(baseKey, baseVal);
    generatedRedirects.set(baseKey, baseVal);
  }

  if (detectedProviders.has('stripe')) {
    const baseKey = 'STRIPE_BASE_URL';
    const baseVal = mockOrigin;
    resultEnv.set(baseKey, baseVal);
    generatedRedirects.set(baseKey, baseVal);
  }

  if (detectedProviders.has('resend')) {
    const baseKey = 'RESEND_BASE_URL';
    const baseVal = mockOrigin;
    resultEnv.set(baseKey, baseVal);
    generatedRedirects.set(baseKey, baseVal);
  }

  // Build raw .env.local string
  const lines: string[] = [
    '# =========================================================',
    '# Generated automatically by EnvForge (https://github.com/Fibilisim-Tekno/envforge)',
    '# All external SaaS services redirected to local mock engine',
    `# Mock Engine: ${mockOrigin}`,
    '# =========================================================',
    ''
  ];

  for (const [k, v] of resultEnv.entries()) {
    lines.push(`${k}=${v}`);
  }

  return {
    envVars: resultEnv,
    detectedProviders: Array.from(detectedProviders),
    generatedRedirects,
    rawOutput: lines.join('\n') + '\n'
  };
}
