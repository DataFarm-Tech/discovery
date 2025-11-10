'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import DeviceTable, { Device } from './DeviceTable';

export default function PaddockViewClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const paddockId = searchParams.get('paddockId');

  useEffect(() => {
    if (!paddockId) return;

    const fetchDevices = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:8000/paddock/${paddockId}/devices`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Failed to load devices');
        }

        const mappedDevices: Device[] = data.devices.map((d: any) => ({
          node_id: d.node_id,
          node_name: d.node_name,
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
      window.location.href = `/device/create?paddockId=${paddockId}`;
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader userName="Lucas" menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 flex flex-col justify-start items-center overflow-y-auto space-y-6">
        {paddockId ? (
          <>
            {loading && <p className="text-gray-400">Loading devices...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <DeviceTable devices={devices} onAddDevice={handleAddDevice} />
            )}
          </>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}
      </div>
    </main>
  );
}
