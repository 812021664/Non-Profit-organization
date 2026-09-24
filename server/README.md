# Kindred Nonprofit API

Spring Boot 3.5 REST API for the integrated Kindred Giving workspace. It preserves the original `Non-Profit-organization` capabilities while adding validated persistence and the richer Kindred donor, donation, and campaign model.

## Requirements

- JDK 17+
- No global Maven installation is required; the Maven wrapper is included.

## Run

```bash
./mvnw spring-boot:run
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

The API starts on `http://localhost:8080`, persists development data to `server/data/kindred.mv.db`, and exposes health at `http://localhost:8080/actuator/health`.

## Test and Package

```bash
./mvnw test
./mvnw package
```

## Main Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/status` | Integration and record counts |
| `GET` | `/api/bootstrap` | Full synchronized React workspace |
| `POST` | `/api/import` | Idempotent workspace upsert |
| `GET` | `/api/donors` | Donor list |
| `PUT` | `/api/donors/{id}` | Create or update a donor |
| `GET` | `/api/donations` | Donation list |
| `PUT` | `/api/donations/{id}` | Create or update a donation |
| `GET` | `/api/campaigns` | Campaign list |
| `PUT` | `/api/campaigns/{id}` | Create or update a campaign |
| `POST` | `/api/legacy/donors` | Original add-donor flow |
| `POST` | `/api/legacy/donations` | Original add-donation flow |
| `GET` | `/api/legacy/reports` | Original totals report |

## PostgreSQL

```bash
SPRING_PROFILES_ACTIVE=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kindred
SPRING_DATASOURCE_USERNAME=kindred
SPRING_DATASOURCE_PASSWORD=replace-me
./mvnw spring-boot:run
```

Flyway applies versioned migrations before Hibernate starts.

## Configuration

| Variable | Default |
| --- | --- |
| `PORT` | `8080` |
| `APP_ALLOWED_ORIGINS` | local Vite origins |
| `SPRING_DATASOURCE_URL` | local H2 file |
| `SPRING_DATASOURCE_USERNAME` | `sa` |
| `SPRING_DATASOURCE_PASSWORD` | empty |
| `SPRING_PROFILES_ACTIVE` | H2 default |

Do not place provider secrets in this service’s frontend configuration. Place the API behind the organization’s authenticated gateway before production deployment.
