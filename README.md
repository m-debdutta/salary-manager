# Salary Manager

A full-stack salary management application for managing employee data with CRUD operations and analytics. Built as a technical assignment to demonstrate proficiency in Node.js, React, and database management with efficient data handling for 10,000+ records.

## 🚀 Features

- **Employee Management**: Complete CRUD operations for employee records
- **Advanced Analytics**: Comprehensive salary insights and statistics
  - Salary analysis by country
  - Salary analysis by job title
  - Salary distribution visualization
  - Department-wise summaries
- **High-Performance Seeding**: Seed 10,000 records in under 5 seconds
- **Modern UI**: Built with React and custom UI components
- **Real-time Validation**: Input validation on both frontend and backend
- **Pagination & Filtering**: Efficient data browsing with search capabilities
- **Interactive Dashboards**: Visual insights with charts and graphs

## 🛠️ Technology Stack

### Backend

- Node.js with TypeScript
- Express.js v5
- Prisma ORM with PostgreSQL
- Zod for validation
- Vitest for testing

### Frontend

- Vite + React 19 with TypeScript
- TanStack Query (React Query) for server state
- React Router v7 for navigation
- Recharts for data visualization
- Axios for HTTP requests
- Vitest + React Testing Library

## 💾 Database Schema

**Employees Table:**

- `id` - Primary key
- `first_name`, `last_name` - Employee names
- `job_title` - Position/role
- `country` - Work location
- `salary` - Annual salary (float)
- `department` - Department name (optional)
- `hire_date` - Date of hire
- `employment_type` - Full-time/Part-time/Contract
- `created_at`, `updated_at` - Timestamps

**Note**: Full name is computed as `first_name + last_name` to avoid redundancy.

**Indexes:** Optimized for queries on `country`, `job_title`, and combined `(country, job_title)`.

## 📡 API Endpoints

### Health

- `GET /health` - Service health check (status, uptime, environment)

### Employee Management

- `GET /api/employees` - List employees (with pagination & filters)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Analytics

- `GET /api/analytics/salary-by-country` - Min/max/avg salary per country
- `GET /api/analytics/salary-by-job-title` - Salary stats per job title (optional `?country=` filter)
- `GET /api/analytics/salary-distribution` - Employee counts by salary bucket
- `GET /api/analytics/department-summary` - Salary stats grouped by department

## 📁 Project Structure

```
salary-manager/
├── start.sh                            # One-command launcher for the full stack
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma schema definition
│   │   └── migrations/                 # Database migrations
│   ├── src/
│   │   ├── index.ts                    # Express server entry point
│   │   ├── routes/
│   │   │   ├── employees.ts            # Employee CRUD routes
│   │   │   ├── analytics.ts            # Analytics routes
│   │   │   └── health.ts               # Health check route
│   │   ├── services/
│   │   │   ├── employeeService.ts      # Employee business logic
│   │   │   └── analyticsService.ts     # Analytics calculations
│   │   ├── db/
│   │   │   ├── client.ts               # Prisma client singleton
│   │   │   ├── employeeRepository.ts   # Employee data access
│   │   │   ├── analyticsRepository.ts  # Analytics data access
│   │   │   └── init.ts                 # Database initialization
│   │   ├── middleware/
│   │   │   └── index.ts                # Request validation & error handling
│   │   ├── lib/
│   │   │   └── validation.ts           # Zod schemas
│   │   ├── utils/
│   │   │   └── seedHelpers.ts          # Helpers for generating seed data
│   │   └── scripts/
│   │       └── seed.ts                 # High-performance seed script
│   ├── data/
│   │   ├── first_names.txt             # First names for seeding
│   │   └── last_names.txt              # Last names for seeding
│   ├── tests/                          # Unit and integration tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # Application entry point
│   │   ├── App.tsx                     # Root component with routing
│   │   ├── api/
│   │   │   ├── employees.ts            # Employee API client
│   │   │   └── analytics.ts            # Analytics API client
│   │   ├── components/
│   │   │   ├── ui/                     # Base UI components
│   │   │   ├── Dashboard.tsx           # Main dashboard view
│   │   │   ├── AnalyticsPanel.tsx      # Analytics dashboard
│   │   │   ├── AddEmployeeModal.tsx    # Add employee form modal
│   │   │   ├── EmployeeCard.tsx        # Employee card component
│   │   │   ├── EmployeeDetailsModal.tsx
│   │   │   ├── EmployeeFilters.tsx     # Filter controls
│   │   │   ├── SalaryByCountryChart.tsx
│   │   │   ├── SalaryByJobTitleChart.tsx
│   │   │   ├── SalaryDistributionChart.tsx
│   │   │   ├── DepartmentSummaryChart.tsx
│   │   │   └── StatCard.tsx
│   │   ├── hooks/
│   │   │   └── useEmployeeFilters.ts   # Filter state hook
│   │   └── lib/
│   │       ├── employeeValidation.ts   # Client-side Zod schemas
│   │       └── masterData.ts           # Static lookup data
│   ├── tests/                          # Component and hook tests
│   ├── package.json
│   └── vite.config.ts
└── data/
    ├── countries.json
    ├── departments.json
    ├── employment_types.json
    └── job_titles.json
```

### Architecture Highlights

**Backend:**

- **Layered Architecture**: Routes → Services → Repositories for clean separation of concerns
- **Prisma ORM**: Type-safe database queries with automatic migrations
- **Middleware Pattern**: Centralized validation and error handling
- **Database Indexing**: Optimized queries with indexes on `country`, `job_title`, and `(country, job_title)`

