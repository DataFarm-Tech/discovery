// // components/PaddockForm.tsx
// "use client";

// import { useState } from "react";
// import Link from "next/link";

// interface PaddockFormProps {
//   onSubmit: (paddockName: string) => Promise<void>;
//   loading: boolean;
//   returnLink?: string;
//   returnLinkText?: string;
//   title?: string;
//   buttonText?: string;
//   loadingText?: string;
//   initialValue?: string;
// }

// export default function PaddockForm({
//   onSubmit,
//   loading,
//   returnLink = "/dashboard",
//   returnLinkText = "Return to Dashboard",
//   title = "Create New Paddock",
//   buttonText = "Create Paddock",
//   loadingText = "Creating...",
//   initialValue = "",
// }: PaddockFormProps) {
//   const [paddockName, setPaddockName] = useState(initialValue);

//   const handleSubmit = async () => {
//     await onSubmit(paddockName);
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter") {
//       handleSubmit();
//     }
//   };

//   return (
//     <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c1220] via-[#1a2332] to-[#0c1220] px-4">
//       <div
//         className="w-full max-w-2xl rounded-xl shadow-2xl p-8 sm:p-12"
//         style={{ backgroundColor: "rgba(20, 20, 20, 0.85)" }}
//       >
//         <h1 className="text-4xl font-bold text-center mb-8 text-white">
//           {title}
//         </h1>

//         <div className="space-y-6">
//           <div>
//             <label
//               htmlFor="paddockName"
//               className="block text-lg font-semibold mb-3 text-white"
//             >
//               Paddock Name
//             </label>
//             <input
//               id="paddockName"
//               type="text"
//               value={paddockName}
//               onChange={(e) => setPaddockName(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="e.g., North Field (optional)"
//               className="w-full p-4 text-lg rounded-md border border-green-500 bg-gray-800 text-white outline-none focus:ring-2 focus:ring-green-500"
//               disabled={loading}
//             />
//             <p className="text-base text-gray-400 mt-3">
//               Leave blank to create an unnamed paddock
//             </p>
//           </div>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className={`w-full py-4 text-lg rounded-md font-semibold text-white transition-colors ${
//               loading
//                 ? "bg-green-700 cursor-not-allowed"
//                 : "bg-green-500 hover:bg-green-600"
//             }`}
//           >
//             {loading ? loadingText : buttonText}
//           </button>
//         </div>

//         <p className="text-center text-base mt-8 text-white">
//           Want to go back?{" "}
//           <Link
//             href={returnLink}
//             className="text-green-500 font-semibold underline"
//           >
//             {returnLinkText}
//           </Link>
//         </p>
//       </div>
//     </main>
//   );
// }
