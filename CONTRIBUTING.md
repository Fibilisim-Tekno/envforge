# Contributing to EnvForge

Thank you for your interest in improving EnvForge! We welcome contributions across all areas: new SaaS provider responders, bug fixes, performance enhancements, and documentation.

---

## 🛠️ Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Fibilisim-Tekno/envforge.git
cd envforge

# 2. Install dependencies
npm install

# 3. Build & Run Tests
npm test
```

---

## 📐 Architecture & Principles

1. **Zero Runtime Dependencies:**
   - All mock responders and server logic must rely strictly on Node.js standard libraries (`node:http`, `node:crypto`, `node:fs`, `node:path`).
   - Do not introduce Express, Fastify, or heavy frameworks into runtime dependencies.

2. **Test-Driven Development (TDD):**
   - Every new provider responder must come with matching integration tests under `test/`.
   - Maintain 80%+ test coverage across all lines.

3. **Commit Messages:**
   - Follow [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat: add LemonSqueezy payment responder`
     - `fix: correct OpenAI streaming chunk termination`
     - `docs: update supported providers matrix`
     - `test: add edge cases for env parser`
