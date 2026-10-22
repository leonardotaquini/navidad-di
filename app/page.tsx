import { CountdownTimer } from "@/components/countdown-timer";
import { MusicPlayer } from "@/components/music-player";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";
import { getChristmasTracks } from "@/lib/theaudiodb";

export default async function Home() {
  const tracks = await getChristmasTracks();

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[radial-gradient(130%_130%_at_50%_0%,#143d2b_0%,#0b2a20_45%,#4a0d14_100%)] px-4 py-4">
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

      <div className="relative z-10 flex flex-col items-center gap-3 sm:gap-4">
        <SparklesText
          className="text-center text-2xl font-extrabold tracking-tight text-white sm:text-4xl"
          colors={{ first: "#e8b04b", second: "#c1121f" }}
          sparklesCount={12}
        >
          ¿Cuánto falta para Navidad?
        </SparklesText>

        {/* Foto protagonista + reproductor de música navideña */}
        <MusicPlayer tracks={tracks} />

        <CountdownTimer
          mes={11}
          dia={25}
          titulo="Falta para Navidad"
          mensajeLlegada="¡Feliz Navidad! 🎄"
          mensajeSub="Que la pases hermoso 🎅"
          conConfeti
        />

        <CountdownTimer
          mes={11}
          dia={20}
          titulo="Falta para el Aguinaldo"
          mensajeLlegada="¡Llegó el Aguinaldo! 💸"
          mensajeSub="A disfrutarlo 🥳"
          compacto
        />

        <p className="max-w-md text-center text-xs text-white/60 sm:text-sm">
          Preparate, porque la cuenta regresiva para la Navidad ya empezó. 🎄✨
        </p>
      </div>
    </main>
  );
}
