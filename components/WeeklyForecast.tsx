"use client";
export type DayItem = { label: string; iconUrl: string; max: number; min: number; };

export default function WeeklyForecast({ days }: { days: DayItem[] }) {
  return (
    <section className="bg-[#121A2A] rounded-xl p-6 shadow-lg">
      <h3 className="font-semibold text-white/90">Pronóstico de 7 días</h3>
      <div className="mt-4 flex flex-col gap-2">
        {days.map((d, i) => (
          <div key={i} className="flex items-center justify-between bg-[#1A2336] rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={d.iconUrl} className="w-6 h-6" alt="" />
              <span className="text-sm text-white">{d.label}</span>
            </div>
            <div className="text-sm text-white/60">
              <span className="text-white font-medium">{Math.round(d.max)}°</span> / {Math.round(d.min)}°
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}