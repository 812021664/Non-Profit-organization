# Legacy Repository Integration

## Upstream

- Repository: <https://github.com/812021664/Non-Profit-organization>
- Inspected commit: `26ddc5ce757fbb1b44e5b7c55e7ce84cb2b2f2cd`
- Original format: one Java console application in `file.java`

The upstream repository contains code but no database, serialized records, build system, or web API. There were therefore no donor or donation records to migrate from the repository itself.

## Capability Mapping

| Original console behavior | Integrated behavior |
| --- | --- |
| Add donor name and email | `POST /api/legacy/donors` and the React donor form |
| Store donations under a donor | Persistent `donors` and `donations` tables |
| Add amount, category, and current date | `POST /api/legacy/donations`; category becomes a campaign |
| Find donor by case-insensitive name | `DonorRepository.findByFullName` |
| Per-donor donation total | `GET /api/legacy/reports` |
| Grand donation total | `grandTotal` in the legacy report response |
| In-memory process state | H2 development database or PostgreSQL |
| Scanner input validation | Bean Validation and structured RFC 9457 problem responses |
| Console menu | Responsive React workspace |

## Domain Expansion

The original `Donation.category` is represented by a `Campaign`, so existing category-based behavior is preserved while gaining goals, dates, status, channels, payment methods, and reports.

The original combined donor name is split into `firstName` and `lastName` in the modern model. The legacy API accepts the combined name and performs that split automatically.

## Synchronization

When `VITE_API_BASE_URL=/api` and the Spring service is reachable:

1. Kindred calls `GET /api/status`.
2. It sends its current donors, donations, and campaigns to `POST /api/import`.
3. The API performs client-ID-based upserts, preserving legacy records already in the database.
4. The API recalculates donor totals, campaign totals, and supporter counts.
5. Kindred replaces local domain data with `GET /api/bootstrap` results.
6. New donor, donation, and campaign forms write through to the API.

If the API is unavailable, the interface remains usable with persisted browser data and shows **API offline**. Settings → Integrations displays the current connection and offers a retry action.

## Legacy API Examples

Add a donor:

```bash
curl -X POST http://localhost:8080/api/legacy/donors \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi Patel","email":"ravi@example.org"}'
```

Add a category-based donation:

```bash
curl -X POST http://localhost:8080/api/legacy/donations \
  -H "Content-Type: application/json" \
  -d '{"donorName":"Ravi Patel","amount":125.50,"category":"Cash"}'
```

View the original report shape:

```bash
curl http://localhost:8080/api/legacy/reports
```

## Compatibility Boundary

The compatibility routes intentionally accept the original fields only. They are useful for gradual migration, but the React application uses the richer modern API. The repository did not include historical exports, so importing a real organization’s records would require a separate CSV or database migration mapped to these DTOs.
