'use client';

import { Suspense } from 'react';
import PaddockViewClient from '@/components/PaddockViewClient';

export default function Page() {
  return (
    <Suspense fallback={<p>Loading paddock...</p>}>
      <PaddockViewClient />
    </Suspense>
  );
}
