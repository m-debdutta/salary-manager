# Implementation Plan: Salary Management System

## TL;DR

Build a production-ready salary management tool for 10,000 employees with CRUD operations and analytics. Use **Node.js + Express + SQLite** backend and **Vite + React + shadcn/ui** frontend. Deploy to Vercel. Emphasize high-performance seeding (<5s for 10k records), comprehensive test coverage, and incremental commits showing evolution.

**Development Approach**: Follow **Test-Driven Development (TDD)** - write tests before or alongside implementation. Each component/API is considered complete only when unit tests are included.

---

## Architecture Overview

**Backend** (Node.js + Express):

- RESTful API with Express.js
- SQLite database with proper schema and indexing
- Input validation and error handling
- Business logic for salary analytics

**Frontend** (Vite + React):

- Modern React with TypeScript
- shadcn/ui component library
- Form management and validation
- Data visualization for insights

---

## Test-Driven Development (TDD) Approach

**Core Principle**: Write tests before or alongside implementation. No component or API endpoint is considered complete without corresponding unit tests.

**TDD Workflow**:

1. **Red**: Write a failing test that defines the desired functionality
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests passing

**Testing Framework**:

- Backend: Vitest + Supertest (API testing)
- Frontend: Vitest + React Testing Library
- Coverage target: >80% across all modules

**Completion Criteria**: A feature is complete when:

- ✅ Implementation is functional
- ✅ Unit tests are written and passing
- ✅ Test coverage meets minimum threshold (>80%)
- ✅ Edge cases and error scenarios are tested

---

## Database Schema

**employees table**:

- id (INTEGER PRIMARY KEY AUTOINCREMENT)
- first_name (TEXT NOT NULL)
- last_name (TEXT NOT NULL)
- job_title (TEXT NOT NULL)
- country (TEXT NOT NULL)
- salary (DECIMAL NOT NULL)
- department (TEXT) - additional meaningful field
- hire_date (DATE) - additional meaningful field
- employment_type (TEXT) - Full-time/Part-time/Contract
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

**Note**: Full name is computed dynamically from `first_name` and `last_name` to avoid data redundancy.

**Indexes**:

- country (for salary by country queries)
- job_title (for salary by job title queries)
- compound index on (country, job_title)

---

## Implementation Steps

### Phase 1: Project Setup & Infrastructure

1. Initialize backend project structure (Node.js + Express + TypeScript)
   - Setup package.json, tsconfig.json, eslint, prettier
   - Install dependencies: express, sqlite3/better-sqlite3, zod (validation)
   - **Setup testing framework**: Vitest, Supertest, @vitest/ui
   - Create initial test structure and configuration
2. Initialize frontend project structure (Vite + React + TypeScript) - _parallel with step 1_
   - Setup Vite config, shadcn/ui integration
   - Install dependencies: react-query, react-router-dom, zod, axios
   - **Setup testing framework**: Vitest, React Testing Library, @testing-library/jest-dom
   - Create test utilities and mock setup
3. Setup database schema and migrations
   - Create database initialization script
   - Define employee table with indexes
   - **Write tests** for database connection and schema validation
4. Create first_names.txt and last_names.txt with realistic data
   - ~500 first names, ~500 last names for variety

### Phase 2: Backend Core - API Endpoints

5. Implement Employee CRUD API endpoints **with tests**
   - **TDD Cycle for each endpoint**:
     - a. Write test for POST /api/employees (create) - test validation, success, errors
     - b. Implement POST endpoint to pass tests
     - c. Write test for GET /api/employees (list with pagination, filters)
     - d. Implement GET endpoint to pass tests
     - e. Write test for GET /api/employees/:id (get single)
     - f. Implement GET endpoint to pass tests
     - g. Write test for PUT /api/employees/:id (update)
     - h. Implement PUT endpoint to pass tests
     - i. Write test for DELETE /api/employees/:id (delete)
     - j. Implement DELETE endpoint to pass tests
   - **Test coverage must include**:
     - Valid input scenarios
     - Invalid input scenarios (validation errors)
     - Edge cases (empty lists, non-existent IDs)
     - Pagination and filtering logic
     - Error responses (400, 404, 500)
   - Input validation with Zod
   - **Completion criteria**: All CRUD tests passing, >80% coverage
