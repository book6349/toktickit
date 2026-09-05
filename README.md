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

Start a disposable local database from PowerShell:

```powershell
docker run --name toktickit-postgres --restart unless-stopped -e POSTGRES_USER=toktickit -e POSTGRES_PASSWORD=toktickit -e POSTGRES_DB=toktickit -p 5432:5432 -v toktickit-pgdata18:/var/lib/postgresql -d postgres:18
```

If the container already exists, use `docker start toktickit-postgres`.

### 2. Environment Setup

#### Client Configuration
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL="http://localhost:3000"
```

#### Server Configuration
Copy `server/.env.example` to `server/.env`:
```env
DATABASE_URL="postgresql://toktickit:toktickit@localhost:5432/toktickit?schema=public"
PORT=3000
```

### 3. Installation & Local Development

#### Frontend (Client)
```bash
cd client
npm install
npm run dev
```

#### Backend (Server)
```bash
cd server
npm install
npx prisma db push --accept-data-loss
npx prisma migrate resolve --applied 20260824000000_lab2_foundation
npm run prisma:seed
npm run dev
```

The three Prisma commands above are the current disposable-database baseline.
The committed Lab 2 migration history assumes a pre-existing Lab 1 `Category`
table on a brand-new database, so `prisma migrate deploy` is not currently a
fresh-database setup path. Do not use `--accept-data-loss` against a shared
database.

### 4. Running Tests

Run these as separate PowerShell commands:

```powershell
cd server
npm test -- --run

cd ..\client
npm test -- --run

cd ..
npm install
npx playwright test e2e/lab-02/requester-ticket-flow.spec.ts
```

The Playwright command starts the Vite client and Express API using the
committed `playwright.config.ts`; Docker PostgreSQL must be running first.

Build checks:

```powershell
cd server
npm run build

cd ..\client
npm run build
```
