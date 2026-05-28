import { useState, useRef, useEffect } from 'react';
import styles from './Combobox.module.css';

export interface ComboboxGroup {
  label: string;
  options: string[];
}

export interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  hasError?: boolean;
  searchable?: boolean;
  options?: string[];
  groups?: ComboboxGroup[];
}

export const Combobox = ({
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  hasError = false,
  searchable = false,
  options = [],
  groups = [],
}: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isGrouped = groups.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredOptions = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const filteredGroups = query
    ? groups
        .map((g) => ({
          ...g,
          options: g.options.filter((o) => o.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter((g) => g.options.length > 0)
    : groups;

  const isEmpty = isGrouped ? filteredGroups.length === 0 : filteredOptions.length === 0;

  const handleSelect = (option: string) => {
    onChange(option);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className={styles.combobox} ref={containerRef}>
      <button
        type="button"
        className={`form-input ${styles.trigger}${hasError ? ' form-input--error' : ''}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? '' : styles.placeholder}>{value || placeholder}</span>
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox">
          {searchable && (
            <div className={styles.searchWrap}>
              <input
                className={styles.search}
                type="text"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
                autoFocus
              />
            </div>
          )}
          <ul className={styles.list}>
            {isEmpty ? (
              <li className={styles.empty}>No results</li>
            ) : isGrouped ? (
              filteredGroups.map((group) => (
                <li key={group.label}>
                  <span className={styles.groupLabel}>{group.label}</span>
                  <ul>
                    {group.options.map((o) => (
                      <li
                        key={o}
                        role="option"
                        aria-selected={o === value}
                        className={`${styles.option}${o === value ? ` ${styles.optionSelected}` : ''}`}
                        onMouseDown={() => handleSelect(o)}
                      >
                        {o}
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            ) : (
              filteredOptions.map((o) => (
                <li
                  key={o}
                  role="option"
                  aria-selected={o === value}
                  className={`${styles.option}${o === value ? ` ${styles.optionSelected}` : ''}`}
                  onMouseDown={() => handleSelect(o)}
                >
                  {o}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
