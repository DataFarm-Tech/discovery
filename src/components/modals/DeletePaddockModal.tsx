"use client";

import { MdDelete } from "react-icons/md";

interface DeletePaddockModalProps {
  isOpen: boolean;
  onClose: () => void;
  paddockName: string;
  paddockId: string;
  onDelete: () => Promise<void>;
  loading: boolean;
}

export default function DeletePaddockModal({
  isOpen,
  onClose,
  paddockName,
  paddockId,
  onDelete,
  loading,
}: DeletePaddockModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-[#121829] border border-red-500/30 rounded-2xl p-8 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <MdDelete size={24} color="#ef4444" />
          </div>
          <h2 className="text-2xl font-bold text-red-500">Delete Zone</h2>
        </div>
        <p className="text-white text-lg mb-3">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#00be64]">
            {paddockName || `Paddock #${paddockId}`}
          </span>
          ?
        </p>
        <p className="text-gray-400 mb-8 leading-relaxed">
          This will unlink all devices from this zone. This action cannot be
          undone.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className={`px-6 py-3 rounded-lg transition-all font-medium ${
              loading
                ? "bg-red-500/50 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {loading ? "Deleting..." : "Delete Zone"}
          </button>
        </div>
      </div>
    </div>
  );
}
