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
- **Modern UI**: Built with React and shadcn/ui components
- **Real-time Validation**: Input validation on both frontend and backend
- **Pagination & Filtering**: Efficient data browsing with search capabilities
- **Interactive Dashboards**: Visual insights with charts and graphs

## 🛠️ Technology Stack

### Backend

- Node.js with TypeScript
- Express.js
- Prisma ORM
- SQLite with indexing
- Zod for validation
- Vitest for testing

### Frontend

- Vite + React with TypeScript
- shadcn/ui components
- React Router for navigation
- Recharts for data visualization
- Vitest + React Testing Library

## 💾 Database Schema

**Employees Table:**

- `id` - Primary key
- `first_name`, `last_name` - Employee names
- `job_title` - Position/role
- `country` - Work location
- `salary` - Annual salary (decimal)
- `department` - Department name
- `hire_date` - Date of hire
- `employment_type` - Full-time/Part-time/Contract
- `created_at`, `updated_at` - Timestamps

**Note**: Full name is computed as `first_name + last_name` to avoid redundancy.

**Indexes:** Optimized for queries on `country`, `job_title`, and combined `(country, job_title)`.

## 📡 API Endpoints

### Employee Management

- `GET /api/employees` - List employees (with pagination & filters)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Analytics

- `GET /api/analytics/salary-by-country` - Min/max/avg salary per country
- `GET /api/analytics/salary-by-job-title` - Avg salary per job title
- `GET /api/analytics/overview` - Overall statistics

## 📁 Project Structure

```
salary-manager/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma               # Prisma schema definition
│   │   └── migrations/                 # Database migrations
│   ├── src/
│   │   ├── index.ts                    # Express server entry point
│   │   ├── routes/
│   │   │   ├── employees.ts            # Employee CRUD routes
│   │   │   └── analytics.ts            # Analytics routes
│   │   ├── services/
│   │   │   ├── employeeService.ts      # Employee business logic
│   │   │   └── analyticsService.ts     # Analytics calculations
│   │   ├── db/
│   │   │   ├── client.ts               # Prisma client singleton
│   │   │   ├── init.ts                 # Database initialization
│   │   │   └── README.md               # Database documentation
│   │   ├── middleware/
│   │   │   ├── validation.ts           # Request validation middleware
│   │   │   └── errorHandler.ts         # Global error handler
│   │   ├── utils/
│   │   │   └── dataGenerator.ts        # Helper for generating seed data
│   │   ├── types/
│   │   │   └── employee.ts             # TypeScript interfaces & types
│   │   └── scripts/
│   │       └── seed.ts                 # High-performance seed script
│   ├── data/
│   │   ├── first_names.txt             # First names for seeding (~500)
│   │   └── last_names.txt              # Last names for seeding (~500)
│   ├── tests/
│   │   ├── employees.test.ts           # Employee API tests
│   │   └── analytics.test.ts           # Analytics API tests
│   ├── .env                            # Environment variables (gitignored)
│   ├── .env.example                    # Environment template
│   ├── package.json
│   ├── tsconfig.json
│   └── dev.db                          # SQLite database (gitignored)
├── frontend/
│   ├── src/
│   │   ├── main.tsx                    # Application entry point
│   │   ├── App.tsx                     # Root component with routing
│   │   ├── pages/
│   │   │   ├── EmployeeList.tsx        # Employee list with filters
│   │   │   ├── EmployeeForm.tsx        # Add/Edit employee form
│   │   │   └── Analytics.tsx           # Analytics dashboard
│   │   ├── components/
│   │   │   ├── ui/                     # shadcn/ui components
│   │   │   ├── EmployeeTable.tsx       # Reusable employee table
│   │   │   ├── SalaryCharts.tsx        # Chart components
│   │   │   └── Layout.tsx              # App layout wrapper
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client with axios
│   │   │   ├── types.ts                # TypeScript types
│   │   │   └── utils.ts                # Helper functions
│   │   ├── hooks/
│   │   │   └── useEmployees.ts         # Custom React hooks
│   │   └── styles/
│   │       └── globals.css             # Global styles
│   ├── tests/
│   │   └── components/                 # Component tests
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── docs/
    └── IMPLEMENTATION_PLAN.md          # Detailed implementation guide
```

### Architecture Highlights

**Backend:**

- **Layered Architecture**: Separation of routes, services, and data access layers
- **Prisma ORM**: Type-safe database queries with automatic migrations
- **Middleware Pattern**: Reusable validation and error handling
- **Service Layer**: Business logic separated from HTTP concerns
- **Database Indexing**: Optimized queries with strategic indexes

**Frontend:**

- **Component-Based**: Modular, reusable React components
- **Custom Hooks**: Reusable state logic and API interactions
- **Type Safety**: End-to-end TypeScript for reliability
- **Clean Separation**: Pages, components, and utilities clearly organized

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/salary-manager.git
   cd salary-manager
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env` file in the backend directory:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   The default configuration uses SQLite:
   ```
   DATABASE_URL="file:./dev.db"
   PORT=3000
   NODE_ENV=development
   ```

4. **Initialize Database**

   Run Prisma migrations to create the database schema:
   ```bash
   cd backend
   npm run db:migrate
   ```
   
   This will:
   - Create the SQLite database (`dev.db`)
   - Apply the schema with all tables and indexes
   - Generate the Prisma Client

5. **Verify Database Connection**

   ```bash
   npm run db:init
   ```
   
   You should see: `✅ Database connection established`

6. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

7. **Seed Database with Sample Data**
   ```bash
   cd backend
   npm run seed
   ```
   This seeds 10,000 employee records in under 5 seconds.

### Development

1. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Server runs on `http://localhost:3000`

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   Application runs on `http://localhost:5173`

### Database Management

The project uses Prisma ORM for database management. Available commands:

```bash
cd backend

# Initialize and verify database connection
npm run db:init

# Create a new migration after schema changes
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client (after schema changes)
npm run db:generate

# Seed database with sample data
npm run db:seed

# Deploy migrations to production
npm run db:migrate:deploy
```

**Prisma Studio**: Run `npm run db:studio` to open a visual database browser at `http://localhost:5555`

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```
