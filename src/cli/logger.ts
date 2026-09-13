import type { ProviderName } from '../types.js';

// ANSI colors for clean zero-dependency terminal styling
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

export function printBanner(version = '0.1.0'): void {
  console.log(`
${c.cyan}${c.bold}  ███████╗███╗   ██╗██╗   ██╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔════╝████╗  ██║██║   ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  █████╗  ██╔██╗ ██║██║   ██║█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ███████╗██║ ╚████║ ╚████╔╝ ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝${c.reset}
  ${c.dim}Zero-Config SaaS Mock Engine & Environment Synthesizer • v${version}${c.reset}
  ${c.gray}https://github.com/Fibilisim-Tekno/envforge${c.reset}
`);
}

export function printServiceMatrix(detected: ProviderName[], mockPort: number): void {
  console.log(`${c.bold}📦 Detected SaaS Services:${c.reset}`);

  if (detected.length === 0) {
    console.log(`  ${c.yellow}No specific SaaS signatures recognized. Standard fallback values generated.${c.reset}`);
  } else {
    for (const provider of detected) {
      const tag = provider.toUpperCase().padEnd(10, ' ');
      console.log(`  ${c.green}✓${c.reset} ${c.bold}${tag}${c.reset} ${c.dim}→ Mocked at http://localhost:${mockPort}${c.reset}`);
    }
  }
  console.log('');
}

export function logIntercept(provider: ProviderName, method: string, path: string, status: number): void {
  const time = new Date().toLocaleTimeString();
  const statusColor = status >= 400 ? c.yellow : c.green;
  console.log(
    `  ${c.gray}[${time}]${c.reset} ${c.magenta}[${provider.toUpperCase()}]${c.reset} ${c.bold}${method}${c.reset} ${path} ${statusColor}${status} OK${c.reset}`
  );
}
