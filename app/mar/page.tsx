"use client";
import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Chart from "chart.js/auto";

type MarineHourly = {
  time: string[];
  wave_height: number[];
  wave_direction: number[];
  wave_period: number[];
};

type DailyWind = {
  time: string[];
  wind_speed_10m_max: number[];
  wind_direction_10m_dominant: number[];
};

export default function MarPage() {
  const [marine, setMarine] = useState<MarineHourly | null>(null);
  const [daily, setDaily] = useState<DailyWind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [city, setCity] = useState<string>("Barcelona");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Referencias para la gráfica
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Buscar coordenadas de la ciudad
  const fetchCoords = async (cityName: string) => {
    try {
      setError(null);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityName
        )}&count=1`
      );
      if (!res.ok) throw new Error("No se pudo buscar la ciudad");
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude } = data.results[0];
        setCoords({ lat: latitude, lon: longitude });
      } else {
        throw new Error("Ciudad no encontrada");
      }
    } catch (e: any) {
      setError(e.message || "Error al buscar ciudad");
    }
  };

  // Buscar datos marinos (olas)
  const fetchMarine = async (lat: number, lon: number) => {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period&timezone=Europe/Madrid`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo obtener datos marinos");
    const data = await res.json();
    if (!data?.hourly?.wave_height || !data?.hourly?.time) {
      throw new Error("Respuesta incompleta de la API (olas)");
    }
    return data.hourly as MarineHourly;
  };

  // Buscar variables diarias de viento (máximo y dirección dominante)
  const fetchDailyWind = async (lat: number, lon: number) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=wind_speed_10m_max,wind_direction_10m_dominant&wind_speed_unit=kmh&timezone=Europe/Madrid`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo obtener datos diarios de viento");
    const data = await res.json();
    if (!data?.daily?.wind_speed_10m_max || !data?.daily?.wind_direction_10m_dominant) {
      throw new Error("Respuesta incompleta de la API (viento)");
    }
    return data.daily as DailyWind;
  };

  // Cuando cambian las coordenadas, pedimos datos
  useEffect(() => {
    const load = async () => {
      if (!coords) return;
      try {
        setError(null);
        setLoading(true);
        const [marineData, dailyWindData] = await Promise.all([
          fetchMarine(coords.lat, coords.lon),
          fetchDailyWind(coords.lat, coords.lon),
        ]);
        setMarine(marineData);
        setDaily(dailyWindData);
      } catch (e: any) {
        setError(e.message || "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [coords]);

  // Al cargar por primera vez, buscamos Barcelona
  useEffect(() => {
    fetchCoords(city);
  }, []);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!city.trim()) return;
    fetchCoords(city);
  };

  // Renderizar/actualizar la gráfica cuando hay datos de marine
  useEffect(() => {
    if (!marine || !chartRef.current) return;

    // Destruir instancia anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const labels = marine.time.slice(0, 12).map((t) =>
      new Date(t).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    const dataPoints = marine.wave_height.slice(0, 12);

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Altura de olas (m)",
            data: dataPoints,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.25)",
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // mobile-first: ocupa el alto contenedor
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#ffffff" },
            grid: { color: "rgba(255,255,255,0.08)" },
          },
          x: {
            ticks: { color: "#ffffff" },
            grid: { display: false },
          },
        },
        plugins: {
          legend: {
            labels: { color: "#ffffff" },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.y.toFixed(2)} m`,
            },
          },
        },
      },
    });

    // Limpieza al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [marine]);

  return (
    // 👉 padding-top en móvil para que el buscador no quede tapado por el menú superior
    <main className="min-h-screen bg-[#0B1220] text-white pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] gap-6">
          <Sidebar />
          <div className="flex flex-col gap-6">
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Buscar ciudad..."
                className="flex-1 px-4 py-2 rounded-lg bg-[#1A2336] text-white/90 placeholder-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                Buscar
              </button>
            </form>

            {/* Gráfica mobile-first: Altura de olas (justo debajo del buscador) */}
            {marine && (
              <div className="bg-[#121A2A] rounded-xl p-4 shadow-lg h-64 md:h-72">
                <h2 className="text-lg font-semibold mb-2">Altura de olas</h2>
                <canvas ref={chartRef} />
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-700/40 text-red-300 rounded-lg p-4">
                {error}
              </div>
            )}
            {loading && <p className="text-white/60">Cargando datos...</p>}

            {marine ? (
              <>
                {/* 👉 Condiciones marinas */}
                <div className="bg-[#121A2A] rounded-xl p-6 shadow-lg">
                  <h2 className="text-lg font-semibold mb-4">
                    Condiciones marinas ({city})
                  </h2>
                  {/* En móvil → columna vertical; en escritorio → grid */}
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-3">
                    {marine.time.slice(0, 9).map((t: string, i: number) => (
                      <div
                        key={t}
                        className="flex flex-col bg-[#1A2336] rounded-lg p-4 w-full"
                      >
                        <span className="text-sm text-white/60">
                          {new Date(t).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="text-white font-semibold">
                          🌊 Altura: {marine.wave_height[i]?.toFixed(2)} m
                        </span>
                        <span className="text-white/80">
                          🧭 Dirección: {Math.round(marine.wave_direction[i])}°
                        </span>
                        <span className="text-white/80">
                          ⏱️ Periodo: {marine.wave_period[i]?.toFixed(1)} s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 👉 Condiciones de viento (daily) */}
                {daily && (
                  <div className="bg-[#121A2A] rounded-xl p-6 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4">
                      Condiciones de viento ({city})
                    </h2>
                    <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
                      <div className="flex flex-col bg-[#1A2336] rounded-lg p-4 w-full">
                        <span className="text-white/60 text-sm">
                          Hoy{" "}
                          {daily.time?.[0]
                            ? new Date(daily.time[0]).toLocaleDateString("es-ES", {
                                weekday: "short",
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : ""}
                        </span>
                        <span className="text-white font-semibold">
                          💨 Viento máximo:{" "}
                          {typeof daily.wind_speed_10m_max?.[0] === "number"
                            ? `${daily.wind_speed_10m_max[0].toFixed(1)} km/h`
                            : "—"}
                        </span>
                      </div>

                      <div className="flex flex-col bg-[#1A2336] rounded-lg p-4 w-full">
                        <span className="text-white/60 text-sm">
                          Hoy{" "}
                          {daily.time?.[0]
                            ? new Date(daily.time[0]).toLocaleDateString("es-ES", {
                                weekday: "short",
                                day: "2-digit",
                                month: "2-digit",
                              })
                            : ""}
                        </span>
                        <span className="text-white font-semibold">
                          🧭 Dirección dominante:{" "}
                          {typeof daily.wind_direction_10m_dominant?.[0] === "number"
                            ? `${Math.round(daily.wind_direction_10m_dominant[0])}°`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <p className="text-white/60">Introduce una ciudad para ver datos</p>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}