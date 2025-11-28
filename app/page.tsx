"use client";
import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import CurrentWeather from "@/components/CurrentWeather";
import TodayForecast, { HourItem } from "@/components/TodayForecast";
import AirConditions from "@/components/AirConditions";
import WeeklyForecast, { DayItem } from "@/components/WeeklyForecast";
import Chart from "chart.js/auto";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function Page() {
  const [city, setCity] = useState("Barcelona");
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // refs para gráficos
  const chartRefDesktop = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceDesktop = useRef<any>(null);

  const chartRefMobile = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceMobile = useRef<any>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=es`
            );
            if (!res.ok) throw new Error("No se pudo obtener clima por ubicación");
            const data = await res.json();
            setCity(data.name);
            fetchAll(data.name);
          } catch {
            fetchAll("Barcelona");
          }
        },
        () => {
          fetchAll("Barcelona");
        }
      );
    } else {
      fetchAll("Barcelona");
    }
  }, []);

  const fetchAll = async (selectedCity?: string) => {
    const targetCity = selectedCity || city;
    if (!targetCity) return;
    try {
      setError(null);
      setWeather(null);
      setForecast(null);

      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          targetCity
        )}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!currentRes.ok) throw new Error("Ciudad no encontrada");
      const current = await currentRes.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${current.coord.lat}&lon=${current.coord.lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!forecastRes.ok) throw new Error("No se pudo obtener el pronóstico");
      const fc = await forecastRes.json();

      setWeather(current);
      setForecast(fc);
    } catch (e: any) {
      setError(e.message || "Error al obtener el clima.");
    }
  };

  const iconUrl = weather
    ? `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
    : "";

  const todayItems: HourItem[] = (forecast?.list || [])
    .filter((item: any) => {
      const d = new Date(item.dt * 1000);
      const now = new Date();
      return d.getDate() === now.getDate();
    })
    .slice(0, 6)
    .map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      temp: item.main.temp,
      iconUrl: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
    }));

  const byDay = new Map<string, { temps: number[]; icon: string }>();
  (forecast?.list || []).forEach((item: any) => {
    const date = new Date(item.dt * 1000);
    const key = date.toLocaleDateString("es-ES", { weekday: "long" });
    const prev = byDay.get(key) || { temps: [], icon: item.weather[0].icon };
    prev.temps.push(item.main.temp);
    byDay.set(key, prev);
  });
  const days: DayItem[] = Array.from(byDay.entries())
    .slice(0, 7)
    .map(([label, v]) => ({
      label: capitalize(label),
      iconUrl: `https://openweathermap.org/img/wn/${v.icon}.png`,
      max: Math.max(...v.temps),
      min: Math.min(...v.temps),
    }));

  function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Gráfico desktop (7 días)
  useEffect(() => {
    if (!days.length || !chartRefDesktop.current) return;
    if (chartInstanceDesktop.current) chartInstanceDesktop.current.destroy();

    chartInstanceDesktop.current = new Chart(chartRefDesktop.current, {
      type: "line",
      data: {
        labels: days.map((d) => d.label),
        datasets: [
          {
            label: "Máximas (°C)",
            data: days.map((d) => d.max),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.25)",
            fill: false,
            tension: 0.3,
          },
          {
            label: "Mínimas (°C)",
            data: days.map((d) => d.min),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.25)",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
          x: { ticks: { color: "#fff" }, grid: { display: false } },
        },
      },
    });
  }, [days]);

  // Gráfico móvil (3 días)
  useEffect(() => {
    if (!days.length || !chartRefMobile.current) return;
    if (chartInstanceMobile.current) chartInstanceMobile.current.destroy();

    const subset = days.slice(0, 3);

    chartInstanceMobile.current = new Chart(chartRefMobile.current, {
      type: "line",
      data: {
        labels: subset.map((d) => d.label),
        datasets: [
          {
            label: "Máximas (°C)",
            data: subset.map((d) => d.max),
            borderColor: "#ef4444",
            backgroundColor: "rgba(239,68,68,0.25)",
            fill: false,
            tension: 0.3,
          },
          {
            label: "Mínimas (°C)",
            data: subset.map((d) => d.min),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59,130,246,0.25)",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: "#fff" } } },
        scales: {
          y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.1)" } },
          x: { ticks: { color: "#fff" }, grid: { display: false } },
        },
      },
    });
  }, [days]);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white pt-16 md:pt-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[256px_1fr_360px] gap-6">
          <Sidebar />

          {/* Columna central */}
          <div className="flex flex-col gap-6">
            <SearchBar
              value={city}
              onChange={setCity}
              onSearch={() => fetchAll(city)}
            />

            {error && <p className="text-red-300">{error}</p>}

            {weather && (
              <>
                <CurrentWeather
                  city={weather.name}
                  country={weather.sys?.country}
                  temp={weather.main.temp}
                  rainChancePct={weather.clouds?.all ?? 0}
                  description={weather.weather[0].description}
                  iconUrl={iconUrl}
                />
                <TodayForecast items={todayItems} />
                <AirConditions
                  realFeel={weather.main.feels_like}
                  windKmh={weather.wind.speed * 3.6}
                  rainChancePct={weather.clouds?.all ?? 0}
                  uvIndex={Math.round((weather.clouds?.all ?? 0) / 33)}
                />

                {/* Pronóstico de 7 días en móvil y tablet */}
                <div className="flex md:hidden flex-col gap-6">
                  {days.length > 0 && <WeeklyForecast days={days} />}
                  {/* Evolución de temperaturas en móvil: última tarjeta (3 días) */}
                  {days.length > 0 && (
                    <div className="bg-[#121A2A] rounded-xl p-4 shadow-lg h-64">
                      <h2 className="text-lg font-semibold mb-2">
                        Evolución de temperaturas (3 días)
                      </h2>
                      <canvas ref={chartRefMobile}></canvas>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Columna derecha: solo escritorio */}
          <div className="hidden md:flex flex-col gap-6">
            {days.length > 0 && <WeeklyForecast days={days} />}
            {/* Evolución de temperaturas en escritorio: debajo del pronóstico 7 días (7 días) */}
            {days.length > 0 && (
              <div className="bg-[#121A2A] rounded-xl p-4 shadow-lg h-64">
                <h2 className="text-lg font-semibold mb-2">
                  Evolución de temperaturas
                </h2>
                <canvas ref={chartRefDesktop}></canvas>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
