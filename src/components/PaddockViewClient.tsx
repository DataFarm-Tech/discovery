"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import Sidebar from "./Sidebar";
import DeviceTable, { Device } from "./DeviceTable";
import SoilHealthScore from "./SoilHealthScore";
import { MdDelete, MdEdit } from "react-icons/md";
import { getPaddockDevices, updatePaddockName } from "@/lib/paddock";

export default function PaddockViewClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPaddockName, setNewPaddockName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const paddockId = searchParams.get("paddockId");
  const paddockName = searchParams.get("paddockName");

  const router = useRouter();

  useEffect(() => {
    if (!paddockId) return;

    const fetchDevices = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token") || "";
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

  const handleEditPaddock = async () => {
    // Clear previous errors
    setEditError(null);

    // Validation: Check for empty string
    if (!newPaddockName.trim()) {
      setEditError("Paddock name cannot be empty");
      return;
    }

    // Validation: Check if name is the same
    if (newPaddockName.trim() === paddockName) {
      setEditError("New name must be different from current name");
      return;
    }

    if (!paddockId) return;

    try {
      const token = localStorage.getItem("token") || "";
      const result = await updatePaddockName(
        paddockId,
        newPaddockName.trim(),
        token
      );

      if (result.success) {
        // Update URL with new name
        router.push(
          `/paddock/view?paddockId=${paddockId}&paddockName=${encodeURIComponent(
            newPaddockName.trim()
          )}`
        );
        setIsEditModalOpen(false);
        setEditError(null);
      } else {
        setEditError(result.message);
      }
    } catch (err: any) {
      setEditError(err.message);
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
            {/* Paddock Header with Name and Actions */}
            <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                {/* Paddock Name - Left Aligned */}
                <h1 className="text-3xl font-bold text-white">
                  {paddockName || `Paddock #${paddockId}`}
                </h1>

                {/* Action Icons - Right Aligned */}
                <div className="flex items-center gap-3">
                  {/* Edit Icon */}
                  <button
                    onClick={() => {
                      /* Handle edit */
                      setNewPaddockName(paddockName || "");
                      setEditError(null);
                      setIsEditModalOpen(true);
                    }}
                    className="p-2.5 bg-[#00be64]/20 hover:bg-[#00be64]/30 rounded-lg transition-all group"
                    title="Edit paddock"
                  >
                    <MdEdit
                      size={20}
                      color="#00be64"
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>

                  {/* Delete Icon */}
                  <button
                    onClick={() => {
                      /* Handle delete */
                    }}
                    className="p-2.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all group"
                    title="Delete paddock"
                  >
                    <MdDelete
                      size={20}
                      color="#ef4444"
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </section>
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
                Soil health is calculated using microbial activity, organic
                matter, moisture balance, and nutrient availability from your
                active sensors.
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
      {/* Edit Paddock Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121829] border border-[#00be64]/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Paddock Name</h2>

            <input
              type="text"
              value={newPaddockName}
              onChange={(e) => {
                setNewPaddockName(e.target.value);
                setEditError(null); // Clear error on input change
              }}
              className="w-full px-4 py-2 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] mb-2"
              placeholder="Enter paddock name"
            />

            {/* Error Message */}
            {editError && (
              <p className="text-red-500 text-sm mb-4">{editError}</p>
            )}

            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditError(null);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEditPaddock}
                className="px-4 py-2 bg-[#00be64] hover:bg-[#009e53] rounded-lg transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
