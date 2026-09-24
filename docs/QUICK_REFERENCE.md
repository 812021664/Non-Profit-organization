# Quick Reference

## Start

```bash
npm install
npm run dev:full
```

Open `http://localhost:5173`. This starts Spring Boot and Vite together. Use `npm run dev` for frontend-only browser mode.

## Verify

```bash
npm run type-check
npm run lint
npm test
npm run build
npm run server:test
npm run server:build
npm audit
```

## API

- Health: `http://localhost:8080/actuator/health`
- Status: `http://localhost:8080/api/status`
- Bootstrap: `http://localhost:8080/api/bootstrap`
- Legacy report: `http://localhost:8080/api/legacy/reports`

## Routes

| Route | Module |
| --- | --- |
| `/` | Overview dashboard |
| `/donors` | Donor CRM |
| `/donations` | Gift tracking |
| `/campaigns` | Campaign portfolio |
| `/analytics` | Advanced analytics |
| `/communications` | Email engagement |
| `/reports` | Reports and exports |
| `/assistant` | Giving Assistant |
| `/settings` | Workspace settings |

## Useful Commands

```bash
# Clean production output
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Preview the production bundle
npm run preview

# Reinstall from lockfile
npm ci
```

## State and Storage

- Domain data: Zustand store `kindred-giving-data`
- Session token expected by Axios: `kindred-session`
- Reset sample data: Settings → Security & data → Reset demo

## Design Tokens

```text
Background: #080b0d
Glass panel: rgba(255,255,255,.025–.055)
Primary: #23c983
Primary light: #4adea4
Text: #f4f7f5
Body font: Barlow
Display font: Instrument Serif
```

## Common Components

```tsx
<Button variant="primary" size="md">Save</Button>
<Card className="p-6">...</Card>
<Badge tone="success" dot>Active</Badge>
<Input placeholder="Search…" />
<Modal open={open} onClose={close} title="Title">...</Modal>
```

## Safe AI Configuration

```env
VITE_ASSISTANT_ENDPOINT=https://api.example.org/assistant/query
```

Never put a private model API key in a `VITE_*` variable. Without an endpoint, the Giving Assistant uses its local data engine.

## Production Build

```bash
npm run build
```

Publish `dist/` and rewrite unknown paths to `index.html`.
