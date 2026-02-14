"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPaddock, cropType } from "@/lib/paddock";

interface CreatePaddockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreatePaddockModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePaddockModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paddockName, setPaddockName] = useState("");
  const [cropType, setcropType] = useState<cropType>("default");
  const [area, setArea] = useState("");
  const [plant_date, setPlantDate] = useState("");
  const [soilType, setSoilType] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreatePaddock = async () => {
    setCreateError(null);

    if (!area || area.trim() === "") {
      setCreateError("Paddock area cannot be empty");
      return;
    }

    const areaValue = parseFloat(area);
    if (isNaN(areaValue) || areaValue <= 0) {
      setCreateError("Please enter a valid area greater than 0");
      return;
    }

    if (!soilType || soilType.trim() === "") {
      setCreateError("Please select a soil type");
      return;
    }

    if (!plant_date || plant_date.trim() === "") {
      setCreateError("Plant date cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCreateError("Please log in first");
        router.push("/");
        return;
      }

      const result = await createPaddock(
        paddockName.trim() || null,
        cropType,
        area,
        plant_date,
        soilType,
        token
      );

      if (!result.success) {
        setCreateError(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);

      setPaddockName("");
      setcropType("default");
      setArea("");
      setPlantDate("");
      setSoilType("");
      setCreateError(null);

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
      setCreateError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleCreatePaddock();
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
                Create New Paddock
              </h2>
              <p className="text-gray-400 text-sm">
                Add a new paddock to your farm
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
          {/* Paddock Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Paddock Name{" "}
              <span className="text-gray-500 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={paddockName}
              onChange={(e) => {
                setPaddockName(e.target.value);
                setCreateError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="e.g., North Field"
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Crop Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Crop Type
            </label>
            <select
              value={cropType}
              onChange={(e) => {
                setcropType(e.target.value as cropType);
                setCreateError(null);
              }}
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
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
          </div>

          {/* Soil Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => {
                setSoilType(e.target.value);
                setCreateError(null);
              }}
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            >
              <option value="">Select Soil Type</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Clay">Clay</option>
              <option value="Silty">Silty / Alluvial</option>
              <option value="Peaty">Peaty / Organic</option>
              <option value="Saline">Saline / Sodic</option>
              <option value="Calcareous">Calcareous / Lime-rich</option>
              <option value="Podzolic">Podzolic / Acidic</option>
              <option value="Rocky">Rocky / Stony</option>
              <option value="Other">Other / Unknown</option>
            </select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Area (hectares) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setCreateError(null);
              }}
              onKeyPress={handleKeyPress}
              min="0.1"
              step="0.1"
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Plant Date */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-white">
              Plant Date <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={plant_date}
              onChange={(e) => {
                setPlantDate(e.target.value);
                setCreateError(null);
              }}
              className="w-full px-4 py-3.5 bg-[#0c1220] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00be64] focus:ring-2 focus:ring-[#00be64]/20 transition-all duration-200 [color-scheme:dark]"
              disabled={loading}
            />
          </div>

          {/* Error Box */}
          {createError && (
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
                  {createError}
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-700/50">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePaddock}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-[#00be64] hover:bg-[#009e53] text-white font-medium"
            >
              {loading ? "Creating..." : "Create Paddock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
