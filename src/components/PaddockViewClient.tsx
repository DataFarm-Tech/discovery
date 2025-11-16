'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import DeviceTable, { Device } from './DeviceTable';
import { getPaddockDevices } from '@/lib/paddock';

export default function PaddockViewClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const paddockId = searchParams.get('paddockId');

  const router = useRouter();

  useEffect(() => {
  if (!paddockId) return;

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token') || '';
      const result = await getPaddockDevices(paddockId, token);

      if (!result.success) {
        throw new Error(result.message);
      }

      const mappedDevices: Device[] = result.devices.map((d: any) => ({
        node_id: d.node_id,
        node_name: d.node_name,
        battery: d.battery,
      }));

      setDevices(mappedDevices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchDevices();
}, [paddockId]);


  const handleAddDevice = () => {
    if (paddockId) {
      router.push(`/device/create?paddockId=${paddockId}`);
    }
  };

  const handleDeviceClick = (device: Device) => {
    router.push(`/device/view?nodeId=${device.node_id}`);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col justify-start items-center overflow-y-auto space-y-6 w-full">
        {paddockId ? (
          <>
            {loading && <p className="text-gray-400">Loading devices...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <DeviceTable
                devices={devices}
                onAddDevice={handleAddDevice}
                onDeviceClick={handleDeviceClick}
              />
            )}
          </>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}
      </div>
    </main>
  );
}
