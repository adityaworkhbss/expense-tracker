# Personal Financial Management API

A production-ready NestJS backend for cashflow-aware personal financial management.

## Features
- **Cashflow-Aware Accounting**: Tracks actual cashflow balance versus net worth.
- **Credit Card Lifecycle Tracking**: Follows purchases, statement generation, due dates, and payment settlement.
- **EMI Management**: Calculates monthly burden based on active EMIs.
- **Future Obligations Engine**: Forecasts upcoming liabilities over the next 30 days.
- **Custom Fiscal Periods**: Dynamic salary cycle tracking (e.g. 10th to 9th).
- **JWT Authentication**: Secured endpoints.

## Tech Stack
- NestJS (TypeScript)
- Prisma ORM
- PostgreSQL
- Redis
- BullMQ (for scheduled background jobs)

## Setup & Local Development

1. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your DB credentials and JWT secrets.
   ```bash
   cp .env.example .env
   ```

2. **Start Infrastructure**:
   Spin up Postgres and Redis locally via Docker.
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Database Migrations**:
   Push the schema to the database.
   ```bash
   npx prisma migrate dev
   ```

5. **Start Application**:
   ```bash
   npm run start:dev
   ```

## Production Deployment (Render, Railway, Fly.io, AWS)

We provide a comprehensive `docker-compose.yml` and `Dockerfile` to easily deploy the service.

1. Set the following Environment Variables in your deployment provider:
   - `DATABASE_URL`: Your production PostgreSQL URL
   - `REDIS_HOST`: Your Redis Host
   - `REDIS_PORT`: Your Redis Port
   - `JWT_SECRET`: Random secure string
   - `JWT_REFRESH_SECRET`: Random secure string
2. Deploy the `Dockerfile`. The container will automatically run `npx prisma migrate deploy` on startup to ensure the schema is up to date, and then start the Nest app via `npm run start:prod`.
