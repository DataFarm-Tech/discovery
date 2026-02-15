"use client";

import { FaMicrochip } from "react-icons/fa6";
import { MdAdd } from "react-icons/md";

export interface Device {
  node_id: string;
  node_name: string;
  battery?: number;
  lat?: number;
  lon?: number;
}

export default function DeviceTable({
  devices,
  onAddDevice,
  onDeviceClick,
}: {
  devices: Device[];
  onAddDevice: () => void;
  onDeviceClick: (device: Device) => void;
}) {
  return (
    <div className="bg-[#141826] border border-[#00be64]/60 rounded-2xl shadow-lg p-8 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaMicrochip className="text-[#00be64]" size={26} />
          Devices
        </h2>

        <button
          onClick={onAddDevice}
          className="flex items-center gap-2 px-4 py-1.5 text-sm text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
        >
          <MdAdd size={18} /> Add Device
        </button>
      </div>

      {/* Empty State */}
      {devices.length === 0 ? (
        <div className="text-white/80 p-10 text-center border border-dashed border-white/20 rounded-xl bg-white/5">
          <p className="text-xl font-semibold">No devices yet</p>
          <p className="mt-2 text-white/60 text-base">
            Start by adding a new device.
          </p>
        </div>
      ) : (
        <div className="h-[500px] overflow-y-auto pr-2 space-y-3">
          {devices.map((d) => (
            <div
              key={d.node_id}
              onClick={() => onDeviceClick(d)}
              className="group bg-[#1b2134] border border-[#00be64]/20 hover:border-[#00be64] rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[#00be64]/10"
            >
              {/* Left side */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#00be64]/10 rounded-lg">
                  <FaMicrochip className="text-[#00be64]" size={26} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {d.node_name || `Device ${d.node_id}`}
                  </h3>
                  <p className="text-white/50 text-sm">Node ID: {d.node_id}</p>
                </div>
              </div>

              {/* Battery */}
              {typeof d.battery === "number" && (
                <div className="flex flex-col items-end w-32">
                  <span
                    className={`text-sm font-medium mb-1 ${
                      d.battery > 60
                        ? "text-[#00be64]"
                        : d.battery > 30
                          ? "text-yellow-400"
                          : "text-red-500"
                    }`}
                  >
                    {d.battery}%
                  </span>

                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        d.battery > 60
                          ? "bg-[#00be64]"
                          : d.battery > 30
                            ? "bg-yellow-400"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${d.battery}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}