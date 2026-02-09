"use client";

import { useState } from "react";
import { MdClose } from "react-icons/md";

interface EditDeviceNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSubmit: (newName: string) => Promise<void>;
}

export default function EditDeviceNameModal({
  isOpen,
  onClose,
  currentName,
  onSubmit,
}: EditDeviceNameModalProps) {
  const [deviceName, setDeviceName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!deviceName.trim()) {
      setError("Device name cannot be empty");
      return;
    }

    if (deviceName.trim() === currentName.trim()) {
      setError("Please enter a different name");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(deviceName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update device name");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDeviceName(currentName);
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121829] border border-[#00be64]/30 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Edit Device Name</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            disabled={loading}
          >
            <MdClose size={24} color="#9ca3af" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="deviceName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Device Name
            </label>
            <input
              type="text"
              id="deviceName"
              value={deviceName}
              onChange={(e) => {
                setDeviceName(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2 bg-[#0c1220] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#00be64] transition-colors"
              placeholder="Enter device name"
              disabled={loading}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#00be64] hover:bg-[#00a555] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
