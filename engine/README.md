# Daily Bypass geography engine

Renders 1080x1920 30 fps shorts: a satellite globe, map overlays, karaoke captions, narration,
a procedural score and sound effects. One folder per episode.

```
engine/
  player/        index.html + runtime.js + style.css (the renderer page), fonts, flags, world borders
  player/tex/    base_8k.jpg, night_8k.jpg, master_21600.jpg  (not committed, see Setup)
  models/        kokoro-v1.0.onnx, voices-v1.0.bin             (not committed, see Setup)
  episodes/<slug>/meta.json    script, voice, hot words, detail crops, sources
  episodes/<slug>/episode.js   the scene timeline
  episodes/<slug>/build/       generated: vo.wav, words.json, crops, stills, mix.wav, <slug>.mp4
  vo.py      Kokoro TTS + word timings
  audio.py   procedural score, SFX, ducking, mix
  render.py  stills, full render (parallel headless Chromium) and mux
```

## Commands

```sh
python3 engine/vo.py engine/episodes/<slug>                        # narration only
python3 engine/render.py engine/episodes/<slug> --stills 2,10,20   # QA frames -> build/still_*.jpg
python3 engine/render.py engine/episodes/<slug> --workers 3        # full video -> build/<slug>.mp4
python3 engine/render.py engine/episodes/<slug> --revo             # rebuild narration first
```

## Setup (fresh machine)

- `pip install kokoro-onnx soundfile librosa scipy pillow playwright`, plus ffmpeg and Chromium.
- Kokoro model: `kokoro-v1.0.onnx` and `voices-v1.0.bin` from github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0) into `engine/models/`.
- Textures (NASA Blue Marble Next Generation, public domain): `world.topo.bathy.200406.3x21600x10800` as
  `player/tex/master_21600.jpg`, an 8192x4096 downscale as `player/tex/base_8k.jpg`,
  NASA Black Marble 8192x4096 as `player/tex/night_8k.jpg`.

## meta.json

```json
{
  "slug": "straight-line", "title": "The Straight Line",
  "voice": "am_michael", "speed": 1.0, "tail": 4.6,
  "musicSeed": 1, "musicKey": 57,
  "hot": ["32,000", "never"],
  "details": [{"file": "d_pakistan.jpg", "bbox": [55, 15, 80, 32]}],
  "script": ["Plain sentence.", {"text": "Sentence with a hold after it.", "pause": 0.6},
             "It is [32,090|thirty-two thousand and ninety] kilometers."],
  "sources": ["https://..."]
}
```

- `script`: one entry per sentence. `[display|spoken]` shows digits in captions, speaks words.
  Always use this for numbers, years, symbols and abbreviations.
- `hot`: caption words shown in yellow when spoken (matched ignoring case and punctuation).
- `details`: up to 2 native-resolution crops `[west, south, east, north]` in degrees for zoomed shots
  (the base texture is only 8k). Keep each crop under about 30x20 degrees; more zoom means a smaller box.
- `tail`: seconds after the narration for the end card (4.6 is standard).

## episode.js

```js
window.EPISODE = { build(A) { ... } };
```

Times come from the narration: `A.at('word', occurrence=1)` is the start of the word, and
`A.atEnd('word')` is its end. Phrases work: `A.at('South America')`. Matching ignores case and
punctuation, so `south-west` is the token `southwest`. Repeated words need the occurrence
number. Apostrophes are dropped too, so `it's` and `its` are the same token: use a two-word cue
such as `at("It's still")`. A missing cue throws at boot and the render stops. `A.sentence(i)` returns `{t0, t1}`.
`A.dur` is the total length.

Camera (orthographic globe; `r` = globe radius in px, `cx, cy` = its screen centre):
- `A.cam.init({lon, lat, r, cy})`: the default radius is about 560 for a full globe that nearly fills the width.
- `A.cam.move(t, {lon, lat, r, cx, cy}, dur=1.4, ease='inOut')`: an eased move; `r` interpolates in log space.
- `A.cam.follow(t0, t1, t => ({lon, lat, r}), blend)`: track something, such as the head of a line.
- `A.cam.drift(degPerSec)`: a slow constant spin (0.5 to 1 feels alive). It adds
  `degPerSec * t * min(1, 560 / r)` degrees of longitude before any `follow`. Follows are exact;
  plain moves land offset by the drift.
