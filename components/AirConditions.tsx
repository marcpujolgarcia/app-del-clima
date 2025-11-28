"use client";
export default function AirConditions({
  realFeel,
  windKmh,
  rainChancePct,
  uvIndex,
}: {
  realFeel: number;
  windKmh: number;
  rainChancePct: number;
  uvIndex: number;
}) {
  return (
    <section className="bg-[#121A2A] rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-white/90">Condiciones del aire</h3>
      </div>

      {/* En móvil → columna vertical; en escritorio → grid horizontal */}
      <div className="mt-4 flex flex-col gap-4 md:grid md:grid-cols-4">
        <div className="bg-[#1A2336] rounded-xl p-4 flex flex-row md:flex-col items-center justify-between md:justify-center">
          <div className="text-sm text-white/80 md:text-xs">Sensación térmica</div>
          <div className="text-base font-semibold text-white md:mt-2 md:text-lg">
            {Math.round(realFeel)}°
          </div>
        </div>

        <div className="bg-[#1A2336] rounded-xl p-4 flex flex-row md:flex-col items-center justify-between md:justify-center">
          <div className="text-sm text-white/80 md:text-xs">Viento</div>
          <div className="text-base font-semibold text-white md:mt-2 md:text-lg">
            {windKmh.toFixed(1)} km/h
          </div>
        </div>

        <div className="bg-[#1A2336] rounded-xl p-4 flex flex-row md:flex-col items-center justify-between md:justify-center">
          <div className="text-sm text-white/80 md:text-xs">Prob. de lluvia</div>
          <div className="text-base font-semibold text-white md:mt-2 md:text-lg">
            {Math.round(rainChancePct)}%
          </div>
        </div>

        <div className="bg-[#1A2336] rounded-xl p-4 flex flex-row md:flex-col items-center justify-between md:justify-center">
          <div className="text-sm text-white/80 md:text-xs">Índice UV</div>
          <div className="text-base font-semibold text-white md:mt-2 md:text-lg">
            {uvIndex}
          </div>
        </div>
      </div>
    </section>
  );
}