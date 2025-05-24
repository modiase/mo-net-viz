import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as RA from 'fp-ts/ReadonlyArray';
import React from 'react';

interface DropdownProps {
  options?: readonly (string | { value: string; label: string })[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  optionFilter?: (option: string | { value: string; label: string }) => boolean;
  [key: string]: any;
}

const Dropdown: React.FC<DropdownProps> = ({
  options = [],
  value = '',
  onChange,
  placeholder = '-- Select an option --',
  className = '',
  optionFilter,
  ...props
}) => {
  return pipe(
    O.fromNullable(optionFilter),
    O.map((optionFilter) => options.filter(optionFilter)),
    O.getOrElse(() => options),
    RA.map((option) => (typeof option === 'object' ? option : { value: option, label: option })),
    (options) => (
      <select
        className={`px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400 transition-colors duration-200 cursor-pointer min-w-[200px] ${className}`}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        <option value="" className="text-gray-500">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    )
  );
};

export default Dropdown;
