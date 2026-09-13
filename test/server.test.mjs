import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockServer } from '../dist/src/server/mock-server.js';

let server;
let port;
let baseUrl;

test.before(async () => {
  server = createMockServer({ port: 0, quiet: true });
  await server.start();
  port = server.getPort();
  baseUrl = `http://localhost:${port}`;
});

test.after(async () => {
  if (server) {
    await server.stop();
  }
});

test('GET /health returns 200 and active status', async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'ok');
  assert.equal(data.service, 'envforge');
});

test('POST /v1/chat/completions returns valid OpenAI response format', async () => {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: 'Hello' }]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.object, 'chat.completion');
  assert.ok(data.id.startsWith('chatcmpl-envforge-'));
  assert.equal(data.choices[0].message.role, 'assistant');
  assert.ok(data.choices[0].message.content.length > 0);
  assert.equal(data.usage.total_tokens, 42);
});

test('GET /v1/models returns OpenAI model catalog', async () => {
  const res = await fetch(`${baseUrl}/v1/models`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.object, 'list');
  assert.ok(data.data.some((m) => m.id === 'gpt-4o'));
});

test('POST /v1/messages returns valid Anthropic response format', async () => {
  const res = await fetch(`${baseUrl}/v1/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: 'Hello Claude' }]
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.type, 'message');
  assert.equal(data.role, 'assistant');
  assert.ok(data.content[0].text.length > 0);
});

test('POST /v1/checkout/sessions returns valid Stripe checkout session', async () => {
  const res = await fetch(`${baseUrl}/v1/checkout/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'success_url=http%3A%2F%2Flocalhost%3A3000%2Fsuccess&line_items%5B0%5D%5Bprice%5D=price_123'
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.id.startsWith('cs_test_envforge_'));
  assert.equal(data.object, 'checkout.session');
  assert.ok(data.url.includes('/stripe/mock-checkout'));
});

test('POST /emails returns valid Resend message delivery response', async () => {
  const res = await fetch(`${baseUrl}/emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'user@example.com',
      subject: 'Test Email'
    })
  });

  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.id.startsWith('msg_envforge_'));
});
