/*
  Warnings:

  - You are about to drop the column `full_name` on the `employees` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "salary" REAL NOT NULL,
    "department" TEXT,
    "hire_date" DATETIME NOT NULL,
    "employment_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_employees" ("country", "created_at", "department", "employment_type", "first_name", "hire_date", "id", "job_title", "last_name", "salary", "updated_at") SELECT "country", "created_at", "department", "employment_type", "first_name", "hire_date", "id", "job_title", "last_name", "salary", "updated_at" FROM "employees";
DROP TABLE "employees";
ALTER TABLE "new_employees" RENAME TO "employees";
CREATE INDEX "employees_country_idx" ON "employees"("country");
CREATE INDEX "idx_job_title" ON "employees"("job_title");
CREATE INDEX "idx_country_job_title" ON "employees"("country", "job_title");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
