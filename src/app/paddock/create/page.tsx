// app/paddock/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PaddockForm from '@/components/PaddockForm';
import { createPaddock } from '@/lib/paddock';

export default function CreatePaddockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreatePaddock = async (paddockName: string) => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please log in first!');
        router.push('/');
        return;
      }

      const result = await createPaddock(paddockName || null, token);

      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <PaddockForm
      onSubmit={handleCreatePaddock}
      loading={loading}
      returnLink="/dashboard"
      returnLinkText="Return to Dashboard"
      title="Create New Paddock"
      buttonText="Create Paddock"
      loadingText="Creating..."
    />
  );
}