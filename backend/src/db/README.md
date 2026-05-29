# Database Setup

This project uses Prisma ORM with PostgreSQL for database management.

## Schema

The database schema is defined in `prisma/schema.prisma` with the following model:

### Employee Model

- `id`: Auto-incrementing primary key
- `fullName`: Full name of the employee
- `firstName`: First name
- `lastName`: Last name
- `jobTitle`: Job title/position
- `country`: Country of employment
- `salary`: Salary amount (Float)
- `department`: Department (optional)
- `hireDate`: Date of hire
- `employmentType`: Employment type (Full-time/Part-time/Contract)
- `createdAt`: Timestamp of record creation
- `updatedAt`: Timestamp of last update

### Indexes

- Single index on `country` for efficient country-based queries
- Single index on `jobTitle` for efficient job title queries
- Compound index on `(country, jobTitle)` for combined queries

## Available Commands

```bash
# Initialize and verify database connection
npm run db:init

# Create a new migration (development)
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Push schema changes without creating migration
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma Client
npm run db:generate

# Seed database with sample data
npm run db:seed
```

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` (if exists)
   - Or ensure `DATABASE_URL` is set in `.env`:
     ```
     DATABASE_URL="file:./dev.db"
     ```

3. Run initial migration:

   ```bash
   npm run db:migrate
   ```

4. Verify connection:

   ```bash
   npm run db:init
   ```

5. (Optional) Seed with sample data:
   ```bash
   npm run db:seed
   ```

## Database Client Usage

Import the Prisma client in your code:

```typescript
import prisma from './db/client.js';

// Example: Find all employees
const employees = await prisma.employee.findMany();

// Example: Create an employee
const newEmployee = await prisma.employee.create({
  data: {
    fullName: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    jobTitle: 'Software Engineer',
    country: 'USA',
    salary: 100000,
    department: 'Engineering',
    hireDate: new Date(),
    employmentType: 'Full-time',
  },
});

// Example: Update an employee
const updated = await prisma.employee.update({
  where: { id: 1 },
  data: { salary: 110000 },
});

// Example: Delete an employee
await prisma.employee.delete({
  where: { id: 1 },
});
```

## Migrations

Migrations are stored in `prisma/migrations/`. Each migration contains:

- `migration.sql`: SQL commands to apply the migration
- Timestamp and name for tracking

To create a new migration after schema changes:

```bash
npm run db:migrate
```

## Production Considerations

For production deployment:

1. Use `DATABASE_URL` environment variable to point to production PostgreSQL database
2. Run `npm run db:migrate:deploy` to apply migrations
3. Consider using a managed PostgreSQL service (e.g., Render, Supabase, Neon)
4. Ensure proper backup strategy is in place

## Troubleshooting

### Connection Issues

- Verify `.env` file exists and contains `DATABASE_URL`
- Check file permissions on the database file
- Run `npm run db:init` to test connection

### Migration Issues

- If migrations fail, check `prisma/migrations/` for errors
- Use `npx prisma migrate reset` to reset database (⚠️ deletes all data)
- Use `npx prisma db push` to sync schema without migration

### Schema Changes

After modifying `prisma/schema.prisma`:

1. Run `npm run db:migrate` to create migration
2. Run `npm run db:generate` to update Prisma Client
3. Restart your development server
