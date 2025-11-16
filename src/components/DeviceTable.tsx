'use client';

import { FaMicrochip } from 'react-icons/fa6';
import { MdAdd } from 'react-icons/md';

export interface Device {
  node_id: number;
  node_name: string;
  battery?: number;
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
    <div className="bg-[#141826] border border-[#00be64]/60 rounded-2xl shadow-lg p-8 flex-1 w-full max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <FaMicrochip className="text-[#00be64]" size={28} />
          Devices
        </h2>
        {devices.length > 0 && (
          <button
            onClick={onAddDevice}
            className="flex items-center gap-2 px-5 py-3 text-base bg-[#00be64] hover:bg-[#009e53] text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-[#00be64]/20"
          >
            <MdAdd size={22} /> Add Device
          </button>
        )}
      </div>

      {/* Empty State */}
      {devices.length === 0 ? (
        <div className="text-white/80 p-12 text-center border border-dashed border-white/20 rounded-xl bg-white/5">
          <p className="text-2xl font-semibold">No devices yet</p>
          <p className="mt-3 text-base text-white/60">
            Start by adding a new device to this paddock.
          </p>
          <button
            onClick={onAddDevice}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#00be64] hover:bg-[#009e53] text-white text-lg font-medium rounded-lg transition-all shadow-md hover:shadow-[#00be64]/20"
          >
            <MdAdd size={24} /> Add Device
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((d) => (
            <div
              key={d.node_id}
              onClick={() => onDeviceClick(d)}
              className="group bg-[#1b2134] border border-[#00be64]/30 hover:border-[#00be64] rounded-xl p-6 flex flex-col items-start justify-between shadow-md hover:shadow-[#00be64]/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Icon + Info */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#00be64]/10 rounded-lg">
                  <FaMicrochip className="text-[#00be64]" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{d.node_name}</h3>
                  <p className="text-white/60 text-sm">Node ID: {d.node_id}</p>
                </div>
              </div>

              {/* Optional Battery */}
              {typeof d.battery === 'number' && (
                <div className="w-full mt-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-white/70 text-sm">Battery</span>
                    <span
                      className={`text-sm font-medium ${
                        d.battery > 60
                          ? 'text-[#00be64]'
                          : d.battery > 30
                          ? 'text-yellow-400'
                          : 'text-red-500'
                      }`}
                    >
                      {d.battery}%
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        d.battery > 60
                          ? 'bg-[#00be64]'
                          : d.battery > 30
                          ? 'bg-yellow-400'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${d.battery}%` }}
                    ></div>
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
