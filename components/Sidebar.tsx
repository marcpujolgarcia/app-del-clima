"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloudSun, Building2, Map, Menu, X } from "lucide-react";
import WaveIcon from "@/components/WaveIcon"; // nuestro icono personalizado

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const baseClass =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm";
  const activeClass = baseClass + " bg-[#1A2336] text-white/90";
  const inactiveClass =
    baseClass + " text-white/60 hover:text-white/90 hover:bg-[#1A2336]/80";

  return (
    <>
      {/* Barra superior en móvil (siempre visible, arriba) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#121A2A] shadow-lg">
        <div className="text-white/90 font-semibold tracking-wide text-lg">
          Tiempo
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-white/90 focus:outline-none"
          aria-label="Abrir menú"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Menú desplegable en móvil (pegado justo debajo del header) */}
      {open && (
        <div className="md:hidden absolute top-[56px] left-0 right-0 z-40 p-4 bg-[#121A2A] shadow-lg flex flex-col gap-2">
          <Link
            href="/"
            className={pathname === "/" ? activeClass : inactiveClass}
            onClick={() => setOpen(false)}
          >
            <CloudSun size={20} />
            <span>Clima</span>
          </Link>
          <Link
            href="/ciudades"
            className={pathname === "/ciudades" ? activeClass : inactiveClass}
            onClick={() => setOpen(false)}
          >
            <Building2 size={20} />
            <span>Ciudades</span>
          </Link>
          <Link
            href="/mapa"
            className={pathname === "/mapa" ? activeClass : inactiveClass}
            onClick={() => setOpen(false)}
          >
            <Map size={20} />
            <span>Mapa</span>
          </Link>
          <Link
            href="/mar"
            className={pathname === "/mar" ? activeClass : inactiveClass}
            onClick={() => setOpen(false)}
          >
            <WaveIcon className="w-5 h-5 text-white/90" />
            <span>Estado del Mar</span>
          </Link>
        </div>
      )}

      {/* Sidebar fijo en escritorio */}
      <aside className="hidden md:flex w-64 shrink-0 p-4 bg-[#121A2A] rounded-xl shadow-lg flex-col gap-6">
        <div className="text-white/90 font-semibold tracking-wide px-2 text-lg">
          Tiempo
        </div>
        <nav className="mt-2 flex flex-col gap-2">
          <Link href="/" className={pathname === "/" ? activeClass : inactiveClass}>
            <CloudSun size={20} />
            <span>Clima</span>
          </Link>
          <Link
            href="/ciudades"
            className={pathname === "/ciudades" ? activeClass : inactiveClass}
          >
            <Building2 size={20} />
            <span>Ciudades</span>
          </Link>
          <Link
            href="/mapa"
            className={pathname === "/mapa" ? activeClass : inactiveClass}
          >
            <Map size={20} />
            <span>Mapa</span>
          </Link>
          <Link
            href="/mar"
            className={pathname === "/mar" ? activeClass : inactiveClass}
          >
            <WaveIcon className="w-5 h-5 text-white/90" />
            <span>Estado del Mar</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}