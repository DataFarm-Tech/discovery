'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Paddock {
  name: string;
}

interface Device {
  name: string;
  battery: number;
  version: string;
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
    <main className="min-h-screen bg-[#0c1220] px-4 sm:px-6 md:px-8 py-6 sm:py-8 text-white">
      {/* Header */}
      <header className="mb-8 flex justify-between items-center border-b border-white pb-4">
        {/* Hamburger Menu */}
        <div className="flex items-center">
          <button
            className="text-white/80 hover:text-white transition focus:outline-none"
            title="Menu"
            onClick={() => {
              toast('Menu clicked!'); // Placeholder for menu logic
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Notifications & Logout */}
        <div className="flex items-center gap-4 relative">
          {/* Bell / Notifications */}
          <button
            className="text-white/80 hover:text-white transition relative"
            title="Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {/* Notification badge */}
            <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/');
            }}
            className="px-3 py-1 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {userName} 🌾
        </h1>
        <p className="mt-1 text-lg text-white/80">
          Here’s your farm dashboard.
        </p>
      </div>

      {/* Main Content */}
      <section className="flex flex-col md:flex-row gap-6">
        {/* Paddocks Table */}
        <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 sm:p-6 flex-none max-w-xs w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold text-white">Paddocks</h2>
            <button
              onClick={handleCreatePaddock}
              className="px-3 sm:px-4 py-2 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition text-sm sm:text-base"
            >
              Create
            </button>
          </div>

          <table className="w-full text-left table-fixed divide-y divide-gray-400">
            <thead>
              <tr>
                <th className="px-2 py-1 font-semibold text-sm text-white w-1/3">Name</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {paddocks.length ? (
                paddocks.map((paddock, index) => (
                  <tr key={index} className="hover:bg-white/10 transition">
                    <td className="px-2 py-1">{paddock.name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-2 py-1 text-white/60">No paddocks yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Devices Table */}
        <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-4 sm:p-6 flex-1 w-full">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl font-semibold text-white">Devices</h2>
            <button
              onClick={handleCreateDevice}
              className="px-3 sm:px-4 py-2 bg-[#00be64] text-white font-semibold rounded hover:bg-[#009e53] transition text-sm sm:text-base"
            >
              Create Device
            </button>
          </div>

          <table className="w-full text-left table-fixed divide-y divide-gray-400">
            <thead>
              <tr>
                <th className="px-2 py-1 font-semibold text-sm text-white w-1/6">Name</th>
                <th className="px-2 py-1 font-semibold text-sm text-white w-1/2">Battery</th>
                <th className="px-2 py-1 font-semibold text-sm text-white w-1/4">Version</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {devices.length ? (
                devices.map((device, index) => (
                  <tr key={index} className="hover:bg-white/10 transition">
                    <td className="px-2 py-1">{device.name}</td>
                    <td className="px-2 py-1">
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
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
                      <span className="text-xs mt-1 block">{device.battery}%</span>
                    </td>
                    <td className="px-2 py-1">{device.version}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-2 py-1 text-white/60">
                    No devices yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
