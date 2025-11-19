'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DashboardHeader from './DashboardHeader';
import Sidebar from './Sidebar';
import DeviceTable, { Device } from './DeviceTable';
import { getPaddockDevices } from '@/lib/paddock';
import SoilHealthScore from "./SoilHealthScore";

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

        const mapped: Device[] = result.devices.map((d: any) => ({
          node_id: d.node_id,
          node_name: d.node_name,
          battery: d.battery,
        }));

        setDevices(mapped);
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
      
      {/* Header */}
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      {/* Sidebar */}
      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Page content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-6">

        {paddockId ? (
          <div className="w-full max-w-5xl space-y-8">

            {/* 🌱 Soil Health Section */}
            <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00be64]/10 to-transparent pointer-events-none" />

              <h2 className="text-2xl font-semibold mb-6 relative z-10">
                Soil Health Overview
              </h2>

              <div className="flex justify-center">
                <SoilHealthScore score={72} />
              </div>

              <p className="text-gray-400 text-center mt-6 max-w-xl mx-auto relative z-10">
                Soil health is calculated using microbial activity, organic matter,
                moisture balance, and nutrient availability from your active sensors.
              </p>
            </section>

            {/* 📡 Device list */}
            {/* <section className="bg-[#121829] border border-[#00be64]/20 rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Devices in this Paddock</h2> */}

              {loading && <p className="text-gray-400">Loading devices...</p>}
              {error && <p className="text-red-500">{error}</p>}

              {!loading && !error && (
                <DeviceTable
                  devices={devices}
                  onAddDevice={handleAddDevice}
                  onDeviceClick={handleDeviceClick}
                />
              )}
            {/* </section> */}

          </div>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}

      </div>
    </main>
  );
}
