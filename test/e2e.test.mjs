import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseEnvFile } from '../dist/src/parser/env-parser.js';
import { synthesizeEnvironment } from '../dist/src/parser/synthesizer.js';

test('E2E: Full synthesis cycle generates expected .env.local file content', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'envforge-e2e-'));
  const examplePath = path.join(tmpDir, '.env.example');
  const targetPath = path.join(tmpDir, '.env.local');

  fs.writeFileSync(
    examplePath,
    `
      OPENAI_API_KEY=your_openai_key
      STRIPE_SECRET_KEY=sk_test_placeholder
      RESEND_API_KEY=re_placeholder
      NEXTAUTH_SECRET=supersecret
      DATABASE_URL=postgres://user:pass@remote:5432/db
    `
  );

  const raw = fs.readFileSync(examplePath, 'utf-8');
  const parsed = parseEnvFile(raw);
  const synth = synthesizeEnvironment(parsed, { mockPort: 9999 });

  fs.writeFileSync(targetPath, synth.rawOutput, 'utf-8');

  assert.ok(fs.existsSync(targetPath));
  const written = fs.readFileSync(targetPath, 'utf-8');

  assert.ok(written.includes('OPENAI_BASE_URL=http://localhost:9999/v1'));
  assert.ok(written.includes('STRIPE_BASE_URL=http://localhost:9999'));
  assert.ok(written.includes('RESEND_BASE_URL=http://localhost:9999'));
  assert.ok(written.includes('DATABASE_URL=postgres://user:pass@remote:5432/db'));

  // Clean up
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
