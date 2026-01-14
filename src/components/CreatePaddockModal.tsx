"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createPaddock, PaddockType } from "@/lib/paddock";

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
  const [paddockType, setPaddockType] = useState<PaddockType>("default");

  const handleCreatePaddock = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        router.push("/");
        return;
      }

      const result = await createPaddock(
        paddockName.trim() || null,
        paddockType,
        token
      );
      if (!result.success) {
        toast.error(result.message);
        setLoading(false);
        return;
      }

      toast.success(result.message);
      setPaddockName("");
      setPaddockType("default");
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
      handleCreatePaddock();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#121829] border border-[#00be64]/30 rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-[#00be64]/20 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Create New Paddock</h2>
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
              htmlFor="paddockName"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Paddock Name <span className="text-gray-500">(optional)</span>
            </label>
            <input
              id="paddockName"
              type="text"
              value={paddockName}
              onChange={(e) => setPaddockName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., North Field"
              className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] transition-colors"
              disabled={loading}
            />
            <p className="text-sm text-gray-400 mt-2">
              Leave blank to create an unnamed paddock
            </p>
          </div>

          <div>
            <label
              htmlFor="paddockType"
              className="block text-sm font-semibold mb-2 text-white"
            >
              Paddock Type
            </label>
            <select
              id="paddockType"
              value={paddockType}
              onChange={(e) => setPaddockType(e.target.value as PaddockType)}
              className="w-full px-4 py-3 bg-[#0c1220] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00be64] transition-colors"
              disabled={loading}
            >
              <option value="default">Default</option>
              <option value="wheat">Wheat</option>
              <option value="barley">Barley</option>
              <option value="fruit">Fruit</option>
              <option value="wine">Wine</option>
              <option value="other">Other</option>
            </select>
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
              onClick={handleCreatePaddock}
              disabled={loading}
              className={`px-6 py-3 rounded-lg transition-all text-white font-medium ${
                loading
                  ? "bg-[#00be64]/50 cursor-not-allowed"
                  : "bg-[#00be64] hover:bg-[#009e53]"
              }`}
            >
              {loading ? "Creating..." : "Create Paddock"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
