# TokTickIT - IT Service Desk Application

Full-stack IT service desk application built for CPE 334 Introduction to Software Engineering.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Bootstrap 5
- **Backend**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Testing**: Vitest, Supertest, and Playwright

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Docker Desktop (recommended for the PostgreSQL 18 test database)
- npm

Start a local PostgreSQL container from PowerShell:

```powershell
docker run --name toktickit-postgres --restart unless-stopped -e POSTGRES_USER=toktickit -e POSTGRES_PASSWORD=toktickit -e POSTGRES_DB=toktickit -p 5432:5432 -v toktickit-pgdata18:/var/lib/postgresql -d postgres:18
```

If the container already exists, use `docker start toktickit-postgres`.

Install the root Playwright tools and the app dependencies once:

```powershell
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Environment Setup

#### Client Configuration
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL="http://localhost:3000"
```

#### Server Configuration
Copy `server/.env.example` to `server/.env`:
```env
DATABASE_URL="postgresql://toktickit:toktickit@localhost:5432/toktickit_dev_local?schema=public"
PORT=3000
```

Create that uniquely named, empty local database first. `createdb` refuses an
existing name; choose a new suffix if it already exists:

```powershell
docker exec toktickit-postgres createdb -U toktickit toktickit_dev_local
```

### 3. Installation & Local Development

#### Frontend (Client)
```bash
cd client
npm run dev
```

#### Backend (Server)
```bash
cd server
npx prisma db push --accept-data-loss
npx prisma migrate resolve --applied 20260824000000_lab2_foundation
npm run prisma:seed
npm run dev
```

Use the three Prisma commands only against the new, empty database named above.
The committed Lab 2 migration history assumes a pre-existing Lab 1 `Category`
table on a brand-new database, so `prisma migrate deploy` is not currently a
fresh-database setup path. Never point `db push --accept-data-loss` at a database
that contains data. The E2E preparation command creates a separate disposable
database and refuses to reuse an existing one.

### 4. Running Tests

Run the unit tests separately. The server's 37 PostgreSQL-backed Actions Taken
checks create and remove their own uniquely named test database when
`LAB4_DB_TEST` is enabled:

```powershell
$env:LAB4_DB_TEST = "1"
npm --prefix server test

npm --prefix client test
```

Validate the Prisma schema and production builds:

```powershell
Push-Location server
npx prisma validate
Pop-Location
npm --prefix server run build
npm --prefix client run build
```

The full browser regression uses a new disposable database name for every run.
The preparation step refuses existing databases and keeps its synthetic data
for evidence review. It runs the Lab 2, Lab 3, and Lab 4 browser suites; the
HTML report is written under `artifacts/lab-04/playwright-report/`; Playwright
failure screenshots and traces are written under `test-results/`.

```powershell
$run = Get-Date -Format 'yyyyMMddHHmmss'
$env:DATABASE_URL = "postgresql://toktickit:toktickit@localhost:5432/toktickit_lab3_e2e_${run}?schema=public"
npm run test:e2e
```

The Lab 1 regression is covered by the server and client suites; there is no
separate Lab 1 Playwright directory. Do not count a suite as passed unless the
command exits successfully. Record the commit, exact command, date, result,
and evidence paths in the release record.

The Playwright configuration starts the Vite client and Express API using the
selected `DATABASE_URL`; Docker PostgreSQL must be running first. It captures
Lab 4 dashboard, Actions Taken, and Ticket workflow screens at desktop, tablet,
and mobile widths under `artifacts/lab-04/screenshots/`.
