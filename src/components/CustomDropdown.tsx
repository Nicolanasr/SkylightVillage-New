"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  icon?: React.ReactNode;
  placeholder?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  icon,
  placeholder = "Select option",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest text-skylight-green mb-2">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-skylight-green shadow-sm hover:border-skylight-gold focus:outline-none transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-skylight-gold">{icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-skylight-gold transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 rounded-2xl border border-skylight-green/10 shadow-2xl overflow-hidden glassmorphic animate-scale-up max-h-60 overflow-y-auto">
          <div className="py-1.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs text-left transition-colors ${
                    option.disabled
                      ? "opacity-40 cursor-not-allowed text-gray-400 bg-gray-50/50"
                      : isSelected
                      ? "bg-skylight-green text-white font-bold"
                      : "text-skylight-green hover:bg-skylight-green-light"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-skylight-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
