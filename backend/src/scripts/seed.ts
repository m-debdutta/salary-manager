import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../db/client.js';
import { pick, randomInt, randomDate } from '../utils/seedHelpers.js';

// ── helpers ────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
// Seed-only files (names) live in backend/data; shared lookup data lives at repo root /data
const SEED_DATA_DIR = join(__dirname, '../../data');
const SHARED_DATA_DIR = join(__dirname, '../../../data');

function loadLines(filename: string): string[] {
  return readFileSync(join(SEED_DATA_DIR, filename), 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(SHARED_DATA_DIR, filename), 'utf-8')) as T;
}

// ── shared data types ──────────────────────────────────────────────────────────

interface Country {
  name: string;
  multiplier: number;
}

interface Department {
  name: string;
  jobTitles: string[];
}

interface JobTitle {
  name: string;
  minSalary: number;
  maxSalary: number;
}

// ── main ───────────────────────────────────────────────────────────────────────

const TOTAL = 10_000;
const BATCH_SIZE = 500;

async function seed() {
  const firstNames = loadLines('first_names.txt');
  const lastNames = loadLines('last_names.txt');
  const countries = loadJson<Country[]>('countries.json');
  const departments = loadJson<Department[]>('departments.json');
  const jobTitles = loadJson<JobTitle[]>('job_titles.json');
  const employmentTypes = loadJson<string[]>('employment_types.json');

  // Build lookup maps from the JSON data
  const salaryByTitle = new Map(
    jobTitles.map((jt) => [jt.name, [jt.minSalary, jt.maxSalary] as [number, number]])
  );
  const multiplierByCountry = new Map(countries.map((c) => [c.name, c.multiplier]));
  const countryNames = countries.map((c) => c.name);

  console.log(
    `Loaded: ${firstNames.length} names, ${countries.length} countries, ${departments.length} depts, ${jobTitles.length} titles`
  );

  // Check existing count – skip if already seeded
  // Comment this part if you want to always reseed (it will delete existing records if any)
  const existing = await prisma.employee.count();
  if (existing >= TOTAL) {
    console.log(`Already seeded (${existing} records). Skipping.`);
    await prisma.$disconnect();
    return;
  }

  // Comment this part if you want to keep existing records and just add more (it will add on top of existing records)
  if (existing > 0) {
    console.log(`Clearing ${existing} existing records…`);
    await prisma.employee.deleteMany();
  }

  const hireStart = new Date('2015-01-01');
  const hireEnd = new Date('2025-12-31');

  const startTime = Date.now();
  let inserted = 0;

  for (let batchIndex = 0; batchIndex < Math.ceil(TOTAL / BATCH_SIZE); batchIndex++) {
    const remaining = TOTAL - inserted;
    const batchSize = Math.min(BATCH_SIZE, remaining);

    const records = Array.from({ length: batchSize }, () => {
      const dept = pick(departments);
      const jobTitle = pick(dept.jobTitles);
      const country = pick(countryNames);
      const [min, max] = salaryByTitle.get(jobTitle) ?? [50_000, 100_000];
      const multiplier = multiplierByCountry.get(country) ?? 0.7;
      const salary = Math.round(randomInt(min, max) * multiplier);

      return {
        firstName: pick(firstNames),
        lastName: pick(lastNames),
        jobTitle,
        country,
        salary,
        department: dept.name,
        hireDate: randomDate(hireStart, hireEnd),
        employmentType: pick(employmentTypes),
      };
    });

    await prisma.employee.createMany({ data: records });
    inserted += batchSize;

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    process.stdout.write(`\r${inserted}/${TOTAL} (${elapsed}s)`);
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\nDone. Seeded ${inserted} employees in ${totalTime}s`);
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  prisma.$disconnect();
  process.exit(1);
});
