"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Track } from "@/lib/theaudiodb";

/* --- Tipos mínimos del YouTube IFrame Player API (evita dependencia nueva) --- */
type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  loadVideoById(videoId: string): void;
  destroy(): void;
};

type YTPlayerEvent = { target: YTPlayer; data: number };

type YTNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      videoId: string;
      playerVars?: Record<string, number>;
      events?: {
        onReady?: (e: YTPlayerEvent) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Carga el script del IFrame API una sola vez y resuelve cuando `window.YT` está listo. */
function cargarApiYoutube(): Promise<YTNamespace> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      if (window.YT) resolve(window.YT);
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(script);
    }
  });
}

/** Formatea segundos a `m:ss`. Devuelve "0:00" si aún no hay metadata válida. */
function formatearTiempo(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos < 0) return "0:00";
  const total = Math.floor(segundos);
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${min}:${String(seg).padStart(2, "0")}`;
}

export function MusicPlayer({ tracks }: { tracks: Track[] }) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  const [indiceActual, setIndiceActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [silenciado, setSilenciado] = useState(true);
  const [tiempoActual, setTiempoActual] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  // Crea el player de YouTube una sola vez. Arranca en mudo para que el
  // navegador permita el autoplay; el usuario activa el sonido con el botón.
  useEffect(() => {
    if (tracks.length === 0) return;
    let destruido = false;

    cargarApiYoutube().then((YT) => {
      if (destruido || !contenedorRef.current) return;

      playerRef.current = new YT.Player(contenedorRef.current, {
        videoId: tracks[0].youtubeId,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e) => {
            setDuracion(e.target.getDuration());
          },
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.ENDED) {
              setReproduciendo(true);
              setIndiceActual(
                (i) => (i + 1) % tracks.length,
              );
            } else if (e.data === YT.PlayerState.PLAYING) {
              setReproduciendo(true);
              setDuracion(e.target.getDuration());
            } else if (e.data === YT.PlayerState.PAUSED) {
              setReproduciendo(false);
            }
          },
        },
      });
    });

    return () => {
      destruido = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [tracks]);

  // Al cambiar de pista, cargar el nuevo video (loadVideoById autoplay).
  // Se saltea la pista inicial, que ya la monta el player al crearse.
  const esMontaje = useRef(true);
  useEffect(() => {
    if (esMontaje.current) {
      esMontaje.current = false;
      return;
    }
    const player = playerRef.current;
    if (!player) return;
    setTiempoActual(0);
    setDuracion(0);
    player.loadVideoById(tracks[indiceActual].youtubeId);
    if (silenciado) player.mute();
    else player.unMute();
    // Reaccionar solo al cambio de pista.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indiceActual]);

  // Barra de progreso: mientras reproduce, leer tiempo/duración del player.
  useEffect(() => {
    if (!reproduciendo) return;
    const id = window.setInterval(() => {
      const player = playerRef.current;
      if (!player || arrastrando) return;
      setTiempoActual(player.getCurrentTime());
      const dur = player.getDuration();
      if (dur > 0) setDuracion(dur);
    }, 500);
    return () => window.clearInterval(id);
  }, [reproduciendo, arrastrando]);

  const togglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (reproduciendo) player.pauseVideo();
    else player.playVideo();
  };

  const anterior = () => {
    setReproduciendo(true);
    setIndiceActual((i) => (i - 1 + tracks.length) % tracks.length);
  };

  const siguiente = () => {
    setReproduciendo(true);
    setIndiceActual((i) => (i + 1) % tracks.length);
  };

  const activarSonido = () => {
    const player = playerRef.current;
    if (!player) return;
    player.unMute();
    player.setVolume(100);
    player.playVideo();
    setSilenciado(false);
  };

  const silenciar = () => {
    playerRef.current?.mute();
    setSilenciado(true);
  };

  const onSeekChange = (valor: number) => {
    setTiempoActual(valor);
    if (!arrastrando) playerRef.current?.seekTo(valor, true);
  };

  const commitSeek = (valor: number) => {
    playerRef.current?.seekTo(valor, true);
    setArrastrando(false);
  };

  if (tracks.length === 0) return null;

  const pistaActual = tracks[indiceActual];
  const progreso = duracion > 0 ? (tiempoActual / duracion) * 100 : 0;

  return (
    <div className="relative">
      {/* Resplandor detrás de la foto */}
      <div className="absolute -inset-3 rounded-[2rem] bg-[conic-gradient(from_0deg,#e8b04b,#c1121f,#0b3d2e,#e8b04b)] opacity-70 blur-xl" />

      {/* Foto + reproductor superpuesto */}
      <div className="relative overflow-hidden rounded-[1.75rem] border-4 border-navidad-dorado/80 shadow-2xl">
        {/* Player de YouTube: fuente de audio oculta detrás de la foto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
        >
          <div ref={contenedorRef} className="h-full w-full" />
        </div>

        <Image
          src="/erwin.jpeg"
          alt="Erwin, el elfo del Taller de Santa"
          width={320}
          height={480}
          priority
          className="relative z-[1] h-auto w-[260px] object-cover sm:w-[320px]"
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

        {/* Botón activar/silenciar sonido (esquina superior) */}
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={silenciado ? activarSonido : silenciar}
          aria-label={silenciado ? "Activar sonido" : "Silenciar"}
          className="absolute right-2 top-2 z-10 size-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-navidad-dorado sm:size-11"
        >
          {silenciado ? (
            <VolumeX className="size-5" />
          ) : (
            <Volume2 className="size-5" />
          )}
        </Button>

        {/* Aviso cuando está en mudo: invita a activar el sonido */}
        {silenciado && (
          <button
            type="button"
            onClick={activarSonido}
            className="absolute left-2 top-2 z-10 rounded-full bg-navidad-dorado/90 px-3 py-1.5 text-[0.7rem] font-semibold text-black shadow-lg backdrop-blur-sm transition hover:bg-navidad-dorado"
          >
            🔊 Tocá para escuchar
          </button>
        )}

        {/* Reproductor al pie de la foto */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-black/85 via-black/55 to-transparent px-3 pb-3 pt-10">
          {/* Título de la pista */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <Music2 className="size-3.5 shrink-0 text-navidad-dorado" />
              <span className="truncate text-xs font-semibold text-white">
                {pistaActual.titulo}
                <span className="font-normal text-white/60">
                  {" "}
                  · {pistaActual.artista}
                </span>
              </span>
            </div>
            <span className="shrink-0 text-[0.65rem] font-medium tabular-nums text-white/60">
              {indiceActual + 1} / {tracks.length}
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
