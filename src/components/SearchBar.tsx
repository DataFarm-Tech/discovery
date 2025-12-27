'use client';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-1 mx-4 max-w-lg">
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-[#2c3e50] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00be64] transition"
      />
    </div>
  );
}
