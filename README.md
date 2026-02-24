# News API Backend

A production-ready REST API for news publishing built with Node.js, TypeScript, Express, Prisma, and PostgreSQL. Includes JWT auth, RBAC, rate limiting, read tracking, and daily analytics aggregation.

## Features

- JWT authentication with role-based access control
- Author-only article management with soft delete
- Public feed with search and filters
- Read tracking with per-user/IP throttling (Redis)
- Daily analytics aggregation using BullMQ
- Security middleware: Helmet, CORS, input sanitization
- Full unit and integration tests with mocked Prisma

## Tech Stack

- Node.js + TypeScript + Express
- Prisma ORM + PostgreSQL
- Redis + BullMQ
- Zod for validation
- JWT for auth
- Jest + Supertest for tests

## Project Structure

- Root configs: [README.md](README.md), [.env.example](.env.example), [docker-compose.yml](docker-compose.yml)
- Backend app: [backend/src](backend/src)
- Prisma schema and migrations: [backend/prisma](backend/prisma)
- Tests: [backend/tests](backend/tests)

## Environment Variables

Create a .env file in the backend folder. Recommended variables:

```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/news-api
JWT_SECRET=change_me
JWT_EXPIRES_IN=24h
REDIS_URL=redis://default:password@host:port
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CORS_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

If REDIS_URL is set, it is preferred. Otherwise REDIS_HOST/REDIS_PORT are used.

## Setup (Local)

1) Install dependencies
```
cd backend
npm install
```

2) Run database migrations
```
npm run prisma:migrate
```

3) Seed sample data
```
npm run prisma:seed
```

4) Start dev server
```
npm run dev
```

## Setup (Docker)

From the repository root:
```
docker-compose up --build
```

This runs PostgreSQL, Redis, and the backend app. The app Dockerfile lives at [backend/Dockerfile](backend/Dockerfile).

## Scripts

From backend folder:

- npm run dev - Start dev server (ts-node + nodemon)
- npm run build - Compile TypeScript
- npm run start - Run compiled server
- npm test - Run Jest tests
- npm run prisma:migrate - Apply Prisma migrations
- npm run prisma:seed - Seed database

## API Overview

Base URL: http://localhost:4000

### Auth

- POST /auth/signup
- POST /auth/login

Payload for signup (JSON):
```
{
  "name": "Jane Author",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "AUTHOR"
}
```

### Author Articles (AUTHOR only)

- POST /articles
- GET /articles/me
- PUT /articles/:id
- DELETE /articles/:id

### Public Feed

- GET /articles
  - Query params: category, author, q, page, size
- GET /articles/:id

### Author Dashboard

- GET /author/dashboard
  - Returns author articles with total view counts

### Health

- GET /health

## Response Format

Success:
```
{
  "Success": true,
  "Message": "Operation successful",
  "Object": {},
  "Errors": null
}
```

Error:
```
{
  "Success": false,
  "Message": "Validation failed",
  "Object": null,
  "Errors": ["Title must be 1-150 characters"]
}
```

Paginated:
```
{
  "Success": true,
  "Message": "Articles fetched",
  "Object": [],
  "PageNumber": 1,
  "PageSize": 10,
  "TotalSize": 25,
  "Errors": null
}
```

## Security Notes

- Password policy: 8+ chars, upper, lower, number, special
- JWT: HS256, 24h expiry, subject and role claims
- Rate limits:
  - Signup: 5/min
  - Login: 10/min
  - Global: configurable via env
- Read tracking throttled to 1 view per user/IP per article per 5 minutes

## Analytics

- Read logs aggregate daily at 00:00 UTC
- Stored in DailyAnalytics with unique (articleId, date)
- Queue and worker defined in [backend/src/jobs/dailyAnalytics.ts](backend/src/jobs/dailyAnalytics.ts)

## Tests

Tests are in [backend/tests](backend/tests) and mock Prisma for isolation. Run:
```
cd backend
npm test
```

## CI/CD

GitHub Actions workflow is in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml):

- CI: install and test on push/PR
- CD: build Docker image on main (no push)
