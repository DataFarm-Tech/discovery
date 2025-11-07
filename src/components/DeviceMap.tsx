'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngTuple } from 'leaflet';

// Fix default marker icon (Leaflet 1.x issue)
const greenIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

interface Device {
  name: string;
  battery: number;
  version: string;
  location: LatLngTuple; // Explicitly type location as a LatLngTuple
}

const DeviceMap = () => {
  const devices: Device[] = [
    { name: 'Irrigation Pump', battery: 80, version: 'v1.2.0', location: [-34.260, 146.038] },
    { name: 'Soil Sensor', battery: 45, version: 'v2.1.3', location: [-34.263, 146.045] },
    { name: 'Weather Station', battery: 70, version: 'v3.0.1', location: [-34.267, 146.040] },
  ];

  return (
    <div className="h-56 rounded-lg overflow-hidden">
      <MapContainer
        center={[-34.262, 146.043]}
        zoom={12}
        className="h-full w-full rounded-lg"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        {devices.map((d, i) => (
          <Marker key={i} position={d.location} icon={greenIcon}>
            <Popup>
              <b>{d.name}</b>
              <br />
              Battery: {d.battery}%
              <br />
              Version: {d.version}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DeviceMap;
