'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Paddock {
  name: string;
}

interface Device {
  name: string;
  battery: number; // Battery percentage
  version: string; // Software version
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [paddocks, setPaddocks] = useState<Paddock[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in first!');
      router.push('/');
    } else {
      setUserName('Lucas'); // Replace with API call if needed

      const savedPaddocks: Paddock[] = [
        { name: 'North Field' },
        { name: 'South Pasture' },
      ];
      setPaddocks(savedPaddocks);

      const savedDevices: Device[] = [
        { name: 'Irrigation Pump', battery: 80, version: 'v1.2.0' },
        { name: 'Soil Sensor', battery: 45, version: 'v2.1.3' },
        { name: 'Weather Station', battery: 70, version: 'v3.0.1' },
      ];
      setDevices(savedDevices);
    }
  }, [router]);

  const handleCreatePaddock = () => {
    toast.success('Let’s Create Your Paddock...');
    router.push('/paddock/create');
  };

  const handleCreateDevice = () => {
    toast.success('Let’s Create Your Device...');
    router.push('/device/create');
  };

  return (
    <main className="min-h-screen bg-[#0c1220] px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-[#0c1220]">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back, {userName} 🌾
        </h1>
        <p className="mt-3 sm:mt-5 text-base sm:text-lg text-white/80">
          Here’s your farm dashboard. Monitor and manage your paddocks and devices below.
        </p>
      </header>

      {/* Paddocks and Devices Tables */}
      <section className="flex flex-col md:flex-row gap-6">
        {/* Paddocks Table */}
        <div className="bg-[#e5e5e5] border border-gray-300 rounded-lg shadow p-4 sm:p-6 flex-none max-w-xs">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0c1220]">Paddocks</h2>
            <button
              onClick={handleCreatePaddock}
              className="px-3 sm:px-4 py-2 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition text-sm sm:text-base"
            >
              Create
            </button>
          </div>

          <table className="w-full text-left table-fixed divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-2 py-1 font-semibold text-sm text-[#0c1220]">Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {paddocks.map((paddock, index) => (
                <tr key={index} className="hover:bg-white/50 transition">
                  <td className="px-2 py-1 text-[#0c1220]">{paddock.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Devices Table */}
        <div className="bg-[#e5e5e5] border border-gray-300 rounded-lg shadow p-4 sm:p-6 flex-1 max-w-xl">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[#0c1220]">Devices</h2>
            <button
              onClick={handleCreateDevice}
              className="px-3 sm:px-4 py-2 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition text-sm sm:text-base"
            >
              Create Device
            </button>
          </div>

          <table className="w-full text-left table-fixed divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-2 py-1 font-semibold text-sm text-[#0c1220] w-1/3">Name</th>
                <th className="px-2 py-1 font-semibold text-sm text-[#0c1220] w-1/3">Battery</th>
                <th className="px-2 py-1 font-semibold text-sm text-[#0c1220] w-1/3">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {devices.map((device, index) => (
                <tr key={index} className="hover:bg-white/50 transition">
                  <td className="px-2 py-1 text-[#0c1220]">{device.name}</td>
                  <td className="px-2 py-1">
                    <div className="w-full bg-white/40 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${
                          device.battery > 60
                            ? 'bg-[#00be64]'
                            : device.battery > 30
                            ? 'bg-yellow-400'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${device.battery}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-[#0c1220] mt-1 block">{device.battery}%</span>
                  </td>
                  <td className="px-2 py-1 text-[#0c1220]">{device.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
