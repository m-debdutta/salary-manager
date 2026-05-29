import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmployeeFilters from '../../src/components/EmployeeFilters';

const noop = () => {};

const defaultProps = {
  search: '',
  setSearch: noop,
  debouncedSearch: '',
  department: '',
  setDepartment: noop,
  jobTitle: '',
  setJobTitle: noop,
  country: '',
  setCountry: noop,
  employmentType: '',
  setEmploymentType: noop,
  clearFilters: noop,
  total: 100,
  isLoading: false,
};

const renderFilters = (overrides: Partial<typeof defaultProps> = {}) =>
  render(<EmployeeFilters {...defaultProps} {...overrides} />);

describe('EmployeeFilters', () => {
  // ── Snapshot ──────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches loaded snapshot', () => {
      const { asFragment } = renderFilters();
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches loading snapshot', () => {
      const { asFragment } = renderFilters({ isLoading: true });
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Title and count ───────────────────────────────────────────────────────────
  describe('title and count', () => {
    it('renders the "Employees" section title', () => {
      renderFilters();
      expect(screen.getByText('Employees')).toBeInTheDocument();
    });

    it('shows the total count when not loading', () => {
      renderFilters({ total: 42 });
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('hides the total count while loading', () => {
      renderFilters({ isLoading: true, total: 42 });
      expect(screen.queryByText('42')).not.toBeInTheDocument();
    });

    it('shows 0 count when total is zero and not loading', () => {
      renderFilters({ total: 0 });
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  // ── Search input ──────────────────────────────────────────────────────────────
  describe('search input', () => {
    it('renders the search input', () => {
      renderFilters();
      expect(
        screen.getByRole('searchbox', { name: 'Search employees' }),
      ).toBeInTheDocument();
    });

    it('has the correct placeholder', () => {
      renderFilters();
      expect(screen.getByPlaceholderText('Search by name\u2026')).toBeInTheDocument();
    });

    it('reflects the search prop value', () => {
      renderFilters({ search: 'alice' });
      expect(screen.getByRole('searchbox', { name: 'Search employees' })).toHaveValue(
        'alice',
      );
    });

    it('calls setSearch when the user types', () => {
      const setSearch = vi.fn();
      renderFilters({ setSearch });
      fireEvent.change(screen.getByRole('searchbox', { name: 'Search employees' }), {
        target: { value: 'bob' },
      });
      expect(setSearch).toHaveBeenCalledWith('bob');
    });
  });

  // ── Department filter ─────────────────────────────────────────────────────────
  describe('department filter', () => {
    it('renders the department combobox with placeholder', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: 'All Departments' })).toBeInTheDocument();
    });

    it('reflects the selected department', () => {
      renderFilters({ department: 'Engineering' });
      expect(screen.getByRole('button', { name: 'Engineering' })).toBeInTheDocument();
    });

    it('calls setDepartment with empty string when "All Departments" is selected', () => {
      const setDepartment = vi.fn();
      renderFilters({ setDepartment });
      fireEvent.click(screen.getByRole('button', { name: 'All Departments' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'All Departments' }));
      expect(setDepartment).toHaveBeenCalledWith('');
    });

    it('calls setDepartment with the value when a department is selected', () => {
      const setDepartment = vi.fn();
      renderFilters({ setDepartment });
      fireEvent.click(screen.getByRole('button', { name: 'All Departments' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Engineering' }));
      expect(setDepartment).toHaveBeenCalledWith('Engineering');
    });
  });

  // ── Job title filter ──────────────────────────────────────────────────────────
  describe('job title filter', () => {
    it('renders the job title combobox with placeholder', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: 'All Job Titles' })).toBeInTheDocument();
    });

    it('reflects the selected job title', () => {
      renderFilters({ jobTitle: 'Software Engineer' });
      expect(
        screen.getByRole('button', { name: 'Software Engineer' }),
      ).toBeInTheDocument();
    });

    it('calls setJobTitle with empty string when "All Job Titles" is selected', () => {
      const setJobTitle = vi.fn();
      renderFilters({ setJobTitle });
      fireEvent.click(screen.getByRole('button', { name: 'All Job Titles' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'All Job Titles' }));
      expect(setJobTitle).toHaveBeenCalledWith('');
    });

    it('calls setJobTitle with the value when a job title is selected', () => {
      const setJobTitle = vi.fn();
      renderFilters({ setJobTitle });
      fireEvent.click(screen.getByRole('button', { name: 'All Job Titles' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Software Engineer' }));
      expect(setJobTitle).toHaveBeenCalledWith('Software Engineer');
    });
  });

  // ── Country filter ────────────────────────────────────────────────────────────
  describe('country filter', () => {
    it('renders the country combobox with placeholder', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: 'All Countries' })).toBeInTheDocument();
    });

    it('reflects the selected country', () => {
      renderFilters({ country: 'United States' });
      expect(screen.getByRole('button', { name: 'United States' })).toBeInTheDocument();
    });

    it('calls setCountry with empty string when "All Countries" is selected', () => {
      const setCountry = vi.fn();
      renderFilters({ setCountry });
      fireEvent.click(screen.getByRole('button', { name: 'All Countries' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'All Countries' }));
      expect(setCountry).toHaveBeenCalledWith('');
    });

    it('calls setCountry with the value when a country is selected', () => {
      const setCountry = vi.fn();
      renderFilters({ setCountry });
      fireEvent.click(screen.getByRole('button', { name: 'All Countries' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'United States' }));
      expect(setCountry).toHaveBeenCalledWith('United States');
    });
  });

  // ── Employment type filter ────────────────────────────────────────────────────
  describe('employment type filter', () => {
    it('renders the employment type combobox with placeholder', () => {
      renderFilters();
      expect(
        screen.getByRole('button', { name: 'All Employment Types' }),
      ).toBeInTheDocument();
    });

    it('reflects the selected employment type', () => {
      renderFilters({ employmentType: 'Full-time' });
      expect(screen.getByRole('button', { name: 'Full-time' })).toBeInTheDocument();
    });

    it('calls setEmploymentType with empty string when "All Employment Types" is selected', () => {
      const setEmploymentType = vi.fn();
      renderFilters({ setEmploymentType });
      fireEvent.click(screen.getByRole('button', { name: 'All Employment Types' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'All Employment Types' }));
      expect(setEmploymentType).toHaveBeenCalledWith('');
    });

    it('calls setEmploymentType with the value when an employment type is selected', () => {
      const setEmploymentType = vi.fn();
      renderFilters({ setEmploymentType });
      fireEvent.click(screen.getByRole('button', { name: 'All Employment Types' }));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Full-time' }));
      expect(setEmploymentType).toHaveBeenCalledWith('Full-time');
    });
  });

  // ── Clear filters ─────────────────────────────────────────────────────────────
  describe('clear filters', () => {
    it('renders the "Clear filters" button', () => {
      renderFilters();
      expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
    });

    it('calls clearFilters when the button is clicked', () => {
      const clearFilters = vi.fn();
      renderFilters({ clearFilters });
      fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
      expect(clearFilters).toHaveBeenCalledTimes(1);
    });
  });
});
