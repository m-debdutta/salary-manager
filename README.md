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
- Prisma ORM with SQLite (`better-sqlite3`)
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

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm

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

   Default values:

   ```
   DATABASE_URL="file:./dev.db"
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
