"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

// ✅ Ciudades por defecto
const DEFAULT_CITY_NAMES = ["Madrid", "Barcelona", "Bilbao", "Málaga"];

type CityWeather = {
  id: string;
  name: string;
  temp: number;
  icon: string;
  description: string;
};

function SortableCity({
  city,
  onDelete,
}: {
  city: CityWeather;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: city.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-[#121A2A] rounded-xl p-4 shadow-lg flex justify-between items-center cursor-grab active:cursor-grabbing w-full select-none"
    >
      {/* Izquierda: nombre y descripción */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold">{city.name}</h2>
        <p className="text-sm text-white/60 capitalize">{city.description}</p>
      </div>

      {/* Derecha: temperatura, icono (solo en escritorio), botón */}
      <div className="flex items-center gap-4">
        {/* Temperatura */}
        <p className="text-3xl font-bold">{Math.round(city.temp)}°C</p>

        {/* Icono solo en escritorio */}
        <div className="hidden md:flex items-center justify-center">
          <img
            src={`https://openweathermap.org/img/wn/${city.icon}@2x.png`}
            alt="icon"
            className="w-12 h-12 pointer-events-none select-none"
          />
        </div>

        {/* Botón eliminar */}
        <button
          onClick={() => onDelete(city.id)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-700 transition shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default function CiudadesPage() {
  const [query, setQuery] = useState("");
  const [cities, setCities] = useState<CityWeather[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  );

  const fetchCityWeather = async (name: string): Promise<CityWeather | null> => {
    if (!API_KEY) {
      setError("Falta NEXT_PUBLIC_WEATHER_API_KEY en tu .env.local");
      return null;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          name
        )}&appid=${API_KEY}&units=metric&lang=es`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: `${data.id}-${Date.now()}`,
        name: `${data.name}, ${data.sys.country}`,
        temp: data.main.temp,
        icon: data.weather?.[0]?.icon ?? "01d",
        description: data.weather?.[0]?.description ?? "despejado",
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem("ciudades");
      if (saved) {
        const parsed: CityWeather[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCities(parsed);
          return;
        }
      }
      const results = await Promise.all(DEFAULT_CITY_NAMES.map((c) => fetchCityWeather(c)));
      const filtered = results.filter((c): c is CityWeather => c !== null);
      setCities(filtered);
      localStorage.setItem("ciudades", JSON.stringify(filtered));
    };
    init();
  }, []);

  useEffect(() => {
    if (cities.length > 0) {
      localStorage.setItem("ciudades", JSON.stringify(cities));
    }
  }, [cities]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setError(null);
    const city = await fetchCityWeather(query.trim());
    if (!city) {
      setError("Ciudad no encontrada");
      return;
    }
    const updated = [...cities, city];
    setCities(updated);
    localStorage.setItem("ciudades", JSON.stringify(updated));
    setQuery("");
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = cities.findIndex((c) => c.id === active.id);
      const newIndex = cities.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(cities, oldIndex, newIndex);
        setCities(newOrder);
        localStorage.setItem("ciudades", JSON.stringify(newOrder));
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#0B1220] text-white pt-20 md:pt-0">
      <div className="max-w-7xl mx-auto p-6">
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

            {/* Lista */}
            <div className="overflow-y-auto max-h-[500px] pr-2 w-full">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={cities.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-4 w-full">
                    {cities.length === 0 ? (
                      <div className="text-white/60 text-sm">
                        No tienes ciudades guardadas. Añade una arriba para empezar.
                      </div>
                    ) : (
                      cities.map((city) => (
                        <SortableCity
                          key={city.id}
                          city={city}
                          onDelete={(id) => {
                            const updated = cities.filter((c) => c.id !== id);
                            setCities(updated);
                            localStorage.setItem("ciudades", JSON.stringify(updated));
                          }}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}