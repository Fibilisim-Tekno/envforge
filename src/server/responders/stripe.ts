import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';

export function handleStripeRequest(
  req: IncomingMessage,
  res: ServerResponse,
  pathname: string,
  _bodyText: string,
  serverOrigin: string
): boolean {
  // Helpful visual browser checkout page
  if (pathname.startsWith('/stripe/mock-checkout') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>EnvForge - Stripe Mock Checkout</title>
        <style>
          body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #1e293b; padding: 2.5rem; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; max-width: 440px; border: 1px solid #334155; }
          h2 { color: #6366f1; margin-top: 0; }
          p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>⚡ EnvForge Stripe Simulator</h2>
          <p>This is a simulated Stripe Checkout session generated automatically for local development.</p>
          <a class="btn" href="javascript:window.history.back()">Return to App</a>
        </div>
      </body>
      </html>
    `);
    return true;
  }

  // 1. Checkout Sessions
  if (pathname === '/v1/checkout/sessions' && req.method === 'POST') {
    const id = `cs_test_envforge_${crypto.randomBytes(10).toString('hex')}`;
    const payload = {
      id,
      object: 'checkout.session',
      payment_status: 'unpaid',
      status: 'open',
      url: `${serverOrigin}/stripe/mock-checkout?session_id=${id}`,
      success_url: `${serverOrigin}/stripe/success?session_id=${id}`,
      cancel_url: `${serverOrigin}/stripe/cancel?session_id=${id}`,
      amount_total: 2000,
      currency: 'usd'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return true;
  }

  // 2. Payment Intents
  if (pathname === '/v1/payment_intents' && req.method === 'POST') {
    const id = `pi_test_envforge_${crypto.randomBytes(10).toString('hex')}`;
    const payload = {
      id,
      object: 'payment_intent',
      amount: 2000,
      currency: 'usd',
      status: 'succeeded',
      client_secret: `${id}_secret_${crypto.randomBytes(8).toString('hex')}`
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
    return true;
  }

  // 3. Customers
  if (pathname === '/v1/customers' && req.method === 'POST') {
    const id = `cus_test_envforge_${crypto.randomBytes(8).toString('hex')}`;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id, object: 'customer', created: Math.floor(Date.now() / 1000) }));
    return true;
  }

  return false;
}
