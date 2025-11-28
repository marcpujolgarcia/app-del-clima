"use client";
export type HourItem = { time: string; temp: number; iconUrl: string; };

export default function TodayForecast({ items }: { items: HourItem[] }) {
  return (
    <section className="bg-[#121A2A] rounded-xl p-6 shadow-lg">
      <h3 className="font-semibold text-white/90">Pronóstico de hoy</h3>

      {/* En móvil → columna vertical; en escritorio → grid horizontal */}
      <div className="mt-4 flex flex-col gap-4 md:grid md:grid-cols-6">
        {items.map((h) => (
          <div
            key={h.time}
            className="bg-[#1A2336] rounded-xl p-3 flex flex-row md:flex-col items-center justify-between md:justify-center w-full"
          >
            {/* Hora */}
            <span className="text-sm text-white/80 md:text-xs">{h.time}</span>

            {/* Icono */}
            <img src={h.iconUrl} className="w-8 h-8 mx-2 md:mt-2" alt="" />

            {/* Temperatura */}
            <span className="text-base font-semibold text-white md:mt-2 md:text-sm">
              {Math.round(h.temp)}°
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}