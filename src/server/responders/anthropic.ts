import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

export function handleAnthropicRequest(req: IncomingMessage, res: ServerResponse, pathname: string, bodyText: string): boolean {
  if (pathname === '/v1/messages' && req.method === 'POST') {
    let parsedBody: any = {};
    try {
      parsedBody = JSON.parse(bodyText || '{}');
    } catch {
      // Fallback
    }

    const model = parsedBody.model || 'claude-3-5-sonnet-20241022';
    const id = `msg_envforge_${crypto.randomBytes(6).toString('hex')}`;

    const responsePayload = {
      id,
      type: 'message',
      role: 'assistant',
      model,
      content: [
        {
          type: 'text',
          text: 'Hello from EnvForge! Anthropic Claude endpoint simulated successfully.'
        }
      ],
      stop_reason: 'end_turn',
      stop_sequence: null,
      usage: {
        input_tokens: 15,
        output_tokens: 22
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responsePayload));
    return true;
  }

  return false;
}
