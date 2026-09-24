# Security Policy

## Security Boundary

Kindred is a frontend application. Production authorization, database access, payment processing, email delivery, report generation, and AI provider credentials must live behind a trusted backend.

## Reporting a Vulnerability

Do not disclose suspected vulnerabilities in a public issue. Send a private report to the project owner with:

- affected route or component
- reproduction steps
- impact
- suggested mitigation
- any proof-of-concept material

## Integrated API

The local Spring Boot profile is intentionally open for development and trusts only configured CORS origins. Before exposing it beyond localhost, place it behind authenticated TLS infrastructure, enforce organization and role authorization, restrict CORS, apply rate limits, and move PostgreSQL credentials to a managed secret store.

## Client-Side Rules

- Never commit `.env` or a private API key.
- Never prefix a secret with `VITE_`; Vite exposes those values publicly.
- Do not store sensitive production tokens in `localStorage`; prefer secure, `HttpOnly`, `SameSite` cookies.
- Treat browser-side role visibility as presentation only. Enforce RBAC on every server request.
- Require explicit authorization for donor exports and bulk communication.
- Minimize PII sent to AI providers and configure provider retention appropriately.
- Validate all input on the server even when the UI validates it.
- Verify payment webhook signatures and make handlers idempotent.
- Use HTTPS, HSTS, a restrictive CSP, and secure cookies in production.

## Reporting Safety

The included CSV/JSON exports may contain donor contact and financial information. Store them in approved locations, apply access controls, and follow organizational retention and deletion policies.
