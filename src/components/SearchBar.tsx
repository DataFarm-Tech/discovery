'use client';

import { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  paddocks?: Array<{ paddock_id?: number; id?: number; paddock_name?: string; name?: string }>;
  devices?: Array<{ node_id: string; node_name: string }>;
  onItemSelect?: (item: any) => void;
}

export default function SearchBar({ 
  value, 
  onChange, 
  paddocks = [], 
  devices = [],
  onItemSelect 
}: SearchBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Combine paddocks and devices into searchable items
  const searchItems = [
    ...paddocks.map(p => ({ 
      id: `paddock-${p.paddock_id || p.id}`, 
      name: p.paddock_name || p.name || 'Unnamed Paddock', 
      type: 'paddock',
      data: p 
    })),
    ...devices.map(d => ({ 
      id: `device-${d.node_id}`, 
      name: d.node_name || d.node_id, 
      type: 'device',
      data: d 
    }))
  ];

  // Filter items based on search query
  const filteredItems = searchItems.filter(item =>
    item.name.toLowerCase().includes(value.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (newValue: string) => {
    onChange(newValue);
    setShowDropdown(newValue.length > 0);
  };

  const handleItemClick = (item: any) => {
    onChange(item.name);
    setShowDropdown(false);
    if (onItemSelect) {
      onItemSelect(item.data);
    }
  };

  return (
    <div ref={dropdownRef} className="flex-1 mx-4 max-w-lg relative">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search paddocks or devices..."
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value.length > 0 && setShowDropdown(true)}
          className="w-full px-4 py-2 bg-[#2c3e50] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00be64] transition"
        />

        {/* Clear Button */}
        {value && (
          <button
            onClick={() => {
              onChange('');
              setShowDropdown(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && filteredItems.length > 0 && (
        <div className="absolute w-full mt-2 bg-[#1a1f2e] rounded-lg border border-[#00be64]/30 shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="px-4 py-3 hover:bg-[#2c3e50] cursor-pointer transition-colors border-b border-gray-700 last:border-b-0 flex items-center gap-3"
            >
              {/* Icon based on type */}
              <div className={`p-2 rounded-lg ${
                item.type === 'paddock' 
                  ? 'bg-[#00be64]/20 text-[#00be64]' 
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {item.type === 'paddock' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                )}
              </div>

              <div className="flex-1">
                <div className="text-white font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-400 capitalize mt-0.5">
                  {item.type}
                </div>
              </div>

              {/* Arrow icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && value.length > 0 && filteredItems.length === 0 && (
        <div className="absolute w-full mt-2 bg-[#1a1f2e] rounded-lg border border-[#00be64]/30 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-6 text-center text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 mx-auto mb-2 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">No results found</p>
          </div>
        </div>
      )}
    </div>
  );
}