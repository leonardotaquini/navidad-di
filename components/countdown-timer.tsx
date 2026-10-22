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

/**
 * Devuelve la próxima ocurrencia de `mes`/`dia` a las 00:00 a partir de `now`.
 * `mes` es 0-indexado (0 = enero, 11 = diciembre).
 */
function proximaFecha(now: Date, mes: number, dia: number): Date {
  const esteAnio = new Date(now.getFullYear(), mes, dia, 0, 0, 0, 0);
  // Si ya pasó este año, apuntamos al del año que viene.
  if (now.getTime() >= esteAnio.getTime()) {
    return new Date(now.getFullYear() + 1, mes, dia, 0, 0, 0, 0);
  }
  return esteAnio;
}

function esElDia(now: Date, mes: number, dia: number): boolean {
  return now.getMonth() === mes && now.getDate() === dia;
}

function calcular(now: Date, mes: number, dia: number): TimeLeft {
  const delta = proximaFecha(now, mes, dia).getTime() - now.getTime();
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

type CountdownTimerProps = {
  /** Mes destino, 0-indexado (0 = enero, 11 = diciembre). */
  mes: number;
  /** Día del mes destino. */
  dia: number;
  /** Texto que se muestra arriba del contador, ej: "Falta para el Aguinaldo". */
  titulo: string;
  /** Mensaje grande cuando llega el día. */
  mensajeLlegada: string;
  /** Subtítulo opcional debajo del mensaje de llegada. */
  mensajeSub?: string;
  /** Si dispara confeti al llegar el día. */
  conConfeti?: boolean;
  /** Versión reducida, para contadores secundarios. */
  compacto?: boolean;
};

export function CountdownTimer({
  mes,
  dia,
  titulo,
  mensajeLlegada,
  mensajeSub,
  conConfeti = false,
  compacto = false,
}: CountdownTimerProps) {
  const [montado, setMontado] = useState(false);
  const [tiempo, setTiempo] = useState<TimeLeft>(CERO);
  const [llego, setLlego] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);

  useEffect(() => {
    setMontado(true);

    const tick = () => {
      const now = new Date();
      setLlego(esElDia(now, mes, dia));
      setTiempo(calcular(now, mes, dia));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mes, dia]);

  // Dispara confeti al llegar el día.
  useEffect(() => {
    if (llego && conConfeti) {
      confettiRef.current?.fire({ particleCount: 180, spread: 120 });
    }
  }, [llego, conConfeti]);

  if (montado && llego) {
    return (
      <div className="relative flex flex-col items-center gap-4">
        {conConfeti && (
          <Confetti
            ref={confettiRef}
            manualstart
            className="pointer-events-none fixed inset-0 z-50 size-full"
          />
        )}
        <p className="text-center text-4xl font-bold text-navidad-dorado drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-6xl">
          {mensajeLlegada}
        </p>
        {mensajeSub && <p className="text-lg text-white/80">{mensajeSub}</p>}
      </div>
    );
  }

  return (
    <div className={compacto ? "flex flex-col items-center gap-2" : "flex flex-col items-center gap-3"}>
      <p
        className={
          compacto
            ? "text-center text-xs font-semibold uppercase tracking-widest text-navidad-dorado"
            : "text-center text-sm font-semibold uppercase tracking-widest text-navidad-dorado sm:text-base"
        }
      >
        {titulo}
      </p>
      <div className={compacto ? "flex items-stretch justify-center gap-1.5" : "flex items-stretch justify-center gap-2 sm:gap-4"}>
        {BLOQUES.map(({ clave, etiqueta }) => (
          <div
            key={clave}
            className={
              compacto
                ? "flex min-w-[48px] flex-col items-center gap-0.5 rounded-xl border border-navidad-dorado/40 bg-white/5 px-2 py-2 shadow-md backdrop-blur-md"
                : "flex min-w-[56px] flex-col items-center gap-1 rounded-2xl border border-navidad-dorado/40 bg-white/5 px-3 py-3 shadow-lg backdrop-blur-md sm:min-w-[84px] sm:px-5 sm:py-4"
            }
          >
            <span
              className={
                compacto
                  ? "font-mono text-xl font-bold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-2xl"
                  : "font-mono text-3xl font-bold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:text-5xl"
              }
            >
              {montado ? String(tiempo[clave]).padStart(2, "0") : "--"}
            </span>
            <span
              className={
                compacto
                  ? "text-[0.55rem] font-semibold uppercase tracking-widest text-navidad-dorado"
                  : "text-[0.65rem] font-semibold uppercase tracking-widest text-navidad-dorado sm:text-sm"
              }
            >
              {etiqueta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
