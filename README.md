<div align="center">

# ⚡ EnvForge

**Zero-config local SaaS mock engine and environment synthesizer.**  
*Boot any repository locally in seconds without real API keys, cloud accounts, or credit cards.*

<br />

```text
  5+ SAAS ENGINES   │   <50ms STARTUP   │   ZERO RUNTIME DEPS   │   NPM: @fibilisim/envforge   │   MIT LICENSE
```

<br />

**Language:** [English](#features) | [Türkçe](#tr-genel-bakış)

<br />

[![npm version](https://img.shields.io/npm/v/@fibilisim/envforge?color=blue&style=flat-square)](https://www.npmjs.com/package/@fibilisim/envforge)
[![CI](https://github.com/Fibilisim-Tekno/envforge/actions/workflows/ci.yml/badge.svg)](https://github.com/Fibilisim-Tekno/envforge/actions/workflows/ci.yml)
[![license](https://img.shields.io/github/license/Fibilisim-Tekno/envforge?style=flat-square)](https://github.com/Fibilisim-Tekno/envforge/blob/main/LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/runtime%20dependencies-0-brightgreen?style=flat-square)](https://www.npmjs.com/package/envforge)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

</div>

<br />

> [!TIP]
> **Why EnvForge?**  
> You clone an open-source project or onboarding repo. Its `.env.example` requires 15 different API keys (OpenAI, Stripe, Resend, S3). You can't even run `npm run dev` without registering for 5 paid services. **EnvForge eliminates this instantly.**

---

## 🚀 Quick Start

Run directly inside any project with a `.env.example` or `.env.sample` file:

```bash
# 1. Synthesizes working .env.local and starts local mock engine in one step
npx envforge

# 2. In another terminal, run your app as usual
npm run dev
```

That's it! Your application boots immediately. All external calls to OpenAI, Anthropic, Stripe, and Email services are intercepted and served with realistic mock responses.

---

## 📦 Supported SaaS Providers

| Provider | Intercepted Endpoints | Simulated Behavior | Status |
|---|---|---|:---:|
| **OpenAI** | `/v1/chat/completions`<br />`/v1/models` | Realistic completion JSON & SSE stream chunks | ✅ Active |
| **Anthropic** | `/v1/messages` | Valid Claude message payload with stop reasons | ✅ Active |
| **Stripe** | `/v1/checkout/sessions`<br />`/v1/payment_intents`<br />`/v1/customers` | Valid `cs_test_...` sessions + visual mock checkout UI | ✅ Active |
| **Resend** | `/emails` | Standard 200 OK delivery response with message ID | ✅ Active |
| **SendGrid** | `/v3/mail/send` | Standard 202 Accepted queued status | ✅ Active |
| **AWS / S3** | `PUT / GET Object` | In-memory upload/download confirmation | ✅ Active |

---

## 💻 Visual Terminal Experience

When you run `npx envforge`, it automatically detects your stack and monitors API calls in real time:

```text
  ███████╗███╗   ██╗██╗   ██╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔════╝████╗  ██║██║   ██║██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  █████╗  ██╔██╗ ██║██║   ██║█████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══╝  ██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ███████╗██║ ╚████║ ╚████╔╝ ██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚══════╝╚═╝  ╚═══╝  ╚═══╝  ╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  Zero-Config SaaS Mock Engine & Environment Synthesizer • v0.1.0
  https://github.com/Fibilisim-Tekno/envforge

🔍 Found template: .env.example
⚡ Created .env.local with synthesized credentials.

📦 Detected SaaS Services:
  ✓ OPENAI     → Mocked at http://localhost:9999
  ✓ STRIPE     → Mocked at http://localhost:9999
  ✓ RESEND     → Mocked at http://localhost:9999

🚀 EnvForge Mock Engine listening on http://localhost:9999
💡 You can now run your app (npm run dev) — all external SaaS calls are safely intercepted!

  [15:20:04] [OPENAI] POST /v1/chat/completions 200 OK
  [15:20:12] [STRIPE] POST /v1/checkout/sessions 200 OK
```

---

## 🛠️ CLI Commands

```bash
# Full workflow: generate .env.local and launch mock engine
npx envforge

# Generate only .env.local (useful for manual or container setups)
npx envforge init

# View help and options
npx envforge --help
```

---

## 🏗️ Architecture & Security

* **Pure Native Engine:** Built 100% on Node.js standard libraries (`node:http`, `node:crypto`). Zero runtime dependencies means instant download, no security supply-chain risks, and sub-15MB memory footprint.
* **Local Sandbox Guarantee:** Binds strictly to `localhost`. Never transmits data to external servers.
* **CORS-Enabled:** Automatically includes permissive CORS headers so client-side frontend code (React, Vue, Next.js client components) can call mock endpoints without CORS errors.

---

<details id="tr-genel-bakış">
<summary><strong>🇹🇷 Türkçe Genel Bakış</strong></summary>

### EnvForge Nedir?
EnvForge, yeni bir açık kaynak projeyi klonladığınızda `.env.example` dosyasında bulunan onlarca API anahtarı (OpenAI, Stripe, Resend vb.) yüzünden projeyi çalıştıramama sorununu çözer.

* **Tek Komut:** `npx envforge` çalıştırdığınızda projenizdeki `.env.example` dosyasını okur, geçerli formatta sahte token'lar üretir ve `.env.local` oluşturur.
* **Yerel Mock Sunucusu:** Arka planda açtığı hafif sunucu ile uygulamanızın dış servislere attığı istekleri karşılayarak gerçekçi yanıtlar döner.
* **Kredi Kartı / Hesap Gerekmez:** Hiçbir servise üye olmadan projeyi `localhost`'ta anında test edebilirsiniz.
</details>

---

## 📄 License

MIT © [Fibilişim](https://github.com/Fibilisim-Tekno)
