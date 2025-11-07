'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import DashboardHeader from '@/components/DashboardHeader';
import Sidebar from '@/components/Sidebar';
import StatsTile from '@/components/StatsTile';
import DeviceTable from '@/components/DeviceTable';

import { Device } from '@/components/DeviceTable';  // Add this line to import Device
// import PaddockTable from '@/components/PaddockTable'; // Import PaddockTable component
import GraphCarousel from '@/components/GraphCarousel'; // Make sure it's imported correctly

const DeviceMap = dynamic(() => import('@/components/DeviceMap'), { ssr: false });

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first!');
      router.push('/');
    } else {
      setUserName('Lucas');
      setDevices([]);
    }
  }, [router]);

  // Function to handle adding a new device
  const handleAddDevice = () => {
    // Example device to add
    const newDevice: Device = { name: 'New Device', battery: 100 };
    setDevices((prevDevices) => [...prevDevices, newDevice]);
    console.log('Device added:', newDevice);
  };

  return (
    <main className="min-h-screen bg-[#0c1220] px-6 py-8 text-white relative">
      {/* Header */}
      <DashboardHeader userName={userName} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Sidebar Menu */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Welcome back, {userName} 🌾</h2>
      </div>

      {/* Stats Tiles - Average pH, Temperature, Nitrogen */}
      <section className="flex flex-col lg:flex-row gap-6 mb-6">
        <StatsTile title="pH (Average)" value={6.5} className="w-full sm:w-[48%] lg:w-[30%]" />
        <StatsTile title="Temperature (Average)" value={22} unit="°C" className="w-full sm:w-[48%] lg:w-[30%]" />
        <StatsTile title="Nitrogen (Average)" value={12} unit="ppm" className="w-full sm:w-[48%] lg:w-[30%]" />
      </section>

      {/* Layout for Map and Graph */}
      <section className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Device Map Section */}
        <section className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 sm:p-6 w-full lg:w-1/2">
          <h2 className="text-xl font-semibold mb-4 text-white">Device Locations</h2>
          <DeviceMap />
        </section>

        {/* Graph Section */}
        <section className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-6 w-full lg:w-1/2">
          <h2 className="text-xl font-semibold mb-4 text-white">Graphs</h2>
          <GraphCarousel />
        </section>
      </section>

      {/* Device Table Section */}
      <section className="mt-8 flex flex-col lg:flex-row gap-6">
        {/* Pass `handleAddDevice` to DeviceTable */}
        <DeviceTable devices={devices} onAddDevice={handleAddDevice} />
      </section>
    </main>
  );
}
