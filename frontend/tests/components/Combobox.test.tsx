import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Combobox } from '../../src/components/Combobox';

const FLAT_OPTIONS = ['Engineering', 'Product', 'Design'];
const GROUPS = [
  { label: 'Engineering', options: ['Software Engineer', 'Backend Developer'] },
  { label: 'Product', options: ['Product Manager', 'Business Analyst'] },
];

describe('Combobox', () => {
  // ── Snapshot ──────────────────────────────────────────────────────────────────
  describe('snapshot', () => {
    it('matches closed snapshot', () => {
      const { asFragment } = render(
        <Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />,
      );
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches open flat snapshot', () => {
      const { asFragment } = render(
        <Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(asFragment()).toMatchSnapshot();
    });

    it('matches open grouped searchable snapshot', () => {
      const { asFragment } = render(
        <Combobox value="" onChange={() => {}} groups={GROUPS} searchable />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(asFragment()).toMatchSnapshot();
    });
  });

  // ── Trigger ───────────────────────────────────────────────────────────────────
  describe('trigger', () => {
    it('shows placeholder when no value is set', () => {
      render(
        <Combobox
          value=""
          onChange={() => {}}
          placeholder="Pick one…"
          options={FLAT_OPTIONS}
        />,
      );
      expect(screen.getByRole('button')).toHaveTextContent('Pick one…');
    });

    it('shows the current value when one is set', () => {
      render(<Combobox value="Engineering" onChange={() => {}} options={FLAT_OPTIONS} />);
      expect(screen.getByRole('button')).toHaveTextContent('Engineering');
    });

    it('applies error class when hasError is true', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} hasError />);
      expect(screen.getByRole('button')).toHaveClass('form-input--error');
    });

    it('does not apply error class by default', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      expect(screen.getByRole('button')).not.toHaveClass('form-input--error');
    });
  });

  // ── Open / close ──────────────────────────────────────────────────────────────
  describe('open / close', () => {
    it('dropdown is not visible initially', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('opens when the trigger is clicked', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('closes when Escape is pressed on the trigger', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('closes on outside mousedown', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  // ── Flat options ──────────────────────────────────────────────────────────────
  describe('flat options', () => {
    it('renders all options when open', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      FLAT_OPTIONS.forEach((o) =>
        expect(screen.getByRole('option', { name: o })).toBeInTheDocument(),
      );
    });

    it('calls onChange with the selected value', () => {
      const onChange = vi.fn();
      render(<Combobox value="" onChange={onChange} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Product' }));
      expect(onChange).toHaveBeenCalledWith('Product');
    });

    it('closes after selecting an option', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Engineering' }));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('marks the current value as selected', () => {
      render(<Combobox value="Design" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('option', { name: 'Design' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('option', { name: 'Engineering' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });
  });

  // ── Grouped options ───────────────────────────────────────────────────────────
  describe('grouped options', () => {
    it('renders group labels', () => {
      render(<Combobox value="" onChange={() => {}} groups={GROUPS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Engineering')).toBeInTheDocument();
      expect(screen.getByText('Product')).toBeInTheDocument();
    });

    it('renders all options within their groups', () => {
      render(<Combobox value="" onChange={() => {}} groups={GROUPS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(
        screen.getByRole('option', { name: 'Software Engineer' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Product Manager' })).toBeInTheDocument();
    });

    it('calls onChange when a grouped option is selected', () => {
      const onChange = vi.fn();
      render(<Combobox value="" onChange={onChange} groups={GROUPS} />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.mouseDown(screen.getByRole('option', { name: 'Backend Developer' }));
      expect(onChange).toHaveBeenCalledWith('Backend Developer');
    });
  });

  // ── Search ────────────────────────────────────────────────────────────────────
  describe('search', () => {
    it('does not show a search input when searchable is not set', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows a search input when searchable is true', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} searchable />);
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('uses the searchPlaceholder prop', () => {
      render(
        <Combobox
          value=""
          onChange={() => {}}
          options={FLAT_OPTIONS}
          searchable
          searchPlaceholder="Find something…"
        />,
      );
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByPlaceholderText('Find something…')).toBeInTheDocument();
    });

    it('filters flat options by query', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} searchable />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'eng' } });
      expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument();
      expect(screen.queryByRole('option', { name: 'Product' })).not.toBeInTheDocument();
    });

    it('filters grouped options by query', () => {
      render(<Combobox value="" onChange={() => {}} groups={GROUPS} searchable />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'backend' } });
      expect(
        screen.getByRole('option', { name: 'Backend Developer' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: 'Product Manager' }),
      ).not.toBeInTheDocument();
    });

    it('shows "No results" when query matches nothing', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} searchable />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'zzz' } });
      expect(screen.getByText('No results')).toBeInTheDocument();
    });

    it('closes when Escape is pressed in the search input', () => {
      render(<Combobox value="" onChange={() => {}} options={FLAT_OPTIONS} searchable />);
      fireEvent.click(screen.getByRole('button'));
      fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });
});
