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
  const [deviceName, setDeviceName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [registerError, setRegisterError] = useState<string | null>(null);

  const handleRegisterDevice = async () => {
    setRegisterError(null);

    if (!nodeId.trim()) {
      setRegisterError("Node ID is required");
      return;
    }

    if (!secretKey.trim()) {
      setRegisterError("Key is required");
      return;
    }

    // Check for duplicate node name
    if (
      deviceName.trim() &&
      devices.some(
        (device) =>
          device.node_name.toLowerCase() === deviceName.trim().toLowerCase(),
      )
    ) {
      setRegisterError("A device with this name already exists in this paddock");
      return;
    }

    // Check for duplicate node ID
    if (devices.some((device) => device.node_id === nodeId.trim())) {
      setRegisterError(
        "A device with this Node ID is already registered in this paddock",
      );
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setRegisterError("Please log in first");
        router.push("/");
        return;
      }

      const deviceData: UpdateDeviceRequest = {
        node_id: nodeId.trim(),
        node_name: deviceName.trim(),
        paddock_id: paddockId,
        secret_key: secretKey,
      };

      const result = await updateDevice(deviceData, token);
      if (!result.success) {
        setRegisterError(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);
      setNodeId("");
      setDeviceName("");
      setSecretKey("");
      setRegisterError(null);
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
      setRegisterError("Unexpected error occurred");
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#121829] border border-[#00be64]/40 rounded-3xl w-full max-w-lg shadow-2xl shadow-[#00be64]/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-[#00be64]/20 p-8 bg-gradient-to-br from-[#00be64]/5 to-transparent">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00be64] to-transparent opacity-50" />
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                Register Device
              </h2>
              <p className="text-gray-400 text-sm">
                Add a new device to this zone
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-[#00be64]/10 rounded-full p-2 transition-all duration-200 group"
              disabled={loading}
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300"
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
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          {/* Node ID */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Node ID <span className="text-red-400">*</span>
            </label>
            <input
              id="nodeId"
              type="text"
              value={nodeId}
              onChange={(e) => {
                setNodeId(e.target.value);
                setRegisterError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter Node ID"
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Key <span className="text-red-400">*</span>
            </label>
            <input
              id="secretKey"
              type="text"
              value={secretKey}
              onChange={(e) => {
                setSecretKey(e.target.value);
                setRegisterError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter Key"
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Device Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Node Name{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              id="deviceName"
              type="text"
              value={deviceName}
              onChange={(e) => {
                setDeviceName(e.target.value);
                setRegisterError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Sensor 1"
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Error Box */}
          {registerError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-400 text-sm font-medium">
                  {registerError}
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-sm text-white/60 hover:text-white/80 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleRegisterDevice}
              disabled={loading}
              className="px-5 py-2 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Register Device"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}