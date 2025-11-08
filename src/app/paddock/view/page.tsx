'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';

export default function PaddockViewPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const searchParams = useSearchParams();
  const paddockId = searchParams.get('paddockId');

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader userName="Lucas" menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 flex justify-center items-center">
        {paddockId ? (
          <Link
            href={`/device/create?paddockId=${paddockId}`}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-md transition-colors"
          >
            Create New Device
          </Link>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}
      </div>
    </main>
  );
}
