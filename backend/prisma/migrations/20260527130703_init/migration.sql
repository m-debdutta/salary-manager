-- CreateTable
CREATE TABLE "employees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "full_name" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "employees_country_idx" ON "employees"("country");

-- CreateIndex
CREATE INDEX "idx_job_title" ON "employees"("job_title");

-- CreateIndex
CREATE INDEX "idx_country_job_title" ON "employees"("country", "job_title");
