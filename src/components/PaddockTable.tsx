// src/components/PaddockTable.tsx
'use client';

interface Paddock {
  name: string;
}

export default function PaddockTable({ paddocks }: { paddocks: Paddock[] }) {
  return (
    <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-6 flex-none max-w-xs w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Paddocks</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-1 font-semibold text-sm text-white">Name</th>
          </tr>
        </thead>
        <tbody>
          {paddocks.length ? (
            paddocks.map((p, i) => (
              <tr key={i} className="hover:bg-white/10 transition">
                <td className="py-1">{p.name}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-1 text-white/60">No paddocks yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
