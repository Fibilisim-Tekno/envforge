import http from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { MockServerInstance, MockServerOptions, ProviderName } from '../types.js';
import { handleOpenAIRequest } from './responders/openai.js';
import { handleAnthropicRequest } from './responders/anthropic.js';
import { handleStripeRequest } from './responders/stripe.js';
import { handleEmailRequest } from './responders/email.js';

export function createMockServer(options: MockServerOptions = {}): MockServerInstance {
  const desiredPort = options.port ?? 9999;
  const host = options.host ?? 'localhost';
  let actualPort = desiredPort;
  let server: http.Server | null = null;

  const serverInstance: MockServerInstance = {
    start(): Promise<number> {
      return new Promise((resolve, reject) => {
        server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
          // Set universal CORS headers so frontends can call mock endpoints directly
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', '*');

          if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
          }

          const rawUrl = req.url || '/';
          const [pathname] = rawUrl.split('?');

          // Health Check & Root Dashboard Info
          if (pathname === '/health' || pathname === '/') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                status: 'ok',
                service: 'envforge',
                version: '0.1.0',
                uptime: process.uptime()
              })
            );
            return;
          }

          // Accumulate body chunks
          const chunks: Buffer[] = [];
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => {
            const bodyText = Buffer.concat(chunks).toString('utf-8');
            const origin = `http://${host}:${actualPort}`;

            let matchedProvider: ProviderName | null = null;

            // 1. Dispatch to OpenAI
            if (handleOpenAIRequest(req, res, pathname, bodyText)) {
              matchedProvider = 'openai';
            }
            // 2. Dispatch to Anthropic
            else if (handleAnthropicRequest(req, res, pathname, bodyText)) {
              matchedProvider = 'anthropic';
            }
            // 3. Dispatch to Stripe
            else if (handleStripeRequest(req, res, pathname, bodyText, origin)) {
              matchedProvider = 'stripe';
            }
            // 4. Dispatch to Email
            else if (handleEmailRequest(req, res, pathname, bodyText)) {
              matchedProvider = 'resend';
            }
            // Fallback: 404
            else {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  error: 'Endpoint not simulated in EnvForge',
                  pathname,
                  method: req.method
                })
              );
            }

            if (matchedProvider && options.onIntercept) {
              options.onIntercept(matchedProvider, req.method || 'GET', pathname, res.statusCode || 200);
            }
          });
        });

        server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE' && desiredPort === 9999) {
            // Try fallback port
            console.warn(`[EnvForge] Port ${desiredPort} in use, attempting fallback...`);
            server?.listen(0, host, () => {
              const addr = server?.address();
              if (addr && typeof addr === 'object') {
                actualPort = addr.port;
                resolve(actualPort);
              }
            });
          } else {
            reject(err);
          }
        });

        server.listen(desiredPort, host, () => {
          const addr = server?.address();
          if (addr && typeof addr === 'object') {
            actualPort = addr.port;
          }
          resolve(actualPort);
        });
      });
    },

    stop(): Promise<void> {
      return new Promise((resolve) => {
        if (server) {
          server.close(() => resolve());
        } else {
          resolve();
        }
      });
    },

    getPort(): number {
      return actualPort;
    }
  };

  return serverInstance;
}
