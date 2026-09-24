# Kindred Giving

A full-stack donation intelligence workspace for nonprofit teams. Kindred combines a responsive React application with a Spring Boot API and integrates the original [Non-Profit-organization](https://github.com/812021664/Non-Profit-organization) donor, category, donation, and reporting workflows.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=111) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white) ![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)

## Highlights

- **Real-time command center** with current-period KPIs, 12-month revenue, campaign pacing, recent gifts, donor tiers, and activity.
- **Donor CRM** with search, multi-filter views, pagination, consent state, lifetime giving, gift history, add-donor workflow, and CSV export.
- **Donation tracking** with statuses, channels, payment methods, campaign attribution, receipt details, summaries, and filtered exports.
- **Campaign management** with goals, funding progress, supporter counts, timelines, filters, and campaign creation.
- **Advanced analytics** with revenue/gift volume, channel mix, campaign performance, donor loyalty, gift bands, retention, and period comparisons.
- **Communications** with reusable templates, audience segmentation, consent-aware recipient counts, preview, send history, and personalization tokens.
- **Reports and exports** with giving, donor, campaign, and finance views in CSV, JSON, and print-to-PDF formats.
- **Giving Assistant** with an on-device data question engine and optional secure backend endpoint.
- **Workspace settings** for organization details, access roles, integrations, security visibility, notifications, backups, and demo reset.
- **Responsive WCAG-minded UI** with keyboard-visible focus, semantic tables/forms, accessible dialogs, reduced visual density on mobile, and live status messaging.
- **Integrated Spring Boot API** with H2 development persistence, PostgreSQL support, Flyway migrations, validation, CORS, health checks, and structured errors.
- **Bidirectional synchronization** with automatic local fallback, API status in the shell, write-through forms, and safe retry.
- **Legacy compatibility routes** for add donor, add category-based donation, per-donor totals, and grand-total reports.
- **Route-level code splitting** and production chunking for the chart and vendor libraries.

## Quick Start

### Requirements

- Node.js **20+**
- npm 10+
- JDK **17+** for the integrated API

> Node 20 is the supported baseline. The toolchain is security-audited with zero known npm vulnerabilities at the time of delivery.

### Install and Run

```bash
npm install
npm run dev:full
```

Open **http://localhost:5173**. The command starts the API, waits for its health check, and then starts Vite with synchronized data.

To run only the frontend, use `npm run dev`. It attempts the local `/api` proxy and remains fully usable in browser-only demo mode when the API is unavailable.

The initial workspace contains 24 donor profiles, 240 donation records, five campaigns, communications, and activity history. Connected mode persists core records in the API database and mirrors them to browser storage.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server only |
| `npm run dev:full` | Start the Spring API and connected React workspace |
| `npm run server:dev` | Start only the Spring Boot API |
| `npm run server:test` | Run Spring integration tests through Maven Wrapper |
| `npm run server:build` | Package the Spring Boot API |
| `npm run type-check` | Run strict TypeScript checks |
| `npm run lint` | Run ESLint with zero warnings allowed |
| `npm test` | Run Vitest unit tests |
| `npm run build` | Create the production bundle |
| `npm run preview` | Preview the production bundle locally |
| `npm audit` | Verify the dependency audit |

## Environment

```env
# Use /api with the Vite development proxy or a same-origin production deployment.
VITE_API_BASE_URL=/api

VITE_ENVIRONMENT=production

# Optional server-side assistant route. Do not put a model provider key in Vite env vars.
VITE_ASSISTANT_ENDPOINT=/assistant/query
```

### Secret safety

Vite embeds every `VITE_*` value in the browser bundle. Never put database passwords, payment-provider secrets, private AI keys, signing secrets, or service credentials in this file. Keep those on a backend and have the backend authorize every request.

## Application Structure

```text
src/
├── components/
│   ├── layout/          App shell, navigation, search, donation workflow
│   └── ui/              Buttons, cards, badges, modal, forms, toasts
├── data/                Deterministic, realistic demo records
├── hooks/               Reusable data and analytics hooks
├── lib/                 Analytics, calculations, formatting, exports
├── pages/               Nine route-level application modules
├── services/            Axios client and typed backend service modules
├── store/               Persisted Zustand data and UI state
├── types/               Domain interfaces
├── App.tsx              Route definitions and lazy loading
├── main.tsx              React entry point
└── index.css             Tailwind layers, theme, glass UI, print rules

server/                    Spring Boot 3.5 API
├── controller/           Modern and legacy-compatible endpoints
├── domain/               Donor, donation, and campaign JPA entities
├── dto/                  Validated request/response records
├── repository/           Spring Data repositories
├── service/              Import, totals, synchronization, and legacy logic
├── resources/            H2/PostgreSQL config and Flyway migrations
└── src/test/             API integration tests

scripts/                   Cross-platform full-stack and Maven commands
```

## Backend Integration

The included `server/` module exposes:

- `GET /api/status` and `GET /api/bootstrap`
- `POST /api/import` for idempotent client-ID upserts
- `GET/PUT /api/donors`, `/api/donations`, and `/api/campaigns`
- `POST /api/legacy/donors` and `/api/legacy/donations`
- `GET /api/legacy/reports`
- `GET /actuator/health`

The browser imports its current workspace, applies server totals, and then hydrates from the API. Donor, donation, and campaign forms write through when connected. A failed API call leaves the local record intact and marks the shell as offline.

Development uses a file-backed H2 database at `server/data/kindred.mv.db`. Set the `postgres` profile and database variables for PostgreSQL. See [`server/README.md`](server/README.md) and [`docs/LEGACY_INTEGRATION.md`](docs/LEGACY_INTEGRATION.md).

The Axios client also supports a bearer token from `localStorage` under `kindred-session`. In production, prefer secure, `HttpOnly`, `SameSite` cookies and enforce authorization in an authenticated gateway.

### Assistant endpoint contract

`VITE_ASSISTANT_ENDPOINT` may point to a backend route with this request:

```json
{
  "question": "Which campaign is leading?"
}
```

Expected response:

```json
{
  "answer": "A Home for Every Family is leading…",
  "suggestions": ["Compare all campaigns", "Show donor retention"],
  "source": "api"
}
```

If the endpoint is absent, the assistant calculates deterministic answers in the browser. If it fails, the app falls back safely to the local engine.

## Deployment

```bash
npm ci
npm run build
```

The output directory is `dist/`. Configure your host to rewrite unknown application routes to `/index.html` so `BrowserRouter` can handle direct links to `/donors`, `/analytics`, and other pages.

Included deployment support:

- `vercel.json`
- `public/_redirects` for Netlify-compatible hosts
- `.github/workflows/ci.yml` for type, lint, test, audit, and build verification

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the deployment checklist and [`SECURITY.md`](SECURITY.md) for the security boundary.

## Quality Verification

The delivery has been verified with:

```text
npm run type-check   ✓
npm run lint         ✓
npm test             ✓ (4 frontend unit tests)
npm run build        ✓
npm run server:test  ✓ (3 API integration tests)
npm run server:build ✓
npm audit            ✓ (0 vulnerabilities)
```

## Data Reset

Open **Settings → Security & data → Reset demo** to restore the browser workspace. For a complete server reset during local development, stop the API and remove `server/data/`. Export a backup first if changes matter.

## License

Use this project according to your organization’s policies and the license selected by its owner.
