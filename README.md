# TokTickIT - IT Service Desk Application

Full-stack IT service desk application built for CPE 334 Introduction to Software Engineering.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Bootstrap 5
- **Backend**: Node.js + Express + TypeScript
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Testing**: Vitest & Supertest

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL database instance

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
npx prisma migrate dev
npm run dev
```

### 4. Running Tests
- Frontend tests: `cd client && npm test`
- Backend tests: `cd server && npm test`