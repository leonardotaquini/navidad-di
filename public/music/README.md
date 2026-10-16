# Música del reproductor

Colocá acá tus 9 archivos MP3 con estos nombres:

```
track-1.mp3
track-2.mp3
track-3.mp3
track-4.mp3
track-5.mp3
track-6.mp3
track-7.mp3
track-8.mp3
track-9.mp3
```

Si querés usar otros nombres o títulos, editá el array `TRACKS` en
`components/music-player.tsx`.

## Peso / performance

- El reproductor usa `<audio preload="metadata">`, así que al abrir la página **no se
  descarga ningún audio**: cada canción se baja (en streaming, con requests HTTP Range)
  recién cuando le das play.
- Igual conviene **comprimir** los MP3 para que pesen menos. Ver `scripts/comprimir-audio.sh`
  en la raíz del proyecto.
