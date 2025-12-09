// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';

// interface DeviceFormProps {
//   onSubmit: (deviceData: {
//     node_id: string;
//     node_name?: string;
//     paddock_id: number;
//   }) => Promise<void>;
//   loading: boolean;
//   returnLink?: string;
//   returnLinkText?: string;
//   title?: string;
//   buttonText?: string;
//   loadingText?: string;
//   initialValues: {
//     node_id?: string;
//     node_name?: string;
//     paddock_id: number; // required
//   };
// }

// export default function DeviceForm({
//   onSubmit,
//   loading,
//   returnLink = '/dashboard',
//   returnLinkText = 'Return to Dashboard',
//   title = 'Update Device',
//   buttonText = 'Update Device',
//   loadingText = 'Updating...',
//   initialValues,
// }: DeviceFormProps) {
//   const [nodeId, setNodeId] = useState(initialValues.node_id || '');
//   const [nodeName, setNodeName] = useState(initialValues.node_name || '');
//   const paddockId = initialValues.paddock_id;

//   const handleSubmit = async () => {
//     if (!nodeId || paddockId === undefined) {
//       alert('Node ID and Paddock ID are required.');
//       return;
//     }

//     await onSubmit({
//       node_id: nodeId,
//       node_name: nodeName || '',
//       paddock_id: paddockId,
//     });
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') handleSubmit();
//   };

//   return (
//     <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c1220] via-[#1a2332] to-[#0c1220] px-4">
//       <div
//         className="w-full max-w-2xl rounded-xl shadow-2xl p-8 sm:p-12"
//         style={{ backgroundColor: 'rgba(20, 20, 20, 0.85)' }}
//       >
//         <h1 className="text-4xl font-bold text-center mb-8 text-white">{title}</h1>

//         <div className="space-y-6">
//           <div>
//             <label htmlFor="nodeId" className="block text-lg font-semibold mb-3 text-white">
//               Node ID
//             </label>
//             <input
//               id="nodeId"
//               type="text"
//               value={nodeId}
//               onChange={(e) => setNodeId(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Enter Node ID"
//               className="w-full p-4 text-lg rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
//               disabled={loading}
//             />
//           </div>

//           <div>
//             <label htmlFor="nodeName" className="block text-lg font-semibold mb-3 text-white">
//               Node Name (optional)
//             </label>
//             <input
//               id="nodeName"
//               type="text"
//               value={nodeName}
//               onChange={(e) => setNodeName(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Enter Node Name or leave blank"
//               className="w-full p-4 text-lg rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
//               disabled={loading}
//             />
//           </div>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className={`w-full py-4 text-lg rounded-md font-semibold text-white transition-colors ${
//               loading ? 'bg-green-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
//             }`}
//           >
//             {loading ? loadingText : buttonText}
//           </button>
//         </div>

//         <p className="text-center text-base mt-8 text-white">
//           Want to go back?{' '}
//           <Link href={returnLink} className="text-green-500 font-semibold underline">
//             {returnLinkText}
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }
