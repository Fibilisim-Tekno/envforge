import fs from 'node:fs';
import path from 'node:path';
import { parseEnvFile } from '../parser/env-parser.js';
import { synthesizeEnvironment } from '../parser/synthesizer.js';
import { createMockServer } from '../server/mock-server.js';
import { printBanner, printServiceMatrix, logIntercept } from './logger.js';

export async function runCli(args: string[] = []): Promise<void> {
  const isInitOnly = args.includes('init');
  const isHelp = args.includes('--help') || args.includes('-h');
  const cwd = process.cwd();

  if (isHelp) {
    printBanner();
    console.log(`
Usage:
  npx envforge             Synthesize .env.local and launch local mock engine
  npx envforge init        Synthesize .env.local only without running mock server
  npx envforge --help      Show this help reference

Features:
  - Parses .env.example / .env.sample automatically
  - Generates realistic dummy tokens (OpenAI, Anthropic, Stripe, Resend)
  - Intercepts requests locally on port 9999 without external network calls
`);
    return;
  }

  printBanner();

  // Find source env template
  const candidates = ['.env.example', '.env.sample', '.env.template', '.env.local.example', '.env'];
  let templatePath: string | null = null;

  for (const candidate of candidates) {
    const fullPath = path.join(cwd, candidate);
    if (fs.existsSync(fullPath)) {
      templatePath = fullPath;
      break;
    }
  }

  let parsed = new Map<string, string>();
  if (templatePath) {
    console.log(`🔍 Found template: \x1b[36m${path.basename(templatePath)}\x1b[0m`);
    const content = fs.readFileSync(templatePath, 'utf-8');
    parsed = parseEnvFile(content);
  } else {
    console.log(`⚠️  No .env.example found. Generating standard SaaS fallback environment...`);
    parsed = new Map([
      ['OPENAI_API_KEY', ''],
      ['STRIPE_SECRET_KEY', ''],
      ['RESEND_API_KEY', ''],
      ['DATABASE_URL', 'file:./dev.db']
    ]);
  }

  const mockPort = 9999;
  const synth = synthesizeEnvironment(parsed, { mockPort });

  // Write .env.local
  const targetEnvLocal = path.join(cwd, '.env.local');
  fs.writeFileSync(targetEnvLocal, synth.rawOutput, 'utf-8');
  console.log(`⚡ Created \x1b[32m.env.local\x1b[0m with synthesized credentials.`);
  console.log('');

  printServiceMatrix(synth.detectedProviders, mockPort);

  if (isInitOnly) {
    console.log(`✅ Initialization complete. Run \x1b[36mnpx envforge\x1b[0m whenever you want to start the mock engine.`);
    return;
  }

  // Start Mock Server
  const server = createMockServer({
    port: mockPort,
    onIntercept: (provider, method, reqPath, status) => {
      logIntercept(provider, method, reqPath, status);
    }
  });

  const actualPort = await server.start();
  console.log(`🚀 EnvForge Mock Engine listening on \x1b[36mhttp://localhost:${actualPort}\x1b[0m`);
  console.log(`💡 You can now run your app (\x1b[33mnpm run dev\x1b[0m) — all external SaaS calls are safely intercepted!`);
  console.log(`\x1b[90m(Press Ctrl+C to stop mock engine)\x1b[0m\n`);

  // Handle clean exit
  const shutdown = async () => {
    console.log(`\n🛑 Stopping EnvForge mock engine...`);
    await server.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
