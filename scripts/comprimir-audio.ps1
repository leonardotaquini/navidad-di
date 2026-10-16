# Recomprime los MP3 a menor bitrate (versión Windows / PowerShell).
# Requiere ffmpeg en el PATH (https://ffmpeg.org/download.html).
#
# Uso (desde frontend/):
#   1. Poné los MP3 originales en .\music-originales\
#   2. pwsh scripts\comprimir-audio.ps1          # 128 kbps
#      pwsh scripts\comprimir-audio.ps1 96k       # 96 kbps (más chico)

param([string]$Bitrate = "128k")

$origen = "music-originales"
$destino = "public/music"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
    Write-Error "ffmpeg no está en el PATH. Instalalo desde https://ffmpeg.org/download.html"
    exit 1
}

New-Item -ItemType Directory -Force -Path $destino | Out-Null

$archivos = Get-ChildItem -Path $origen -Filter *.mp3 -ErrorAction SilentlyContinue
if (-not $archivos) {
    Write-Error "No se encontraron MP3 en $origen/"
    exit 1
}

foreach ($f in $archivos) {
    Write-Host "Comprimiendo $($f.Name) a $Bitrate ..."
    ffmpeg -y -i $f.FullName -codec:a libmp3lame -b:a $Bitrate -ac 2 "$destino/$($f.Name)"
}

Write-Host "Listo. Archivos comprimidos en $destino/"
