"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MarineMap({ lat, lon }: { lat: number; lon: number }) {
  useEffect(() => {
    // Evitar inicializar dos veces
    const mapContainer = document.getElementById("marine-map");
    if (!mapContainer) return;

    // Si ya existe un mapa en ese div, lo borramos
    if ((mapContainer as any)._leaflet_id) {
      (mapContainer as any)._leaflet_id = null;
    }

    const map = L.map("marine-map").setView([lat, lon], 5);

    L.tileLayer(
      "https://tile.open-meteo.com/marine/{z}/{x}/{y}.png?variable=wave_height",
      {
        attribution: "© Open-Meteo",
        maxZoom: 10,
      }
    ).addTo(map);

    return () => {
      map.remove();
    };
  }, [lat, lon]);

  return (
    <div
      id="marine-map"
      style={{ height: "400px", width: "100%", borderRadius: "12px" }}
    />
  );
}