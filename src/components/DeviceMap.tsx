"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface NodeLocation {
  node_id: string;
  node_name: string;
  lat: number;
  lon: number;
}

interface DeviceMapProps {
  nodes: NodeLocation[];
}

export default function DeviceMap({ nodes }: DeviceMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMap = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (leafletMap.current) return;

    if (nodes.length === 0) {
      // No nodes to display
      leafletMap.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        inertia: true,
        zoomAnimation: true,
        fadeAnimation: true,
      }).setView([51.505, -0.09], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        minZoom: 3,
        maxZoom: 19,
      }).addTo(leafletMap.current);

      return () => {
        if (leafletMap.current) {
          leafletMap.current.remove();
          leafletMap.current = null;
        }
      };
    }

    // Create map with Google-like behavior
    const firstNode = nodes[0];
    leafletMap.current = L.map(mapRef.current, {
      zoomControl: true, // Google-style zoom buttons
      scrollWheelZoom: true, // Smooth zooming
      dragging: true,
      inertia: true,
      zoomAnimation: true,
      fadeAnimation: true,
    }).setView([firstNode.lat, firstNode.lon], 13);

    // Google Maps–like street tiles (safe to use)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      minZoom: 3,
      maxZoom: 19,
    }).addTo(leafletMap.current);

    // Add markers for all nodes
    const markers = nodes.map((node) => {
      return L.marker([node.lat, node.lon])
        .addTo(leafletMap.current!)
        .bindPopup(`<strong>${node.node_name}</strong><br>ID: ${node.node_id}`);
    });

    // Fit all markers in view if multiple nodes
    if (nodes.length > 1) {
      const group = new L.FeatureGroup(markers);
      leafletMap.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [nodes]);

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
