import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEmployeeFilters } from '../../src/hooks/useEmployeeFilters';

describe('useEmployeeFilters', () => {
  // ── Initial state ─────────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('returns empty strings for all filter values', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      expect(result.current.search).toBe('');
      expect(result.current.debouncedSearch).toBe('');
      expect(result.current.department).toBe('');
      expect(result.current.jobTitle).toBe('');
      expect(result.current.country).toBe('');
      expect(result.current.employmentType).toBe('');
    });
  });

  // ── setSearch ─────────────────────────────────────────────────────────────────
  describe('setSearch', () => {
    it('updates the search value immediately', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('alice'));
      expect(result.current.search).toBe('alice');
    });

    it('does not update debouncedSearch immediately', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('alice'));
      expect(result.current.debouncedSearch).toBe('');
    });
  });

  // ── debouncedSearch ───────────────────────────────────────────────────────────
  describe('debouncedSearch', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('updates debouncedSearch after 300ms', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('alice'));
      act(() => vi.advanceTimersByTime(300));
      expect(result.current.debouncedSearch).toBe('alice');
    });

    it('does not update debouncedSearch before 300ms has elapsed', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('alice'));
      act(() => vi.advanceTimersByTime(299));
      expect(result.current.debouncedSearch).toBe('');
    });

    it('trims whitespace from the debounced value', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('  alice  '));
      act(() => vi.advanceTimersByTime(300));
      expect(result.current.debouncedSearch).toBe('alice');
    });

    it('resets the timer when search changes before 300ms', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setSearch('a'));
      act(() => vi.advanceTimersByTime(200));
      act(() => result.current.setSearch('al'));
      act(() => vi.advanceTimersByTime(300));
      expect(result.current.debouncedSearch).toBe('al');
    });

    it('only reflects the latest value when search changes rapidly', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => {
        result.current.setSearch('a');
        result.current.setSearch('al');
        result.current.setSearch('ali');
      });
      act(() => vi.advanceTimersByTime(300));
      expect(result.current.debouncedSearch).toBe('ali');
    });
  });

  // ── setDepartment ─────────────────────────────────────────────────────────────
  describe('setDepartment', () => {
    it('updates the department value', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setDepartment('Engineering'));
      expect(result.current.department).toBe('Engineering');
    });
  });

  // ── setJobTitle ───────────────────────────────────────────────────────────────
  describe('setJobTitle', () => {
    it('updates the jobTitle value', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setJobTitle('Software Engineer'));
      expect(result.current.jobTitle).toBe('Software Engineer');
    });
  });

  // ── setCountry ────────────────────────────────────────────────────────────────
  describe('setCountry', () => {
    it('updates the country value', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setCountry('United States'));
      expect(result.current.country).toBe('United States');
    });
  });

  // ── setEmploymentType ─────────────────────────────────────────────────────────
  describe('setEmploymentType', () => {
    it('updates the employmentType value', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => result.current.setEmploymentType('Full-time'));
      expect(result.current.employmentType).toBe('Full-time');
    });
  });

  // ── clearFilters ──────────────────────────────────────────────────────────────
  describe('clearFilters', () => {
    it('resets all filter values to empty strings', () => {
      const { result } = renderHook(() => useEmployeeFilters());
      act(() => {
        result.current.setSearch('alice');
        result.current.setDepartment('Engineering');
        result.current.setJobTitle('Software Engineer');
        result.current.setCountry('United States');
        result.current.setEmploymentType('Full-time');
      });
      act(() => result.current.clearFilters());
      expect(result.current.search).toBe('');
      expect(result.current.department).toBe('');
      expect(result.current.jobTitle).toBe('');
      expect(result.current.country).toBe('');
      expect(result.current.employmentType).toBe('');
    });
  });
});
