import { CountdownTimer } from "@/components/countdown-timer";
import { MusicPlayer } from "@/components/music-player";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";

export default function Home() {
  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(130%_130%_at_50%_0%,#143d2b_0%,#0b2a20_45%,#4a0d14_100%)] px-4 py-6">
      {/* Nieve cayendo */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={160}
        size={0.8}
        vy={0.4}
        color="#ffffff"
      />

      {/* Resplandor cálido superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(232,176,75,0.25),transparent)]" />

      <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
        <SparklesText
          className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-5xl"
          colors={{ first: "#e8b04b", second: "#c1121f" }}
          sparklesCount={12}
        >
          ¿Cuánto falta para Navidad?
        </SparklesText>

        {/* Foto protagonista con el reproductor superpuesto */}
        <MusicPlayer />

        <CountdownTimer />

        <p className="max-w-md text-center text-sm text-white/60 sm:text-base">
          Preparate, porque la cuenta regresiva para la Navidad ya empezó. 🎄✨
        </p>
      </div>
    </main>
  );
}
