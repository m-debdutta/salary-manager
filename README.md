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
- SQLite with indexing
- Zod for validation
- Jest for testing

### Frontend

- Vite + React with TypeScript
- shadcn/ui components
- React Router for navigation
- Recharts for data visualization
- Vitest + React Testing Library

## 💾 Database Schema

**Employees Table:**

- `id` - Primary key
- `first_name`, `last_name`, `full_name` - Employee names
- `job_title` - Position/role
- `country` - Work location
- `salary` - Annual salary (decimal)
- `department` - Department name
- `hire_date` - Date of hire
- `employment_type` - Full-time/Part-time/Contract
- `created_at`, `updated_at` - Timestamps

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
│   ├── src/
│   │   ├── index.ts                    # Express server entry point
│   │   ├── routes/
│   │   │   ├── employees.ts            # Employee CRUD routes
│   │   │   └── analytics.ts            # Analytics routes
│   │   ├── services/
│   │   │   ├── employeeService.ts      # Employee business logic
│   │   │   └── analyticsService.ts     # Analytics calculations
│   │   ├── db/
│   │   │   ├── database.ts             # Database connection & setup
│   │   │   └── queries.ts              # SQL queries & repository layer
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
│   ├── package.json
│   ├── tsconfig.json
│   └── database.db                     # SQLite database (gitignored)
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
- **Middleware Pattern**: Reusable validation and error handling
- **Repository Pattern**: Isolated database queries for maintainability
- **Service Layer**: Business logic separated from HTTP concerns

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

3. **Install Frontend Dependencies**

   ```bash
   cd frontend
   npm install
   ```

4. **Initialize Database & Seed Data**
   ```bash
   cd backend
   npm run seed
   ```
   This creates the database schema and seeds 10,000 employee records in under 5 seconds.

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

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```
