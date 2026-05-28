import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '../../../../data');
const SEED_DATA_DIR = join(__dirname, '../../../data');

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf-8')) as T;
}

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

describe('countries.json', () => {
  const countries = loadJson<Country[]>('countries.json');

  it('is a non-empty array', () => {
    expect(Array.isArray(countries)).toBe(true);
    expect(countries.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty name', () => {
    countries.forEach(({ name }) => expect(name.trim().length).toBeGreaterThan(0));
  });

  it('every multiplier is a number between 0 and 1', () => {
    countries.forEach(({ name, multiplier }) => {
      expect(typeof multiplier, name).toBe('number');
      expect(multiplier, name).toBeGreaterThan(0);
      expect(multiplier, name).toBeLessThanOrEqual(1);
    });
  });

  it('has no duplicate country names', () => {
    const names = countries.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('departments.json', () => {
  const departments = loadJson<Department[]>('departments.json');

  it('is a non-empty array', () => {
    expect(Array.isArray(departments)).toBe(true);
    expect(departments.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty name', () => {
    departments.forEach(({ name }) => expect(name.trim().length).toBeGreaterThan(0));
  });

  it('every department has a non-empty jobTitles array', () => {
    departments.forEach(({ name, jobTitles }) => {
      expect(Array.isArray(jobTitles), name).toBe(true);
      expect(jobTitles.length, name).toBeGreaterThan(0);
    });
  });

  it('has no duplicate department names', () => {
    const names = departments.map((d) => d.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('job_titles.json', () => {
  const jobTitles = loadJson<JobTitle[]>('job_titles.json');

  it('is a non-empty array', () => {
    expect(Array.isArray(jobTitles)).toBe(true);
    expect(jobTitles.length).toBeGreaterThan(0);
  });

  it('every entry has a non-empty name', () => {
    jobTitles.forEach(({ name }) => expect(name.trim().length).toBeGreaterThan(0));
  });

  it('every entry has minSalary < maxSalary', () => {
    jobTitles.forEach(({ name, minSalary, maxSalary }) => {
      expect(minSalary, name).toBeGreaterThan(0);
      expect(maxSalary, name).toBeGreaterThan(minSalary);
    });
  });

  it('has no duplicate job title names', () => {
    const names = jobTitles.map((jt) => jt.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('employment_types.json', () => {
  const types = loadJson<string[]>('employment_types.json');

  it('is a non-empty array of strings', () => {
    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBeGreaterThan(0);
    types.forEach((t) => expect(typeof t).toBe('string'));
  });
});

describe('cross-file integrity', () => {
  const departments = loadJson<Department[]>('departments.json');
  const jobTitles = loadJson<JobTitle[]>('job_titles.json');

  it('every job title referenced in departments.json exists in job_titles.json', () => {
    const titleSet = new Set(jobTitles.map((jt) => jt.name));
    departments.forEach(({ name: dept, jobTitles: titles }) => {
      titles.forEach((title) => {
        expect(
          titleSet.has(title),
          `"${title}" in dept "${dept}" missing from job_titles.json`
        ).toBe(true);
      });
    });
  });
});

describe('seed name files', () => {
  function loadLines(file: string): string[] {
    return readFileSync(join(SEED_DATA_DIR, file), 'utf-8')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  }

  it('first_names.txt has at least 100 entries', () => {
    expect(loadLines('first_names.txt').length).toBeGreaterThanOrEqual(100);
  });

  it('last_names.txt has at least 100 entries', () => {
    expect(loadLines('last_names.txt').length).toBeGreaterThanOrEqual(100);
  });
});
