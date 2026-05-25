'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Users } from 'lucide-react';
interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options',
  className = '',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleValue = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-border rounded-lg px-3 py-2 bg-white flex items-center justify-between text-left"
      >
        <div className="flex flex-wrap gap-2 flex-1">
        {selectedLabels.length > 0 ? (
          selectedLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-xs font-medium"
            >
              <Users size={12} />
              {label}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-400">
            {placeholder}
          </span>
        )}
      </div>

        <ChevronDown
          size={16}
          className={`transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-border bg-white shadow-lg max-h-64 overflow-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            options.map((option) => {
              const checked = selectedValues.includes(option.value);

              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleValue(option.value)}
                    className="h-4 w-4"
                  />

                  <span className="text-sm">
                    {option.label}
                  </span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}