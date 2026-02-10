"use client";

import { useState } from "react";
import { MdClose, MdWarning } from "react-icons/md";
import { unlinkDevice } from "@/lib/device";

interface DeleteDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeName: string;
  onSuccess: () => void;
}

export default function DeleteDeviceModal({
  isOpen,
  onClose,
  nodeId,
  nodeName,
  onSuccess,
}: DeleteDeviceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("You must be logged in.");

      const result = await unlinkDevice(nodeId, token);

      if (!result.success) {
        throw new Error(result.message);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#121829] border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Unlink Device</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            disabled={loading}
          >
            <MdClose size={24} color="#9ca3af" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <MdWarning
              size={24}
              className="text-red-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="text-white font-medium mb-2">
                Are you sure you want to unlink this device?
              </p>
              <p className="text-gray-400 text-sm">
                Device{" "}
                <span className="font-semibold text-white">{nodeName}</span>{" "}
                will be unlinked from your account. This action cannot be
                undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Unlinking..." : "Unlink Device"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
