"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateDevice, UpdateDeviceRequest } from "@/lib/device";
import { Device } from "../DeviceTable";

interface RegisterDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  paddockId: number;
  onSuccess?: () => void;
  devices?: Device[];
}

export default function RegisterDeviceModal({
  isOpen,
  onClose,
  paddockId,
  onSuccess,
  devices = [],
}: RegisterDeviceModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nodeId, setNodeId] = useState("");
  const [nodeName, setNodeName] = useState("");

  const handleRegisterDevice = async () => {
    if (!nodeId.trim()) {
      toast.error("Node ID is required");
      return;
    }

    // Check for duplicate node name
    if (
      nodeName.trim() &&
      devices.some(
        (device) =>
          device.node_name.toLowerCase() === nodeName.trim().toLowerCase(),
      )
    ) {
      toast.error("A device with this name already exists in this paddock");
      return;
    }

    // Check for duplicate node ID
    if (devices.some((device) => device.node_id === nodeId.trim())) {
      toast.error(
        "A device with this Node ID is already registered in this paddock",
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        router.push("/");
        return;
      }

      const deviceData: UpdateDeviceRequest = {
        node_id: nodeId.trim(),
        node_name: nodeName.trim(),
        paddock_id: paddockId,
      };

      const result = await updateDevice(deviceData, token);
      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);
      setNodeId("");
      setNodeName("");
      onClose();

      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.refresh();
        }, 500);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRegisterDevice();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121829] border border-[#00be64]/30 rounded-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#00be64]/20 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Register Device</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            disabled={loading}
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label
              htmlFor="nodeId"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Node ID <span className="text-red-500">*</span>
            </label>
            <input
              id="nodeId"
              type="text"
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Node ID"
              className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="nodeName"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Node Name <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="nodeName"
              type="text"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter Node Name"
              className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] transition-colors"
              disabled={loading}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all text-white font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleRegisterDevice}
              disabled={loading}
              className={`px-6 py-3 rounded-lg transition-all text-white font-medium ${
                loading
                  ? "bg-[#00be64]/50 cursor-not-allowed"
                  : "bg-[#00be64] hover:bg-[#009e53]"
              }`}
            >
              {loading ? "Registering..." : "Register Device"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
