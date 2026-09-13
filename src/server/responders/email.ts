import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

export function handleEmailRequest(req: IncomingMessage, res: ServerResponse, pathname: string, _bodyText: string): boolean {
  // 1. Resend: POST /emails
  if (pathname === '/emails' && req.method === 'POST') {
    const id = `msg_envforge_${crypto.randomBytes(8).toString('hex')}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, from: 'mock@envforge.dev', to: 'recipient@example.com' }));
    return true;
  }

  // 2. SendGrid: POST /v3/mail/send
  if (pathname === '/v3/mail/send' && req.method === 'POST') {
    res.writeHead(202, {
      'Content-Type': 'application/json',
      'X-Message-Id': `sg_envforge_${crypto.randomBytes(8).toString('hex')}`
    });
    res.end(JSON.stringify({ status: 'queued' }));
    return true;
  }

  return false;
}