6. Implement Analytics API endpoints **with tests** - _depends on 5_
   - **TDD Cycle for each analytics endpoint**:
     - a. Write tests for GET /api/analytics/salary-by-country
     - b. Implement endpoint to pass tests
     - c. Write tests for GET /api/analytics/salary-by-job-title
     - d. Implement endpoint to pass tests
     - e. Write tests for GET /api/analytics/salary-distribution
     - f. Implement endpoint to pass tests
     - g. Write tests for GET /api/analytics/department-summary
     - h. Implement endpoint to pass tests
     - i. Write tests for GET /api/analytics/overview
     - j. Implement endpoint to pass tests
   - **Test coverage must include**:
     - Correct calculation of min/max/avg/median salaries
     - Grouping by country, job title, department
     - Empty dataset scenarios
     - Filter parameter validation
   - **Completion criteria**: All analytics tests passing, >80% coverage
7. Add error handling middleware and logging
   - **Write tests** for error handler (various error types, response format)
   - Implement error handling middleware
   - **Completion criteria**: Error handling tests passing

   - **Completion criteria**: Error handling tests passing

### Phase 3: High-Performance Seed Script

8. Create seed script with performance optimizations **and tests**
   - **Write tests first**:
     - Test batch insert functionality
     - Test transaction rollback on error
     - Test data generation (realistic names, salaries)
     - Test idempotency (running twice doesn't duplicate)
     - Test performance benchmark (<5s for 10k records)
   - **Implement seed script**:
     - Batch inserts (chunks of 500-1000 records)
     - Use transactions for atomicity
     - Progress indicators
     - Idempotent (can run multiple times safely)
     - Generate realistic data: random countries (15-20), job titles (20-30), departments (8-12)
     - Salary ranges based on job title/country
   - **Completion criteria**: All seed tests passing, performance target met (<5s)

### Phase 4: Frontend - Employee Management UI

9. Setup routing and layout components **with tests**
   - **Write tests** for routing configuration
   - **Write tests** for layout components (navigation, header)
   - Implement main layout with navigation
   - Implement routes: employees list, add, edit, analytics
   - **Completion criteria**: Routing and layout tests passing
10. Implement Employee List view **with tests** - _depends on 9_
    - **Write tests first**:
      - Test table rendering with mock data
      - Test pagination controls
      - Test sorting functionality
      - Test search/filter inputs
      - Test action buttons (edit, delete)
      - Test empty state
      - Test loading state
    - **Implement Employee List**:
      - Table with pagination, sorting, search/filter
      - Actions: view, edit, delete
      - Use shadcn/ui Table, Input, Button components
    - **Completion criteria**: All Employee List tests passing
11. Implement Add/Edit Employee forms **with tests** - _depends on 9_
    - **Write tests first**:
      - Test form validation (all fields)
      - Test form submission with valid data
      - Test form submission with invalid data
      - Test error display
      - Test success notification
      - Test pre-population in edit mode
    - **Implement forms**:
      - Form validation with react-hook-form + zod
      - Country and job title dropdowns
      - Date picker for hire_date
      - Success/error notifications
    - **Completion criteria**: All form tests passing, validation works
12. Implement Delete confirmation dialog **with tests**
    - **Write tests** for dialog open/close, confirm/cancel actions
    - Implement dialog component
    - **Completion criteria**: Delete dialog tests passing

### Phase 5: Frontend - Analytics Dashboard

13. Create Analytics Dashboard layout **with tests** - _depends on 9_
    - **Write tests** for dashboard layout and card components
    - Implement card-based layout for key metrics
    - **Completion criteria**: Dashboard layout tests passing
14. Implement salary insights visualizations **with tests** - _depends on 13_
    - **Write tests for each visualization**:
      - Test data transformation for charts
      - Test chart rendering with mock data
      - Test empty data scenarios
      - Test error states
    - **Implement visualizations**:
      - Min/Max/Avg by country (table + bar chart)
      - Avg salary by job title in country (filterable table)
      - Salary distribution histogram
      - Top-paying departments
      - Employee count by country/department
      - Use recharts or chart.js for visualizations
    - **Completion criteria**: All visualization tests passing
15. Add filters and interactivity **with tests** - _depends on 14_
    - **Write tests** for filter components and state management
    - Implement country selector, job title filter
    - Implement date range for hire_date analytics
    - **Completion criteria**: Filter tests passing, interactions work

### Phase 6: Integration Testing & Quality

16. Add integration tests - _depends on all previous phases_
    - API integration tests (full request/response cycle)
    - E2E critical flows:
      - Add employee → Verify in list → Edit → Verify changes → Delete
      - View analytics → Apply filters → Verify filtered results
    - Test error scenarios (network errors, server errors)
    - **Completion criteria**: Integration tests passing
17. Performance testing
    - Verify seed script: <5s for 10,000 records
    - Memory profiling for large datasets
    - Frontend performance (render time for large tables)
    - **Completion criteria**: Performance benchmarks met
18. Code coverage verification
    - Run coverage reports for backend and frontend
    - Verify >80% coverage across all modules
    - Identify and test uncovered edge cases
    - **Completion criteria**: Coverage target met

    - **Completion criteria**: Coverage target met

### Phase 7: Deployment & Documentation

19. Setup deployment configuration
    - Backend: Vercel serverless or Docker container
    - Frontend: Vercel static hosting
    - Environment variables configuration
20. Deploy to production - _depends on 19_
    - Run seed script on production database
21. Create video demo - _depends on 20_
    - Show employee CRUD operations
    - Show analytics dashboard
    - Show performance of seed script
    - **Show test execution and coverage reports**
22. Documentation - _parallel with 19-21_
    - README with setup instructions
    - API documentation
    - Architecture decisions document
    - Commit planning notes and trade-offs
    - **Testing documentation** (how to run tests, coverage reports)

---

## Relevant Files & Structure

**Backend** (`/backend`):

- `src/index.ts` - Express server entry point
- `src/routes/employees.ts` - Employee CRUD routes
- `src/routes/analytics.ts` - Analytics routes
- `src/db/database.ts` - Database connection and initialization
- `src/db/schema.sql` - Database schema
- `src/services/employeeService.ts` - Business logic for employees
- `src/services/analyticsService.ts` - Business logic for analytics
- `src/middleware/validation.ts` - Request validation middleware
- `src/middleware/errorHandler.ts` - Error handling
- `src/scripts/seed.ts` - High-performance seed script
- `src/utils/dataGenerator.ts` - Helper for generating realistic data
- `tests/unit/` - Unit tests (services, utils, validation)
- `tests/integration/` - API integration tests
- `tests/setup.ts` - Test configuration and utilities
- `tests/fixtures/` - Test data and mocks
- `vitest.config.ts` - Vitest configuration
- `data/first_names.txt` - First names for seeding
- `data/last_names.txt` - Last names for seeding

**Frontend** (`/frontend`):

- `src/main.tsx` - Application entry point
- `src/App.tsx` - Root component with routing
- `src/pages/EmployeeList.tsx` - Employee list view
- `src/pages/EmployeeForm.tsx` - Add/Edit employee
- `src/pages/Analytics.tsx` - Analytics dashboard
- `src/components/ui/` - shadcn/ui components
- `src/components/EmployeeTable.tsx` - Reusable employee table
- `src/components/SalaryCharts.tsx` - Visualization components
- `src/lib/api.ts` - API client with axios
- `src/lib/types.ts` - TypeScript types/interfaces
- `src/hooks/useEmployees.ts` - React Query hooks for employees
- `src/hooks/useAnalytics.ts` - React Query hooks for analytics
- `tests/unit/` - Component unit tests
- `tests/integration/` - Integration tests
- `tests/setup.ts` - Test utilities and mocks
- `tests/__mocks__/` - Mock data and API responses
- `vitest.config.ts` - Vitest configuration

**Root**:

- `docs/architecture.md` - Architecture decisions
- `docs/api.md` - API documentation
- `docs/prompts.md` - AI prompts used during development
- `README.md` - Project overview and setup

---

## Verification Steps

**Note**: With TDD, most verification happens continuously during development. These steps are for final integration verification.

1. **Test Suite Execution**:
   - Run backend test suite: `npm test` in /backend
   - Run frontend test suite: `npm test` in /frontend
   - Verify all tests passing (unit + integration)
   - Generate and review coverage reports: `npm run test:coverage`
   - **Target**: >80% coverage, all tests green

2. **Seed Script Performance**:
   - Run seed script: `npm run seed`
   - Measure execution time (should be <5s for 10k records)
   - Verify data quality (realistic names, salary ranges)
   - Run multiple times to ensure idempotency
   - **Target**: <5 seconds, no errors

3. **Manual Integration Testing**:
   - End-to-end flow: Add → Edit → Delete employee
   - Test all CRUD operations via UI
   - Test forms with invalid data (validation)
   - Test analytics dashboard with filters
   - Verify analytics update after CRUD operations
   - Verify responsive design on mobile/tablet

4. **API Manual Testing** (supplement automated tests):
   - Manual API testing with curl/Postman for edge cases
   - Test pagination with various page sizes
   - Verify analytics calculations match expected results
   - Test error responses (400, 404, 500)

5. **Production Deployment**:
   - Deploy backend and frontend to Vercel
   - Run seed script in production
   - Run smoke tests on production URLs
   - Verify environment variables are set correctly

6. **Video Demo**:
   - Record demo showing:
     - Adding a new employee
     - Editing an employee
     - Viewing analytics dashboard
     - Filtering analytics by country/job title
     - Deleting an employee
     - Running seed script with performance metrics
     - **Running test suite with coverage report**

---

## Key Design Decisions

**Database Choice - SQLite**:

- Pros: Simple setup, no external dependencies, portable, sufficient for 10k records
- Cons: Limited concurrency, not ideal for high-traffic production
- For production: Consider migrating to PostgreSQL or using Turso (SQLite-compatible cloud)

**Separate Backend/Frontend**:

- Clear separation of concerns
- Independent deployment and scaling
- Backend can be reused for other clients (mobile app, etc.)

**Pagination Strategy**:

- Offset-based pagination for simplicity
- Page size: 50 employees per page
- Consider cursor-based pagination for better performance at scale

**Analytics Caching**:

- Implement simple in-memory cache for analytics queries
- TTL: 5 minutes (balance freshness vs performance)
- Invalidate on employee create/update/delete

**Seed Script Performance**:

- Batch inserts in transactions (500-1000 per batch)
- Use better-sqlite3 for synchronous, faster operations
- Disable foreign key checks during seeding
- Use prepared statements

**Component Library - shadcn/ui**:

- Modern, accessible, customizable
- Copy components into project (full control)
- Built on Radix UI primitives
- Tailwind CSS for styling

**Testing Strategy (TDD)**:

- **Approach**: Test-Driven Development - write tests before/alongside implementation
- **Unit tests**: Core business logic, validation, calculations (written first)
- **Integration tests**: API endpoints with test database (written alongside API development)
- **Component tests**: Forms, tables, charts (written alongside UI components)
- **E2E tests**: Critical user flows (optional, after core features)
- **Coverage target**: >80% code coverage
- **Frameworks**: Vitest (backend + frontend), Supertest (API), React Testing Library (UI)
- **Test isolation**: Each test uses fresh database/state, no shared state between tests
- **Mocking strategy**: Mock external dependencies (APIs), use real database for integration tests
- **Completion criteria**: Component/API is complete only when tests are passing

**Additional Meaningful Data**:

- Department: For organizational insights
- Hire date: For tenure analysis, cohort analysis
- Employment type: For workforce composition analysis

**Additional Meaningful Metrics**:

- Salary distribution (histogram by ranges)
- Top-paying departments
- Employee count by country/department
- Salary trends over hire date cohorts
- Median salary (more robust than average)

---

## Scope Boundaries

**Included**:

- Full CRUD for employees
- Comprehensive salary analytics
- High-performance seed script
- Production-quality code with **comprehensive test coverage**
- Unit tests for all components and APIs
- Integration tests for critical workflows
- Video demo (including test execution)
- Documentation and artifacts

**Excluded** (potential future enhancements):

- Authentication/authorization (HR manager login)
- Audit logs (tracking who changed what)
- Bulk import/export (CSV, Excel)
- Advanced analytics (ML-based insights, predictions)
- Email notifications
- Multi-currency support with conversion
- Role-based access control
- Performance reviews tied to employees

