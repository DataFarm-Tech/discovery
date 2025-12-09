// 'use client';
// import { useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import toast from 'react-hot-toast';
// import DeviceForm from './DeviceForm';
// import { updateDevice, UpdateDeviceRequest } from '@/lib/device';

// export default function RegisterDevicePageClient() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const paddockIdFromQuery = searchParams.get('paddockId');
//   const paddockId = paddockIdFromQuery ? Number(paddockIdFromQuery) : undefined;

//   const [loading, setLoading] = useState(false);

//   const handleRegisterDevice = async (deviceData: UpdateDeviceRequest) => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         toast.error('Please log in first!');
//         router.push('/');
//         return;
//       }

//       const result = await updateDevice(deviceData, token);
//       if (!result.success) {
//         toast.error(result.message);
//         setLoading(false);
//         return;
//       }

//       toast.success(result.message);

//       setTimeout(() => {
//         if (paddockId) {
//           router.push(`/paddock/view?paddockId=${paddockId}`);
//         } else {
//           router.push('/dashboard');
//         }
//       }, 1500);
//     } catch (error) {
//       console.error(error);
//       toast.error('Unexpected error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!paddockId) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-white">
//         <p>Paddock ID is missing. Please go back and select a paddock.</p>
//       </div>
//     );
//   }

//   return (
//     <DeviceForm
//       onSubmit={handleRegisterDevice}
//       loading={loading}
//       returnLink={`/paddock/view?paddockId=${paddockId}`}
//       returnLinkText="Return to Paddock"
//       title="Register / Update Device"
//       buttonText="Register Device"
//       loadingText="Registering..."
//       initialValues={{ paddock_id: paddockId }}
//     />
//   );
// }
