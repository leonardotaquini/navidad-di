import "server-only";

import { cacheLife } from "next/cache";

/**
 * Pista lista para reproducir: metadata de TheAudioDB + el id de YouTube ya
 * resuelto desde el campo `strMusicVid`.
 */
export type Track = {
  titulo: string;
  artista: string;
  youtubeId: string;
  thumb?: string;
};

/**
 * TheAudioDB free music API no entrega audio: solo metadata + un link de YouTube
 * (`strMusicVid`). La key `123` es la pública de demo (rate limit compartido).
 */
const API_BASE = "https://www.theaudiodb.com/api/v1/json/123";

/**
 * Canciones navideñas que, verificado contra la API, tienen `strMusicVid`.
 * Se consultan a TheAudioDB en runtime; `youtubeId` es el valor confirmado que
 * se usa como fallback si la API falla o deja de traer el video.
 */
const CANCIONES: ReadonlyArray<{
  artista: string;
  track: string;
  youtubeId: string;
}> = [
  { artista: "Wham!", track: "Last Christmas", youtubeId: "bwNV7TAWN3M" },
  {
    artista: "Band Aid",
    track: "Do They Know It's Christmas?",
    youtubeId: "bjQzJAKxTrE",
  },
  { artista: "Justin Bieber", track: "Mistletoe", youtubeId: "LUjn3RpkcKY" },
  {
    artista: "The Pogues",
    track: "Fairytale of New York",
    youtubeId: "j9jbdgZidu8",
  },
  {
    artista: "Paul McCartney",
    track: "Wonderful Christmastime",
    youtubeId: "V9BZDpni56Y",
  },
  {
    artista: "Shakin' Stevens",
    track: "Merry Christmas Everyone",
    youtubeId: "ZeyHl1tQeaQ",
  },
];

type ApiTrack = {
  strTrack?: string | null;
  strArtist?: string | null;
  strTrackThumb?: string | null;
  strMusicVid?: string | null;
};

/** Extrae el id de video de una URL de YouTube (watch, youtu.be o embed). */
export function parseYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

/** Consulta un track puntual en TheAudioDB. Devuelve null ante cualquier fallo. */
async function buscarTrack(
  artista: string,
  track: string,
): Promise<ApiTrack | null> {
  try {
    const url = `${API_BASE}/searchtrack.php?s=${encodeURIComponent(
      artista,
    )}&t=${encodeURIComponent(track)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { track?: ApiTrack[] | null };
    return data.track?.[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Lista de canciones navideñas lista para el reproductor. Pide a TheAudioDB el
 * `strMusicVid` de cada canción curada; si la API no trae un id de YouTube
 * válido para alguna, usa el id confirmado como fallback. Así el player nunca
 * queda vacío aunque la API esté caída o rate-limiteada.
 */
export async function getChristmasTracks(): Promise<Track[]> {
  "use cache";
  cacheLife("days");

  const resultados = await Promise.all(
    CANCIONES.map(async (cancion) => {
      const api = await buscarTrack(cancion.artista, cancion.track);
      const youtubeId = parseYoutubeId(api?.strMusicVid) ?? cancion.youtubeId;
      return {
        titulo: api?.strTrack ?? cancion.track,
        artista: api?.strArtist ?? cancion.artista,
        youtubeId,
        thumb: api?.strTrackThumb ?? undefined,
      } satisfies Track;
    }),
  );

  return resultados;
}
