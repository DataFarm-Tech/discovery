'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import DeviceForm from '@/components/DeviceForm';
import { updateDevice, UpdateDeviceRequest } from '@/lib/device';

export default function RegisterDevicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paddockIdFromQuery = searchParams.get('paddockId');

  // Ensure paddockId is always a number
  const paddockId = paddockIdFromQuery ? Number(paddockIdFromQuery) : undefined;

  const [loading, setLoading] = useState(false);

  const handleRegisterDevice = async (deviceData: UpdateDeviceRequest) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in first!');
        router.push('/');
        return;
      }

      const result = await updateDevice(deviceData, token);

      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  if (paddockId === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <p>Paddock ID is missing. Please go back and select a paddock.</p>
      </div>
    );
  }

  return (
    <DeviceForm
      onSubmit={handleRegisterDevice}
      loading={loading}
      returnLink="/dashboard"
      returnLinkText="Return to Dashboard"
      title="Register / Update Device"
      buttonText="Register Device"
      loadingText="Registering..."
      initialValues={{ paddock_id: paddockId }}
    />
  );
}
