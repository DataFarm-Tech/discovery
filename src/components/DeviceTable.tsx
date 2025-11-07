'use client';

export interface Device {
  name: string;
  battery: number;
}

export default function DeviceTable({ devices, onAddDevice }: { devices: Device[], onAddDevice: () => void }) {
  return (
    <div className="bg-[#1a1f2e] border border-[#00be64] rounded-lg shadow p-6 flex-1 w-full">
      <h2 className="text-xl font-semibold text-white mb-4">Devices</h2>

      {devices.length === 0 ? (
        <div className="text-white/60 p-4 text-center">
          <p>No devices yet.</p>
          <p className="mt-2">Please add some devices to get started.</p>
          {/* Add Device Button */}
          <button 
            onClick={onAddDevice} 
            className="mt-4 px-4 py-2 bg-[#00be64] text-white rounded hover:bg-[#009e53] transition"
          >
            Add Device
          </button>
        </div>
      ) : (
        <>
          <table className="w-full text-left divide-y divide-gray-400">
            <thead>
              <tr>
                <th className="py-1 text-sm text-white w-1/4">Name</th>
                <th className="py-1 text-sm text-white w-1/2">Battery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-400">
              {devices.map((d, i) => (
                <tr key={i} className="hover:bg-white/10 transition-all rounded-lg">
                  <td className="py-1 px-2">{d.name}</td>
                  <td className="py-1 px-2">
                    {/* Shorten the width of the battery container */}
                    <div className="w-[50%] bg-white/20 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full ${
                          d.battery > 60
                            ? 'bg-[#00be64]'
                            : d.battery > 30
                            ? 'bg-yellow-400'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${d.battery}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{d.battery}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}