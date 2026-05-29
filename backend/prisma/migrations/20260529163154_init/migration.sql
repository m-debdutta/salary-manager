-- CreateTable
CREATE TABLE "employees" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "job_title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL,
    "department" TEXT,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "employment_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "employees_country_idx" ON "employees"("country");

-- CreateIndex
CREATE INDEX "idx_job_title" ON "employees"("job_title");

-- CreateIndex
CREATE INDEX "idx_country_job_title" ON "employees"("country", "job_title");
