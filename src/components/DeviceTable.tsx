"use client";

import { FaMicrochip } from "react-icons/fa6";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";

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
  onEditDevice,
  onDeleteDevice,
}: {
  devices: Device[];
  onAddDevice: () => void;
  onDeviceClick: (device: Device) => void;
  onEditDevice?: (device: Device) => void;
  onDeleteDevice?: (device: Device) => void;
}) {
  return (
    <div className="bg-[#141826] border border-[#00be64]/30 rounded-xl p-5 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <FaMicrochip className="text-[#00be64]" size={20} />
          Devices
        </h2>

        <button
          onClick={onAddDevice}
          className="flex items-center gap-1.5 px-3 py-1 text-xs text-white/80 hover:text-[#00be64] border border-white/20 hover:border-[#00be64]/50 hover:bg-white/5 rounded-full transition-all duration-200 active:scale-95"
        >
          <MdAdd size={16} /> Add Device
        </button>
      </div>

      {/* Empty State */}
      {devices.length === 0 ? (
        <div className="text-white/80 p-6 text-center border border-dashed border-white/20 rounded-lg bg-white/5">
          <p className="text-base font-semibold">No devices yet</p>
          <p className="mt-1.5 text-white/60 text-sm">
            Start by adding a new device.
          </p>
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto pr-1.5 space-y-2">
          {devices.map((d) => (
            <div
              key={d.node_id}
              onClick={() => onDeviceClick(d)}
              className="group bg-[#1b2134] border border-[#00be64]/15 hover:border-[#00be64]/60 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer transition-all"
            >
              {/* Left side */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 bg-[#00be64]/10 rounded-md">
                  <FaMicrochip className="text-[#00be64]" size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {d.node_name || `Device ${d.node_id}`}
                  </h3>
                  <p className="text-white/50 text-xs truncate">Node ID: {d.node_id}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {typeof d.battery === "number" && (
                  <div className="flex flex-col items-end w-24">
                    <span
                      className={`text-xs font-medium mb-1 ${
                        d.battery > 60
                          ? "text-[#00be64]"
                          : d.battery > 30
                            ? "text-yellow-400"
                            : "text-red-500"
                      }`}
                    >
                      {d.battery}%
                    </span>

                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
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

                {(onEditDevice || onDeleteDevice) && (
                  <div className="flex items-center gap-1">
                    {onEditDevice && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditDevice(d);
                        }}
                        className="p-1.5 text-white/70 hover:text-[#00be64] border border-white/15 hover:border-[#00be64]/40 rounded-md transition-colors"
                        title="Edit device"
                        aria-label="Edit device"
                      >
                        <MdEdit size={14} />
                      </button>
                    )}
                    {onDeleteDevice && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDevice(d);
                        }}
                        className="p-1.5 text-white/70 hover:text-red-400 border border-white/15 hover:border-red-400/40 rounded-md transition-colors"
                        title="Delete device"
                        aria-label="Delete device"
                      >
                        <MdDelete size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}