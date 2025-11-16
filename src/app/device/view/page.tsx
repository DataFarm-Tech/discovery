'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Graph from '@/components/Graph';

interface DeviceReading {
  reading_type: string;
  reading_val: number;
  timestamp: string;
}

interface DeviceData {
  node_id: string;
  node_name: string;
  paddock_id: number;
  readings: DeviceReading[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DeviceViewPage() {
  const searchParams = useSearchParams();
  const nodeId = searchParams.get('nodeId');

  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeId) {
      setError('No device selected.');
      setLoading(false);
      return;
    }

    const fetchDeviceData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('You must be logged in to view this device.');
        }

        const res = await fetch(`${API_BASE_URL}/device/view/${nodeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Please go back and select a valid device.');
        }

        setDeviceData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceData();
  }, [nodeId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0c1220] text-white">
        <p className="text-xl">Loading device data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#0c1220] text-white px-6">
        <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>
        <p className="text-white/70 text-center">
          Please go back and select a valid device.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c1220] text-white px-6 py-6 flex flex-col items-center">
      <button
        onClick={() => window.history.back()}
        className="mb-6 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 transition"
      >
        ← Back to Devices
      </button>

      <h2 className="text-3xl font-bold mb-4">{deviceData?.node_name}</h2>

      {deviceData && deviceData.readings.length > 0 ? (
        <Graph
          title={`${deviceData.node_name} Readings`}
          data={deviceData.readings.map(r => ({
            x: r.timestamp,
            y: r.reading_val,
            type: r.reading_type
          }))}
        />
      ) : (
        <div className="mt-8 text-white/70 text-center">
          <p>No readings available for this device yet.</p>
        </div>
      )}
    </div>
  );
}
