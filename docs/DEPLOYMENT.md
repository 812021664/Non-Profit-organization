# Deployment Guide

## Build

```bash
npm ci
npm run type-check
npm run lint
npm test
npm run build
npm run server:test
npm run server:build
```

The React application outputs to `dist/`. The Spring Boot API outputs to `server/target/kindred-nonprofit-api-1.0.0.jar`. The SPA requires browser history fallback; the API is deployed separately.

## Environment Variables

Set these in the hosting provider, not in committed files:

```env
VITE_API_BASE_URL=https://api.example.org
VITE_ENVIRONMENT=production
VITE_ASSISTANT_ENDPOINT=https://api.example.org/assistant/query
```

Backend-only variables:

```env
SPRING_PROFILES_ACTIVE=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://database:5432/kindred
SPRING_DATASOURCE_USERNAME=kindred
SPRING_DATASOURCE_PASSWORD=server-side-secret
APP_ALLOWED_ORIGINS=https://giving.example.org
```

Every `VITE_*` variable is public. Do not provide private model-provider, payment, database, or signing credentials to the browser.

## Host Configuration

### Vercel

The included `vercel.json` selects Vite and provides SPA fallback. Import the repository, set the environment variables, and deploy. No custom build settings are required.

### Netlify-compatible hosts

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

`public/_redirects` is copied into the build output and rewrites application routes to `index.html`.

### Docker Compose

For an integrated local PostgreSQL environment:

```bash
docker compose up --build
```

This starts the API on port 8080. Run `npm run dev` for the Vite proxy during local development. Replace the example database password and add authentication before any shared deployment.

### Static object storage / CDN

Upload all files in `dist/`, enable HTTPS, and configure all 404 responses for application paths to return `index.html`. Set long-lived immutable caching for `/assets/*`; do not cache `index.html` indefinitely.

## Production Checklist

### Application

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes
- [ ] `npm run build` passes
- [ ] `npm audit` reports no known vulnerabilities
- [ ] Direct links to every module resolve to `index.html`
- [ ] 404 assets are not silently returned as HTML

### API

- [ ] JDK 17 or newer builds `server/`
- [ ] PostgreSQL migrations complete through Flyway
- [ ] `/actuator/health` reports `UP`
- [ ] API is served only over HTTPS
- [ ] CORS allows only deployed application origins
- [ ] Authentication and role authorization are enforced server-side
- [ ] Payment webhooks verify signatures and are idempotent
- [ ] Rate limits protect authentication, search, exports, and AI routes
- [ ] Audit logs cover donor, gift, role, export, and integration changes
- [ ] Database backups and recovery procedures are tested

### Security

- [ ] No private secrets use a `VITE_` prefix
- [ ] Session cookies are `HttpOnly`, `Secure`, and `SameSite`
- [ ] Content Security Policy restricts scripts, frames, and API connections
- [ ] Donor exports require explicit authorization
- [ ] Communication consent and unsubscribe rules are enforced server-side
- [ ] Sensitive fields are encrypted at rest and in transit
- [ ] Privacy retention and deletion rules are documented

### Analytics and AI

- [ ] Assistant requests are authorized and rate-limited
- [ ] Model-provider credentials remain server-side
- [ ] Donor PII is minimized before model prompts
- [ ] Provider data-retention settings match organizational policy
- [ ] AI answers are labeled and reviewed before consequential action

### Quality Assurance

- [ ] Test keyboard-only navigation and focus visibility
- [ ] Test at 320 px, 768 px, 1024 px, and wide desktop widths
- [ ] Test with reduced motion and 200% zoom
- [ ] Verify charts have textual context and readable contrast
- [ ] Verify CSV exports open in Excel and Google Sheets
- [ ] Verify print/PDF report output
- [ ] Run a production preview, not only the development server

## Rollback

Use immutable, versioned static assets and retain the previous deployment. If a release introduces an issue:

1. Route traffic back to the previous deployment.
2. Preserve logs and generated reports.
3. Confirm database/API compatibility before redeploying.
4. Document the incident and corrective action.

## Security Reporting

Do not open a public issue for a suspected vulnerability. Follow the process in [`../SECURITY.md`](../SECURITY.md).