**Frontend:**

- **TanStack Query**: Server state management with caching and background refetching
- **Component-Based**: Modular, reusable React components
- **Custom Hooks**: Reusable filter state logic
- **Type Safety**: End-to-end TypeScript for reliability

## �️ PostgreSQL Database Setup

### Option A — Using `psql` (local install)

1. **Create the database and user**

   ```sql
   psql -U postgres
   ```

   ```sql
   CREATE USER salary_manager WITH PASSWORD 'salary-manager-secret';
   CREATE DATABASE salary_manager OWNER salary_manager;
   GRANT ALL PRIVILEGES ON DATABASE salary_manager TO salary_manager;
   \q
   ```

2. **Verify the connection**

   ```bash
   psql -U salary_manager -d salary_manager -h localhost
   ```

### Option B — Using Docker

```bash
docker run -d \
  --name salary-manager-db \
  -e POSTGRES_USER=salary_manager \
  -e POSTGRES_PASSWORD=salary-manager-secret \
  -e POSTGRES_DB=salary_manager \
  -p 5432:5432 \
  postgres:16-alpine
```

After creating the database, set `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://salary_manager:salary-manager-secret@localhost:5432/salary_manager"
```

Then run migrations:

```bash
cd backend && npm run db:migrate
```

---

## �🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

### Quick Start (recommended)

The `start.sh` script installs dependencies, runs migrations, and starts all services:

```bash
./start.sh
```

Optional flags:

```bash
./start.sh seed=true          # Seed 10,000 employees before starting
./start.sh prisma=true        # Also open Prisma Studio at http://localhost:5555
./start.sh seed=true prisma=true
```

### Manual Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/salary-manager.git
   cd salary-manager
   ```

2. **Install backend dependencies and migrate the database**

   ```bash
   cd backend
   npm install
   npm run db:migrate
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your PostgreSQL credentials:

   ```
   DATABASE_URL="postgresql://<user>:<password>@localhost:5432/salary_manager"
   PORT=3000
   NODE_ENV=development
   ```

4. **Verify the database connection**

   ```bash
   npm run db:init
   ```

5. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

6. **Seed the database (optional)**

   ```bash
   cd ../backend
   npm run seed
   ```

   Seeds 10,000 employee records in under 5 seconds.

### Running in Development

```bash
# Terminal 1 — backend (http://localhost:3000)
cd backend && npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend && npm run dev
```

### Database Management

```bash
cd backend

npm run db:init            # Verify database connection
npm run db:migrate         # Apply pending migrations
npm run db:generate        # Regenerate Prisma Client after schema changes
npm run db:studio          # Open Prisma Studio at http://localhost:5555
npm run db:migrate:deploy  # Deploy migrations to production
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test                   # Run all tests
npm run test:coverage      # Run with coverage report
npm run test:ui            # Open Vitest UI

# Frontend
cd frontend
npm test                   # Run all tests
npm run test:coverage      # Run with coverage report
npm run test:ui            # Open Vitest UI
```

## 🔮 Future Enhancements

### Authentication & Authorisation (JWT)

The API is currently open — any client that can reach the server can read or mutate data. The next step is a proper auth layer:

- **JWT-based authentication** — issue signed tokens on login (`POST /auth/login`) and verify them in an Express middleware before any protected route is reached. Access tokens would be short-lived (e.g. 15 min) and refreshed via a secure, `HttpOnly` refresh-token cookie to limit exposure if a token is stolen.
- **Role-based access control (RBAC)** — distinguish at minimum between `viewer` (read-only analytics + employee list) and `admin` (full CRUD). Roles would be encoded in the JWT payload and checked per route.
- **Audit log** — record who created, updated, or deleted an employee record, stored alongside the existing `created_at` / `updated_at` timestamps.

### Multi-User Interface

The current UI is a single shared view with no concept of who is logged in. A multi-user experience would include:

- **Login / logout screen** — credential form that exchanges a username + password for a JWT, stored in memory (access token) and an `HttpOnly` cookie (refresh token).
- **User management** — an admin-only panel to invite colleagues, assign roles, and revoke access.
- **Per-user preferences** — saved filter presets, default page size, and preferred analytics view persisted per user account.
- **Concurrent-edit awareness** — optimistic locking or a `version` field on employee records to prevent two admins silently overwriting each other's changes.

### Structured Logging

The backend currently uses `console.error` / `console.log` for diagnostics. Production-grade logging would include:

- **Structured JSON logs** via a library such as `pino` — each log line is a machine-readable JSON object with a timestamp, severity level, request ID, and relevant context, making it straightforward to ingest into log aggregators (Datadog, Grafana Loki, AWS CloudWatch).
- **Per-request correlation ID** — a UUID generated at the start of each request (or forwarded from an `X-Request-Id` header) and attached to every log line produced during that request, enabling full end-to-end tracing across services.
- **HTTP access log** — log method, path, status code, and response time for every request to track latency trends and surface slow endpoints.
- **Log levels by environment** — `debug` / `trace` in development, `info` in staging, `warn` and above in production to avoid noisy logs at scale.

### Other Enhancements

- **Rate limiting** — `express-rate-limit` on mutation endpoints to prevent bulk scraping or brute-force login attempts.
- **Export** — CSV / Excel download of the current filtered employee list.
- **Notifications** — email or in-app alerts for significant salary events (e.g. salary review reminders based on `hire_date`).
