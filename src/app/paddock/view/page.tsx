"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import Sidebar from "@/components/Sidebar";
import DeviceTable, { Device } from "@/components/DeviceTable";
import SoilHealthScore from "@/components/SoilHealthScore";
import { MdDelete, MdEdit, MdArrowBack } from "react-icons/md";
import {
  getPaddockDevices,
  updatePaddockName,
  deletePaddock,
  PaddockType,
} from "@/lib/paddock";
import toast from "react-hot-toast";
import RegisterDeviceModal from "@/components/RegisterDeviceModal";
import RecentAverages from "@/components/RecentAverages";

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPaddockName, setNewPaddockName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [paddockId, setPaddockId] = useState<string | null>(null);
  const [paddockName, setPaddockName] = useState<string>("");
  const [paddockType, setPaddockType] = useState<PaddockType>("default");
  const [newPaddockType, setNewPaddockType] = useState<PaddockType>("default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem("paddockData");
    if (data) {
      const { paddockId, paddockName, paddockType } = JSON.parse(data);
      setPaddockId(paddockId?.toString() || null);
      setPaddockName(paddockName || "");
      setPaddockType(paddockType || "default");
    }
  }, []);

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
          node_name: d.node_name || "",
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
      setIsModalOpen(true);
    }
  };

  const handleEditPaddock = async () => {
    setEditError(null);

    if (!newPaddockName.trim()) {
      setEditError("Paddock name cannot be empty");
      return;
    }

    if (
      newPaddockName.trim() === paddockName &&
      newPaddockType === paddockType
    ) {
      setEditError("No changes made");
      return;
    }

    if (!paddockId) return;

    try {
      const token = localStorage.getItem("token") || "";
      const result = await updatePaddockName(
        paddockId,
        newPaddockName.trim(),
        newPaddockType,
        token
      );

      if (result.success) {
        sessionStorage.setItem(
          "paddockData",
          JSON.stringify({
            paddockId: paddockId,
            paddockName: newPaddockName.trim(),
            paddockType: newPaddockType,
          })
        );

        setPaddockName(newPaddockName.trim());
        setPaddockType(newPaddockType);
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

  const handleDeletePaddock = async () => {
    if (!paddockId) return;

    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const result = await deletePaddock(paddockId, token);

      if (result.success) {
        toast.success(result.message);
        sessionStorage.removeItem("paddockData");
        setIsDeleteModalOpen(false);
        router.push("/dashboard");
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error("Failed to delete paddock");
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSearchItemSelect = (item: any) => {
    console.log("Selected item:", item);
    if (item.node_id) {
      router.push(`/device/view?nodeId=${item.node_id}`);
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[#0c1220] px-6 py-6 text-white relative flex flex-col">
      <DashboardHeader
        userName="Lucas"
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        paddocks={[]}
        devices={devices}
        onSearchItemSelect={handleSearchItemSelect}
      />

      <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-6">
        {paddockId ? (
          <div className="w-full max-w-5xl space-y-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-lg"
            >
              <MdArrowBack
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
              <span>Back to Dashboard</span>
            </button>

            <section className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">
                  {paddockName || `Paddock #${paddockId}`}
                  {paddockType && (
                    <span className="ml-3 text-xl text-gray-400 font-normal">
                      ({paddockType})
                    </span>
                  )}
                </h1>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setNewPaddockName(paddockName || "");
                      setNewPaddockType(paddockType);
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

                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
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

            <RecentAverages paddockId={paddockId} />

            {loading && <p className="text-gray-400">Loading devices...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <DeviceTable
                devices={devices}
                onAddDevice={handleAddDevice}
                onDeviceClick={handleDeviceClick}
              />
            )}
          </div>
        ) : (
          <p className="text-gray-400">No paddock selected.</p>
        )}
      </div>

      {paddockId && (
        <RegisterDeviceModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          paddockId={Number(paddockId)}
          onSuccess={() => {
            const fetchDevices = async () => {
              try {
                const token = localStorage.getItem("token") || "";
                const result = await getPaddockDevices(paddockId, token);
                if (result.success) {
                  const mapped: Device[] = result.devices.map((d: any) => ({
                    node_id: d.node_id,
                    node_name: d.node_name || "",
                    battery: d.battery,
                  }));
                  setDevices(mapped);
                }
              } catch (err) {
                console.error("Failed to refresh devices:", err);
              }
            };
            fetchDevices();
          }}
        />
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#121829] border border-[#00be64]/30 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Paddock Name</h2>
            <input
              type="text"
              value={newPaddockName}
              onChange={(e) => {
                setNewPaddockName(e.target.value);
                setEditError(null);
              }}
              className="w-full px-4 py-2 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] mb-4"
              placeholder="Enter paddock name"
            />
            <label className="block text-sm font-semibold mb-2 text-white">
              Paddock Type
            </label>
            <select
              value={newPaddockType}
              onChange={(e) => setNewPaddockType(e.target.value as PaddockType)}
              className="w-full px-4 py-2 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] mb-2"
            >
              <option value="default">Default</option>
              <option value="wheat">Wheat</option>
              <option value="barley">Barley</option>
              <option value="fruit">Fruit</option>
              <option value="wine">Wine</option>
              <option value="other">Other</option>
            </select>
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

      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !deleteLoading && setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-[#121829] border border-red-500/30 rounded-2xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <MdDelete size={24} color="#ef4444" />
              </div>
              <h2 className="text-2xl font-bold text-red-500">
                Delete Paddock
              </h2>
            </div>
            <p className="text-white text-lg mb-3">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#00be64]">
                {paddockName || `Paddock #${paddockId}`}
              </span>
              ?
            </p>
            <p className="text-gray-400 mb-8 leading-relaxed">
              This will unlink all devices from this paddock. This action cannot
              be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePaddock}
                disabled={deleteLoading}
                className={`px-6 py-3 rounded-lg transition-all font-medium ${
                  deleteLoading
                    ? "bg-red-500/50 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {deleteLoading ? "Deleting..." : "Delete Paddock"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
