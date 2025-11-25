'use client';

import { Suspense } from 'react';
import DeviceViewClient from '@/components/DeviceViewClient';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading device...</p>}>
      <DeviceViewClient />
    </Suspense>
  );
}