- Rough zoom guide: r 560 shows a hemisphere; r 1500 shows a region of about 2,000 km; r 6000 shows a country; r 30000+ shows a city.

Layers (all take `t0`, `t1`; they fade in and out over 0.35 s unless `fi`/`fo` are given):
- `A.headline({text, sub, size=140, y=150, color, subColor, glow, count:{from,to,t0,t1,dec,prefix,suffix}})`: big Anton title at the top, with a small mono subline.
- `A.label({ll:[lon,lat] | xy:[x,y], text, sub, size, color, dx, dy})`: a map label (hidden on the far side).
- `A.pin({ll, color, size})`: a pulsing dot.
- `A.arc({pts:[[lon,lat],...], color, width, dash, draw:[t0,t1] | progress:t=>0..1, head})`: great-circle lines drawn over time.
- `A.circle({center, radiusKm | radiusDeg, color, width, fill, fillOpacity, draw:[t0,t1], grow:true})`: a geodesic circle.
- `A.country({key:'France' | iso numeric | [..], res:'50m'|'10m', fill, fillOpacity, stroke, width, glow, pulse, moveTo:[lon,lat], moveT:[t0,t1]})`.
  `moveTo` carries the true shape across the globe for true-size comparisons.
  Names follow the world-atlas spellings, e.g. 'United States of America', 'Russia', 'China', 'Dem. Rep. Congo'.
  To use `res:'10m'`, set `"hires": true` in meta.json.
- `A.shape({geo: GeoJSON geometry, ...country style})`: custom polygons and lines.
- `A.parallel({lat, color, dash, draw})` and `A.meridian({lon, ...})`: latitude and longitude lines.
- `A.bars({y, rows:[{label, value, max, color, suffix, dec}], grow:[t0,t1]})`: comparison bars.
- `A.card({xy|ll, k, v, rot})`: a white "receipt" card (small key plus big value).
- `A.emoji({xy|ll, char, size, bob})` and `A.flag({xy|ll, code:'fr', w})`: 4x3 SVG flags, keyed by ISO-2 lower case.
- `A.clock({xy|ll, r, h, m | fn:t=>[h,m], ring})`: an analogue clock.
- `A.dim(t0, t1, amount)`: darkens the globe. `A.sun(t0, t1, t => [subsolarLon, subsolarLat])` adds day/night with city lights (set `"textures": {"night": "tex/night_8k.jpg"}` in meta).
- `A.html({fn:(t,a,proj)=>'<div>..'})` and `A.svg({fn})` are escape hatches. `proj` is the d3 projection for this frame.
- `A.endcard({t0, tag, line2})`: the "DAILY BYPASS" end card. Put it about 1.2 s after the last word, with `A.dim(t0, A.dur+1, 0.55)`.

Captions are automatic from the narration (2–3 words, karaoke, with hot words in yellow).

## House style (from the first 8 episodes)

- 50–70 s. The hook sentence names a specific, checkable, surprising claim in under 3 s.
- Short spoken lines, one idea each. Every beat is proven on the map: a line, a circle, a
  number or a shape. Something new appears every 2–4 s.
- A big number reveal about 60–70% of the way through. A twist or loop-back at the end.
- Headline at the top (y 150–180), captions at the bottom (y 1480). Keep labels out of both bands.
- Yellow `#ffd23f` for numbers and the key path, red `#ff3b4e` for "here" pins, green `#3ee08f` for the
  answer or second item, blue `#5ab8ff` for water or comparisons.
- Trust is the product. Every number must match a primary or reputable source listed in
  `sources`. Say "about" when a figure is rounded. No fake photos, no invented quotes.
