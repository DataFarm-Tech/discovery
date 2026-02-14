"use client";

import { useState } from "react";
import { PaddockType } from "@/lib/paddock";

interface EditPaddockModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentType: PaddockType;
  currentArea: string;
  onSave: (newName: string, newType: PaddockType, newArea: string) => Promise<void>;
}

export default function EditPaddockModal({
  isOpen,
  onClose,
  currentName,
  currentType,
  currentArea,
  onSave,
}: EditPaddockModalProps) {
  const [newPaddockName, setNewPaddockName] = useState(currentName);
  const [newPaddockType, setNewPaddockType] = useState(currentType);
  const [newPaddockArea, setNewPaddockArea] = useState(currentArea);
  const [editError, setEditError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setEditError(null);

    if (!newPaddockName.trim()) {
      setEditError("Paddock name cannot be empty");
      return;
    }

    if (!newPaddockArea || newPaddockArea.trim() === '') {
      setEditError("Paddock area cannot be empty");
      return;
    }

    // Validate area is a positive number
    const areaValue = parseFloat(newPaddockArea);
    if (isNaN(areaValue) || areaValue <= 0) {
      setEditError("Please enter a valid area greater than 0");
      return;
    }

    if (
      newPaddockName.trim() === currentName &&
      newPaddockType === currentType && 
      newPaddockArea === currentArea
    ) {
      setEditError("No changes made");
      return;
    }

    setLoading(true);
    try {
      await onSave(newPaddockName.trim(), newPaddockType, newPaddockArea);
      onClose();
    } catch (error: any) {
      setEditError(error.message || "Failed to update paddock");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSave();
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
              <h2 className="text-3xl font-bold text-white mb-1">Edit Paddock</h2>
              <p className="text-gray-400 text-sm">Update paddock information</p>
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
          {/* Paddock Name */}
          <div className="space-y-2">
            <label
              htmlFor="paddockName"
              className="block text-sm font-semibold text-white"
            >
              Paddock Name <span className="text-red-400">*</span>
            </label>
            <input
              id="paddockName"
              type="text"
              value={newPaddockName}
              onChange={(e) => {
                setNewPaddockName(e.target.value);
                setEditError(null);
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              placeholder="Enter paddock name"
              disabled={loading}
            />
          </div>

          {/* Paddock Type */}
          <div className="space-y-2">
            <label
              htmlFor="paddockType"
              className="block text-sm font-semibold text-white"
            >
              Paddock Type
            </label>
            <div className="relative">
              <select
                id="paddockType"
                value={newPaddockType}
                onChange={(e) => {
                  setNewPaddockType(e.target.value as PaddockType);
                  setEditError(null);
                }}
                className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 appearance-none cursor-pointer"
                disabled={loading}
              >
                <option value="default">Default</option>
                <option value="Grains">Grains</option>
                <option value="Legumes">Legumes</option>
                <option value="Fruit">Fruit</option>
                <option value="Oil Seeds">Oil Seeds</option>
                <option value="Root Crops">Root Crops</option>
                <option value="Tropical">Tropical</option>
                <option value="Other">Other</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Paddock Area */}
          <div className="space-y-2">
            <label
              htmlFor="paddockArea"
              className="block text-sm font-semibold text-white"
            >
              Area (hectares) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                id="paddockArea"
                type="number"
                value={newPaddockArea}
                onChange={(e) => {
                  setNewPaddockArea(e.target.value);
                  setEditError(null);
                }}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 50"
                min="0.1"
                step="0.1"
                className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500 text-sm">ha</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Enter the paddock area in hectares
            </p>
          </div>

          {/* Error Message */}
          {editError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-400 text-sm font-medium">{editError}</p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-700/50">
            <button
              onClick={() => {
                onClose();
                setEditError(null);
              }}
              disabled={loading}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-all duration-200 text-white font-medium border border-gray-600/50 hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className={`px-6 py-3 rounded-xl transition-all duration-200 text-white font-medium shadow-lg flex items-center gap-2 ${
                loading
                  ? "bg-[#00be64]/50 cursor-not-allowed"
                  : "bg-[#00be64] hover:bg-[#009e53] hover:shadow-[#00be64]/50 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}