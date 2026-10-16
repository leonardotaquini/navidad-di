"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";

type Track = {
  src: string;
  titulo: string;
};

/**
 * Lista de canciones. Copiá tus archivos en `public/music/` con estos nombres
 * (o editá `src` y `titulo` para que coincidan con los tuyos).
 */
const TRACKS: Track[] = [
  { src: "/music/track-1.mp3", titulo: "Canción 1" },
  { src: "/music/track-2.mp3", titulo: "Canción 2" },
  { src: "/music/track-3.mp3", titulo: "Canción 3" },
  { src: "/music/track-4.mp3", titulo: "Canción 4" },
  { src: "/music/track-5.mp3", titulo: "Canción 5" },
  { src: "/music/track-6.mp3", titulo: "Canción 6" },
  { src: "/music/track-7.mp3", titulo: "Canción 7" },
  { src: "/music/track-8.mp3", titulo: "Canción 8" },
];

/** Formatea segundos a `m:ss`. Devuelve "0:00" si aún no hay metadata válida. */
function formatearTiempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const total = Math.floor(segundos);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [indiceActual, setIndiceActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  // Autoplay "real" está bloqueado por los navegadores hasta que el usuario
  // interactúa. Arrancamos la música en el primer gesto (click/toque/tecla) en
  // cualquier parte de la página; para el usuario se siente como inicio automático.
  useEffect(() => {
    const iniciar = () => {
      audioRef.current?.play().catch(() => {});
    };
    const opts = { once: true } as const;
    window.addEventListener("pointerdown", iniciar, opts);
    window.addEventListener("keydown", iniciar, opts);
    window.addEventListener("touchstart", iniciar, opts);
    return () => {
      window.removeEventListener("pointerdown", iniciar);
      window.removeEventListener("keydown", iniciar);
      window.removeEventListener("touchstart", iniciar);
    };
  }, []);

  // Al cambiar de pista, el <audio> recarga el nuevo src: reproducir si venía sonando.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setTiempoActual(0);
    setDuracion(0);
    if (reproduciendo) {
      audio.play().catch(() => setReproduciendo(false));
    }
    // Solo depende del índice: reaccionar al cambio de pista, no a cada play/pausa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceActual]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => setReproduciendo(false));
    } else {
      audio.pause();
    }
  };

  const anterior = () => {
    setReproduciendo(true);
    setIndiceActual((i) => (i - 1 + TRACKS.length) % TRACKS.length);
  };

  const siguiente = () => {
    setReproduciendo(true);
    setIndiceActual((i) => (i + 1) % TRACKS.length);
  };

  const onSeekChange = (valor: number) => {
    setTiempoActual(valor);
    const audio = audioRef.current;
    if (audio && !arrastrando) {
      audio.currentTime = valor;
    }
  };

  const commitSeek = (valor: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = valor;
    setArrastrando(false);
  };

  const pistaActual = TRACKS[indiceActual];
  const progreso = duracion > 0 ? (tiempoActual / duracion) * 100 : 0;

  return (
    <div className="relative">
      <audio
        ref={audioRef}
        src={pistaActual.src}
        preload="metadata"
        onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (!arrastrando) setTiempoActual(e.currentTarget.currentTime);
        }}
        onPlay={() => setReproduciendo(true)}
        onPause={() => setReproduciendo(false)}
        onEnded={siguiente}
      />

      {/* Resplandor detrás de la foto */}
      <div className="absolute -inset-3 rounded-[2rem] bg-[conic-gradient(from_0deg,#e8b04b,#c1121f,#0b3d2e,#e8b04b)] opacity-70 blur-xl" />

      {/* Foto + reproductor superpuesto */}
      <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-navidad-dorado/80 shadow-2xl">
        <Image
          src="/erwin.jpeg"
          alt="Erwin, el elfo del Taller de Santa"
          width={320}
          height={480}
          priority
          className="h-auto w-[260px] object-cover sm:w-[320px]"
        />

        {/* Flecha anterior (costado izquierdo) */}
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={anterior}
          aria-label="Canción anterior"
          className="absolute left-2 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-navidad-dorado sm:size-11"
        >
          <SkipBack className="size-5" />
        </Button>

        {/* Flecha siguiente (costado derecho) */}
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={siguiente}
          aria-label="Canción siguiente"
          className="absolute right-2 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-navidad-dorado sm:size-11"
        >
          <SkipForward className="size-5" />
        </Button>

        {/* Reproductor al pie de la foto */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-10">
          {/* Título de la pista */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Music2 className="size-3.5 shrink-0 text-navidad-dorado" />
              <span className="truncate text-xs font-semibold text-white">
                {pistaActual.titulo}
              </span>
            </div>
            <span className="shrink-0 text-[0.65rem] font-medium tabular-nums text-white/60">
              {indiceActual + 1} / {TRACKS.length}
            </span>
          </div>

          {/* Barra de progreso (seek) */}
          <input
            type="range"
            min={0}
            max={duracion || 0}
            step={0.1}
            value={tiempoActual}
            onPointerDown={() => setArrastrando(true)}
            onChange={(e) => onSeekChange(Number(e.target.value))}
            onPointerUp={(e) =>
              commitSeek(Number((e.target as HTMLInputElement).value))
            }
            aria-label="Barra de progreso"
            style={{
              background: `linear-gradient(to right, var(--color-navidad-dorado) ${progreso}%, rgba(255,255,255,0.25) ${progreso}%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-navidad-dorado [&::-moz-range-thumb]:shadow [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-navidad-dorado [&::-webkit-slider-thumb]:shadow"
          />

          {/* Tiempos + play/pausa */}
          <div className="flex items-center justify-between gap-2">
            <span className="w-9 text-[0.65rem] tabular-nums text-white/70">
              {formatearTiempo(tiempoActual)}
            </span>
            <Button
              variant="outline"
              size="icon-lg"
              onClick={togglePlay}
              aria-label={reproduciendo ? "Pausar" : "Reproducir"}
              className="size-11 rounded-full border-navidad-dorado/60 bg-navidad-dorado/30 text-white backdrop-blur-sm hover:bg-navidad-dorado/50 hover:text-white"
            >
              {reproduciendo ? (
                <Pause className="size-5" />
              ) : (
                <Play className="size-5 translate-x-px" />
              )}
            </Button>
            <span className="w-9 text-right text-[0.65rem] tabular-nums text-white/70">
              {formatearTiempo(duracion)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
