'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import StatsTile from '@/components/StatsTile';
import PaddockTable from '@/components/PaddockTable';
import { Device } from '@/components/DeviceTable';
import { Paddock } from '@/components/PaddockTable';
import GraphCarousel from '@/components/GraphCarousel';
import { getPaddocks } from '@/lib/paddock';

// Load DeviceMap dynamically (Leaflet needs browser APIs)
const DeviceMap = dynamic(() => import('@/components/DeviceMap'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first!');
      router.push('/');
    } else {
      setUserName('Lucas');
      setDevices([]);
      fetchPaddocks(token);
    }
  }, [router]);

  const fetchPaddocks = async (token: string) => {
    setLoading(true);
    try {
      const result = await getPaddocks(token);
      if (result.success) {
        setPaddocks(result.paddocks);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error fetching paddocks:', error);
      toast.error('Failed to load paddocks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    const newDevice: Device = { name: 'New Device', battery: 100 };
    setDevices((prevDevices) => [...prevDevices, newDevice]);
    console.log('Device added:', newDevice);
  };

  const handleAddPaddock = () => {
    router.push('/paddock');
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      {/* Header */}
      <DashboardHeader userName={userName} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      
      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Scrollable Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Tiles */}
        <section className="flex flex-col lg:flex-row gap-4 mb-4">
          <StatsTile title="pH (Average)" value={6.5} className="w-full sm:w-[48%] lg:w-[30%]" />
          <StatsTile title="Temperature (Average)" value={22} unit="°C" className="w-full sm:w-[48%] lg:w-[30%]" />
          <StatsTile title="Nitrogen (Average)" value={12} unit="ppm" className="w-full sm:w-[48%] lg:w-[30%]" />
        </section>

        {/* Paddock Table */}
        <section className="flex flex-col lg:flex-row gap-4 mb-4">
          {loading ? (
            <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 flex-1 w-full">
              <p className="text-white text-center">Loading paddocks...</p>
            </div>
          ) : (
            <PaddockTable paddocks={paddocks} onAddPaddock={handleAddPaddock} />
          )}
        </section>

        {/* Map and Graph Section */}
        <section className="flex flex-col lg:flex-row gap-4">
          {/* Device Map */}
          <section className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 flex flex-col w-full lg:w-1/2">
            <h2 className="text-lg font-semibold mb-3 text-white">Device Locations</h2>
            <div className="flex-1 min-h-[180px] overflow-hidden rounded-md">
              <DeviceMap />
            </div>
          </section>

          {/* Graph Carousel */}
          <section className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 flex flex-col w-full lg:w-1/2">
            <h2 className="text-lg font-semibold mb-3 text-white">Graphs</h2>
            <div className="flex-1 min-h-[180px] flex justify-center items-center">
              <GraphCarousel />
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
