'use client';

import dynamic from 'next/dynamic';

// Dynamically import the actual client page to avoid SSR
const RegisterDevicePage = dynamic(
  () => import('@/components/RegisterDevicePageClient'),
  { ssr: false }
);

export default function Page() {
  return <RegisterDevicePage />;
}
