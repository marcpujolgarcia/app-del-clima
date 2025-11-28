"use client";
export default function CurrentWeather({ city, country, temp, rainChancePct, iconUrl, description }: {
  city: string; country: string; temp: number; rainChancePct: number; iconUrl: string; description: string;
}) {
  return (
    <section className="bg-[#121A2A] rounded-xl p-6 shadow-lg flex justify-between items-center">
      <div>
        <h2 className="text-xl font-semibold text-white/90">{city}{country ? `, ${country}` : ""}</h2>
        <p className="text-white/60 mt-1">Probabilidad de lluvia: {rainChancePct}%</p>
        <p className="text-white/70 capitalize mt-1">{description}</p>
        <div className="text-6xl font-bold mt-3 text-white">{Math.round(temp)}°C</div>
      </div>
      <img src={iconUrl} alt="icon" className="w-20 h-20" />
    </section>
  );
}