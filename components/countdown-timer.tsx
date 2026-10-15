"use client";

import { useEffect, useRef, useState } from "react";

import { Confetti, type ConfettiRef } from "@/components/ui/confetti";

type TimeLeft = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

const CERO: TimeLeft = { dias: 0, horas: 0, minutos: 0, segundos: 0 };

/** Devuelve la próxima Navidad (25 de diciembre 00:00) a partir de `now`. */
function proximaNavidad(now: Date): Date {
  const navidadEsteAnio = new Date(now.getFullYear(), 11, 25, 0, 0, 0, 0);
  // Si ya pasó el 25/12 de este año, apuntamos al del año que viene.
  if (now.getTime() >= navidadEsteAnio.getTime()) {
    return new Date(now.getFullYear() + 1, 11, 25, 0, 0, 0, 0);
  }
  return navidadEsteAnio;
}

function esNavidad(now: Date): boolean {
  return now.getMonth() === 11 && now.getDate() === 25;
}

function calcular(now: Date): TimeLeft {
  const delta = proximaNavidad(now).getTime() - now.getTime();
  if (delta <= 0) return CERO;

  const segundosTotales = Math.floor(delta / 1000);
  return {
    dias: Math.floor(segundosTotales / 86400),
    horas: Math.floor((segundosTotales % 86400) / 3600),
    minutos: Math.floor((segundosTotales % 3600) / 60),
    segundos: segundosTotales % 60,
  };
}

const BLOQUES: { clave: keyof TimeLeft; etiqueta: string }[] = [
  { clave: "dias", etiqueta: "Días" },
  { clave: "horas", etiqueta: "Horas" },
  { clave: "minutos", etiqueta: "Min" },
  { clave: "segundos", etiqueta: "Seg" },
];

export function CountdownTimer() {
  const [montado, setMontado] = useState(false);
  const [tiempo, setTiempo] = useState<TimeLeft>(CERO);
  const [navidad, setNavidad] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);

  useEffect(() => {
    setMontado(true);

    const tick = () => {
      const now = new Date();
      setNavidad(esNavidad(now));
      setTiempo(calcular(now));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Dispara confeti al llegar la Navidad.
  useEffect(() => {
    if (navidad) {
      confettiRef.current?.fire({ particleCount: 180, spread: 120 });
    }
  }, [navidad]);

  if (montado && navidad) {
    return (
      <div className="relative flex flex-col items-center gap-4">
        <Confetti
          ref={confettiRef}
          manualstart
          className="pointer-events-none fixed inset-0 z-50 size-full"
        />
        <p className="text-center text-4xl font-bold text-navidad-dorado drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-6xl">
          ¡Feliz Navidad! 🎄
        </p>
        <p className="text-lg text-white/80">Que la pases hermoso 🎅</p>
      </div>
    );
  }

  return (
    <div className="flex items-stretch justify-center gap-2 sm:gap-4">
      {BLOQUES.map(({ clave, etiqueta }) => (
        <div
          key={clave}
          className="flex min-w-[68px] flex-col items-center gap-1 rounded-2xl border border-navidad-dorado/40 bg-white/5 px-3 py-4 shadow-lg backdrop-blur-md sm:min-w-[104px] sm:px-6 sm:py-6"
        >
          <span className="font-mono text-4xl font-bold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-7xl">
            {montado ? String(tiempo[clave]).padStart(2, "0") : "--"}
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-navidad-dorado sm:text-sm">
            {etiqueta}
          </span>
        </div>
      ))}
    </div>
  );
}
