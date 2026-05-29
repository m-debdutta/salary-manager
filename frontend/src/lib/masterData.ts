import departmentsData from '@data/departments.json';
import employmentTypesData from '@data/employment_types.json';
import countriesData from '@data/countries.json';
import jobTitlesData from '@data/job_titles.json';

export const DEPARTMENTS = departmentsData.map((d) => d.name).sort();

export const EMPLOYMENT_TYPES = employmentTypesData;

export const COUNTRIES = countriesData.map((c) => c.name).sort();

export const JOB_TITLE_GROUPS = departmentsData.map((d) => ({
  label: d.name,
  options: d.jobTitles,
}));

export const JOB_TITLES = jobTitlesData.map((jt) => jt.name).sort();
