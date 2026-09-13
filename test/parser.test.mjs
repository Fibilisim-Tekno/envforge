import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEnvFile } from '../dist/src/parser/env-parser.js';
import { synthesizeEnvironment } from '../dist/src/parser/synthesizer.js';

test('parseEnvFile handles comments, whitespace, and quoted values', () => {
  const content = `
    # Main Database Config
    DATABASE_URL=postgres://user:pass@localhost:5432/mydb
    
    # OpenAI & AI Settings
    OPENAI_API_KEY="sk-proj-placeholder"
    EMPTY_VAR=
    SPACED_KEY = 'single-quoted-val'
  `;

  const parsed = parseEnvFile(content);

  assert.equal(parsed.get('DATABASE_URL'), 'postgres://user:pass@localhost:5432/mydb');
  assert.equal(parsed.get('OPENAI_API_KEY'), 'sk-proj-placeholder');
  assert.equal(parsed.get('EMPTY_VAR'), '');
  assert.equal(parsed.get('SPACED_KEY'), 'single-quoted-val');
});

test('synthesizeEnvironment produces valid dummy tokens and redirects for recognized services', () => {
  const input = new Map([
    ['OPENAI_API_KEY', 'your-key-here'],
    ['ANTHROPIC_API_KEY', ''],
    ['STRIPE_SECRET_KEY', 'sk_live_xxx'],
    ['RESEND_API_KEY', ''],
    ['JWT_SECRET', 'secret'],
    ['CUSTOM_APP_NAME', 'MyCoolApp']
  ]);

  const result = synthesizeEnvironment(input, { mockPort: 9999 });

  // OpenAI synthesis
  assert.match(result.envVars.get('OPENAI_API_KEY'), /^sk-proj-envforge-/);
  assert.equal(result.envVars.get('OPENAI_BASE_URL'), 'http://localhost:9999/v1');

  // Anthropic synthesis
  assert.match(result.envVars.get('ANTHROPIC_API_KEY'), /^sk-ant-envforge-/);
  assert.equal(result.envVars.get('ANTHROPIC_BASE_URL'), 'http://localhost:9999');

  // Stripe synthesis
  assert.match(result.envVars.get('STRIPE_SECRET_KEY'), /^sk_test_envforge_/);
  assert.equal(result.envVars.get('STRIPE_BASE_URL'), 'http://localhost:9999');

  // Resend synthesis
  assert.match(result.envVars.get('RESEND_API_KEY'), /^re_envforge_/);
  assert.equal(result.envVars.get('RESEND_BASE_URL'), 'http://localhost:9999');

  // Secrets & Custom
  assert.equal(result.envVars.get('JWT_SECRET').length, 64);
  assert.equal(result.envVars.get('CUSTOM_APP_NAME'), 'MyCoolApp');

  // Provider summary
  assert.ok(result.detectedProviders.includes('openai'));
  assert.ok(result.detectedProviders.includes('anthropic'));
  assert.ok(result.detectedProviders.includes('stripe'));
  assert.ok(result.detectedProviders.includes('resend'));
});
