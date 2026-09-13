# Security Policy

## Reporting Security Vulnerabilities

We take the security of EnvForge and local developer environments seriously.

If you discover a security vulnerability (such as unintended remote access, credential leakage, or unsafe path execution), please report it directly via email:

📧 **coldbira@gmail.com**

Please do **NOT** open public GitHub issues for security vulnerabilities before they have been resolved.

---

## Local Sandbox Guarantee

EnvForge is designed for local developer sandbox use:
- The mock server binds exclusively to `localhost` (`127.0.0.1`) by default.
- It never makes outbound requests to third-party APIs.
- Synthesized credentials are pure random dummy tokens and cannot be used against live production services.
