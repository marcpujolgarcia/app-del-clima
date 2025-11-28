"use client";
export default function SearchBar({
  value,
  onChange,
  onSearch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <div className="w-full flex gap-2">
      <input
        placeholder="Buscar ciudades"
        className="w-full bg-[#121A2A] rounded-xl px-4 py-3 text-sm text-white/90 placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-[#1A2336]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        // 👉 Nuevo: al pulsar Enter se ejecuta onSearch
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
      />
      <button
        onClick={onSearch}
        className="bg-[#1A2336] hover:bg-[#27304a] px-4 py-3 rounded-xl text-sm text-white/90"
      >
        Buscar
      </button>
    </div>
  );
}