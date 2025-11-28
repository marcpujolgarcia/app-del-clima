"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // 👈 Importa los estilos de Leaflet

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

type CityWeather = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  temp: number;
  icon: string;
  description: string;
};

// Importamos los componentes de react-leaflet de forma dinámica (solo cliente)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapaPage() {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    try {
      setError(null);

      // 1. Buscar coordenadas de la ciudad
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
          query
        )}&limit=1&appid=${API_KEY}`
      );
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) throw new Error("Ciudad no encontrada");

      const { lat, lon, name, country } = geoData[0];

      // 2. Buscar clima actual
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`
      );
      const weatherData = await weatherRes.json();

      const newCity: CityWeather = {
        id: `${weatherData.id}-${Date.now()}`,
        name: `${name}, ${country}`,
        lat,
        lon,
        temp: weatherData.main.temp,
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
      };

      setCities((prev) => [...prev, newCity]);
      setQuery("");
    } catch (e: any) {
      setError(e.message || "Error al buscar ciudad");
    }
  };

  // Crear icono personalizado con el icono de OpenWeather
  const createIcon = (icon: string) =>
    L.icon({
      iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

  return (
    <main className="min-h-screen bg-[#0B1220] text-white pt-20 md:pt-0 relative">
      <div className="max-w-7xl mx-auto p-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] gap-6">
          <Sidebar />
          <div className="flex flex-col gap-6 w-full">
            {/* Buscador */}
            <div className="flex gap-2 w-full">
              <input
                type="text"
                placeholder="Buscar ciudades"
                className="flex-1 bg-[#121A2A] rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#1A2336]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-[#1A2336] hover:bg-[#27304a] px-6 py-3 rounded-xl text-sm text-white/90"
              >
                Añadir
              </button>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            {/* Mapa */}
            <div className="relative z-0">
              <MapContainer
                center={[40.4168, -3.7038]} // Madrid por defecto
                zoom={6}
                style={{ height: "600px", width: "100%", borderRadius: "12px" }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                />
                {cities.map((city) => (
                  <Marker
                    key={city.id}
                    position={[city.lat, city.lon]}
                    icon={createIcon(city.icon)}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>{city.name}</strong>
                        <br />
                        {Math.round(city.temp)}°C — {city.description}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}