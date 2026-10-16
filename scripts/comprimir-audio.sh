#!/usr/bin/env bash
#
# Recomprime los MP3 a un bitrate menor para que pesen menos en la web.
# Requiere ffmpeg instalado (https://ffmpeg.org/download.html).
#
# Uso:
#   1. Poné los MP3 originales en ./music-originales/
#   2. Desde la raíz del proyecto (frontend/) ejecutá:  bash scripts/comprimir-audio.sh
#   3. Los comprimidos quedan en public/music/
#
# Bitrate: 128 kbps es un buen balance calidad/peso para música
# (~2.8 MB por cada 3 min). Bajá a 96k para archivos aún más chicos (~2.1 MB).

set -euo pipefail

BITRATE="${1:-128k}"        # ej: bash scripts/comprimir-audio.sh 96k
ORIGEN="music-originales"
DESTINO="public/music"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg no está instalado. Instalalo desde https://ffmpeg.org/download.html"
  exit 1
fi

mkdir -p "$DESTINO"

shopt -s nullglob
archivos=("$ORIGEN"/*.mp3)
if [ ${#archivos[@]} -eq 0 ]; then
  echo "No se encontraron MP3 en $ORIGEN/"
  exit 1
fi

for f in "${archivos[@]}"; do
  nombre="$(basename "$f")"
  echo "Comprimiendo $nombre a $BITRATE ..."
  ffmpeg -y -i "$f" -codec:a libmp3lame -b:a "$BITRATE" -ac 2 "$DESTINO/$nombre"
done

echo "Listo. Archivos comprimidos en $DESTINO/"
