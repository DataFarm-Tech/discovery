"use client";

import { useState } from "react";
import { PaddockType } from "@/lib/paddock";

interface EditPaddockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentType: PaddockType;
  onSave: (newName: string, newType: PaddockType) => Promise<void>;
}

export default function EditPaddockModal({
  isOpen,
  onClose,
  currentName,
  currentType,
  onSave,
}: EditPaddockModalProps) {
  const [newPaddockName, setNewPaddockName] = useState(currentName);
  const [newPaddockType, setNewPaddockType] = useState(currentType);
  const [editError, setEditError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setEditError(null);

    if (!newPaddockName.trim()) {
      setEditError("Paddock name cannot be empty");
      return;
    }

    if (
      newPaddockName.trim() === currentName &&
      newPaddockType === currentType
    ) {
      setEditError("No changes made");
      return;
    }

    setLoading(true);
    try {
      await onSave(newPaddockName.trim(), newPaddockType);
      onClose();
    } catch (error: any) {
      setEditError(error.message || "Failed to update paddock");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
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
          disabled={loading}
        />
        <label className="block text-sm font-semibold mb-2 text-white">
          Paddock Type
        </label>
        <select
          value={newPaddockType}
          onChange={(e) => setNewPaddockType(e.target.value as PaddockType)}
          className="w-full px-4 py-2 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] mb-2"
          disabled={loading}
        >
          <option value="default">Default</option>
          <option value="wheat">Wheat</option>
          <option value="barley">Barley</option>
          <option value="fruit">Fruit</option>
          <option value="wine">Wine</option>
          <option value="other">Other</option>
        </select>
        {editError && <p className="text-red-500 text-sm mb-4">{editError}</p>}
        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={() => {
              onClose();
              setEditError(null);
            }}
            disabled={loading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-all ${
              loading
                ? "bg-[#00be64]/50 cursor-not-allowed"
                : "bg-[#00be64] hover:bg-[#009e53]"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
