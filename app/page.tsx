import Image from "next/image";

import { CountdownTimer } from "@/components/countdown-timer";
import { Particles } from "@/components/ui/particles";
import { SparklesText } from "@/components/ui/sparkles-text";

export default function Home() {
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

        {/* Foto protagonista */}
        <div className="relative">
          {/* Resplandor detrás de la foto */}
          <div className="absolute -inset-3 rounded-[2rem] bg-[conic-gradient(from_0deg,#e8b04b,#c1121f,#0b3d2e,#e8b04b)] opacity-70 blur-xl" />
          <div className="relative overflow-hidden rounded-[1.5rem] border-4 border-navidad-dorado/80 shadow-2xl">
            <Image
              src="/erwin.jpeg"
              alt="Erwin, el elfo del Taller de Santa"
              width={320}
              height={480}
              priority
              className="h-auto w-[140px] object-cover sm:w-[170px]"
            />
          </div>
        </div>

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
