// src/components/SearchBar.tsx
'use client';

export default function SearchBar() {
  return (
    <div className="flex-1 mx-4 max-w-lg"> {/* Change to max-w-lg for a larger width */}
      <input
        type="text"
        placeholder="Search..."
        className="w-full px-4 py-2 bg-[#2c3e50] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00be64] transition"
      />
    </div>
  );
}
