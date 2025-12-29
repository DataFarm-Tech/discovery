"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface DeviceMapProps {
  lat: number;
  lng: number;
  nodeName: string;
}

export default function DeviceMap({ lat, lng, nodeName }: DeviceMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return;

    // Create map with Google-like behavior
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true,      // Google-style zoom buttons
      scrollWheelZoom: true,  // Smooth zooming
      dragging: true,
      inertia: true,
      zoomAnimation: true,
      fadeAnimation: true,
    }).setView([lat, lng], 15);

    // Google Maps–like street tiles (safe to use)
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        minZoom: 3,
        maxZoom: 19,
      }
    ).addTo(leafletMap.current);

    // Marker
    L.marker([lat, lng]).addTo(leafletMap.current).bindPopup(nodeName);

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [lat, lng, nodeName]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 0 20px #00be6433",
      }}
    />
  );
}
