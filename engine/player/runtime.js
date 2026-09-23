/* Daily Bypass render runtime.
 * One page renders one episode. The recorder calls window.seek(t) per frame.
 * Globe: WebGL2 inverse-orthographic shader. Overlays: d3 geoOrthographic with the same
 * rotation/scale/translate, so vectors sit exactly on the imagery.
 */
(() => {
const W = 1080, H = 1920;
const DEG = Math.PI / 180;
const qs = new URLSearchParams(location.search);

// ---------------------------------------------------------------- easing / math
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, p) => a + (b - a) * p;
const E = {
  linear: p => p,
  inOut: p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2,
  out: p => 1 - Math.pow(1 - p, 3),
  in: p => p * p * p,
  outBack: p => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
  inOutSine: p => -(Math.cos(Math.PI * p) - 1) / 2,
};
const prog = (t, a, b, ease = 'inOut') => E[ease](clamp((t - a) / Math.max(1e-6, b - a)));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtNum = (v, dec = 0) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });

// ---------------------------------------------------------------- state
const R = {
  ep: null, words: [], dur: 0, layers: [], moves: [], camInit: null, drift: 0,
  cues: [], topo: {}, feats: {}, gl: null, uniforms: {}, dim: 0, sun: null,
};
window.R = R;

// ---------------------------------------------------------------- loading
function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('img ' + src)); i.src = src; });
}
async function loadJSON(src) { const r = await fetch(src); if (!r.ok) throw new Error('fetch ' + src); return r.json(); }
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('script ' + src)); document.head.appendChild(s); });
}

// ---------------------------------------------------------------- WebGL globe
const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FS = `#version 300 es
precision highp float;
uniform vec2 uRes; uniform vec2 uC; uniform float uR; uniform float uLam; uniform float uPhi;
uniform sampler2D uBase; uniform sampler2D uD0; uniform sampler2D uD1; uniform sampler2D uNight;
uniform vec4 uB0; uniform vec4 uB1; uniform float uHasD0; uniform float uHasD1; uniform float uHasNight;
uniform float uDim; uniform vec3 uSun; uniform float uSunOn; uniform float uTime; uniform float uStars;
out vec4 o;
const float PI = 3.14159265358979;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec3 sampleDetail(sampler2D tex, vec4 b, float lonD, float latD, vec3 fallback, inout float hit){
  float l = lonD;
  if (l < b.x) l += 360.0; if (l > b.z) l -= 360.0;
  if (l < b.x || l > b.z || latD < b.y || latD > b.w) return fallback;
  vec2 uv = vec2((l - b.x)/(b.z - b.x), (b.w - latD)/(b.w - b.y));
  float edge = min(min(uv.x, 1.0-uv.x), min(uv.y, 1.0-uv.y));
  float k = smoothstep(0.0, 0.02, edge);
  hit = max(hit, k);
  return mix(fallback, texture(tex, uv).rgb, k);
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 d = (px - uC) / uR; d.y = -d.y;
  float rho = length(d);
  // background: deep space + sparse stars
  vec3 bg = vec3(0.0);
  vec2 cell = floor(px / 3.0);
  float h = hash(cell);
  if (h > 0.9965) { float tw = 0.55 + 0.45*sin(uTime*1.3 + h*80.0); bg += vec3(0.75, 0.82, 1.0) * (h - 0.9965) / 0.0035 * 0.55 * tw * uStars; }
  float aa = 1.2 / uR;
  if (rho > 1.0 + aa) {
    float gl = exp(-(rho - 1.0) * uR / 26.0) * 0.55 + exp(-(rho - 1.0) * uR / 110.0) * 0.18;
    o = vec4(bg + vec3(0.32, 0.58, 1.0) * gl, 1.0);
    return;
  }
  float rr = min(rho, 1.0);
  float c = asin(rr);
  float sc = sin(c), cc = cos(c);
  float lat, lon;
  if (rr < 1e-7) { lat = uPhi; lon = uLam; }
  else {
    lat = asin(clamp(cc*sin(uPhi) + d.y*sc*cos(uPhi)/rr, -1.0, 1.0));
    lon = uLam + atan(d.x*sc, rr*cc*cos(uPhi) - d.y*sc*sin(uPhi));
  }
  vec2 uv = vec2(lon/(2.0*PI) + 0.5, 0.5 - lat/PI);
  vec3 col = texture(uBase, uv).rgb;
  float lonD = mod(lon/PI*180.0 + 180.0, 360.0) - 180.0;
  float latD = lat/PI*180.0;
  float hit = 0.0;
  if (uHasD0 > 0.5) col = sampleDetail(uD0, uB0, lonD, latD, col, hit);
  if (uHasD1 > 0.5) col = sampleDetail(uD1, uB1, lonD, latD, col, hit);
  // grade: lift + saturation, a little punch
  col = pow(col, vec3(0.88)) * 1.08;
  float g = dot(col, vec3(0.299, 0.587, 0.114));
  col = clamp(mix(vec3(g), col, 1.18), 0.0, 1.0);
  // lighting in view space
  float z = sqrt(max(0.0, 1.0 - rr*rr));
  vec3 n = vec3(d.x, d.y, z);
  vec3 L = normalize(vec3(-0.45, 0.55, 0.75));
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float shade = 0.62 + 0.48 * diff;
  shade *= mix(1.0, 0.72, pow(rr, 6.0));
  col *= shade;
  // day / night terminator (world space)
  if (uSunOn > 0.5) {
    vec3 wp = vec3(cos(lat)*cos(lon), cos(lat)*sin(lon), sin(lat));
    float sd = dot(wp, uSun);
    float day = smoothstep(-0.08, 0.08, sd);
    vec3 night = col * 0.12;
    if (uHasNight > 0.5) night += texture(uNight, uv).rgb * vec3(1.0, 0.85, 0.6) * 1.2;
    col = mix(night, col, day);
  }
  // atmosphere haze on the limb
  col = mix(col, vec3(0.45, 0.68, 1.0), pow(rr, 9.0) * 0.55);
  col *= (1.0 - uDim);
  float edge = smoothstep(1.0 + aa, 1.0 - aa, rho);
  vec3 outside = bg + vec3(0.32, 0.58, 1.0) * 0.73;
  o = vec4(mix(outside, col, edge), 1.0);
}`;

function glInit() {
  const cv = document.getElementById('globe');
  const gl = cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no webgl2');
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
  gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  for (const n of ['uRes', 'uC', 'uR', 'uLam', 'uPhi', 'uBase', 'uD0', 'uD1', 'uNight', 'uB0', 'uB1', 'uHasD0', 'uHasD1', 'uHasNight', 'uDim', 'uSun', 'uSunOn', 'uTime', 'uStars']) U[n] = gl.getUniformLocation(pr, n);
  gl.uniform2f(U.uRes, W, H);
  gl.uniform1i(U.uBase, 0); gl.uniform1i(U.uD0, 1); gl.uniform1i(U.uD1, 2); gl.uniform1i(U.uNight, 3);
  R.gl = gl; R.uniforms = U;
}
function glTexture(unit, img, repeat) {
  const gl = R.gl;
  const t = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
  gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ext = gl.getExtension('EXT_texture_filter_anisotropic');
  if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  return t;
}
function glDraw(cam, t) {
  const gl = R.gl, U = R.uniforms;
  gl.viewport(0, 0, W, H);
  gl.uniform2f(U.uC, cam.cx, cam.cy);
  gl.uniform1f(U.uR, cam.r);
  gl.uniform1f(U.uLam, cam.lon * DEG);
  gl.uniform1f(U.uPhi, cam.lat * DEG);
  gl.uniform1f(U.uDim, R.dim);
  gl.uniform1f(U.uTime, t);
  gl.uniform1f(U.uStars, 1.0);
  if (R.sun) {
    const [slon, slat] = R.sun;
    gl.uniform3f(U.uSun, Math.cos(slat * DEG) * Math.cos(slon * DEG), Math.cos(slat * DEG) * Math.sin(slon * DEG), Math.sin(slat * DEG));
    gl.uniform1f(U.uSunOn, 1);
  } else gl.uniform1f(U.uSunOn, 0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.finish();
}

// ---------------------------------------------------------------- camera
function camAt(t) {
  let s = { ...R.camInit };
  for (const m of R.moves) {
    if (t < m.t) break;
    const p = E[m.ease](clamp((t - m.t) / m.dur));
    const from = m._from || (m._from = null);
    const base = { ...s };
    const to = { ...base, ...m.to };
    let dl = ((to.lon - base.lon + 540) % 360) - 180;
    s = {
      lon: base.lon + dl * p,
      lat: lerp(base.lat, to.lat, p),
      r: Math.exp(lerp(Math.log(base.r), Math.log(to.r), p)),
      cx: lerp(base.cx, to.cx, p),
      cy: lerp(base.cy, to.cy, p),
    };
    if (p < 1) { s._moving = true; }
  }
  s.lon += R.drift * t * Math.min(1, 560 / s.r);
  for (const f of (R.follows || [])) {
    if (t < f.t0 || t > f.t1 + f.blend) continue;
    const w = Math.min(E.inOut(clamp((t - f.t0) / f.blend)), E.inOut(clamp((f.t1 + f.blend - t) / f.blend)));
    const g = { ...s, ...f.fn(clamp(t, f.t0, f.t1)) };
    const dl = ((g.lon - s.lon + 540) % 360) - 180;
    s = { lon: s.lon + dl * w, lat: lerp(s.lat, g.lat, w), r: Math.exp(lerp(Math.log(s.r), Math.log(g.r), w)), cx: lerp(s.cx, g.cx, w), cy: lerp(s.cy, g.cy, w) };
  }
  return s;
}
function projFor(cam) {
  return d3.geoOrthographic()
    .rotate([-cam.lon, -cam.lat, 0]).scale(cam.r).translate([cam.cx, cam.cy])
    .clipAngle(90).clipExtent([[-200, -200], [W + 200, H + 200]]).precision(0.15);
}

// ---------------------------------------------------------------- words / timing
const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
function findWord(q, occ = 1, after = -1) {
  const toks = String(q).split(/\s+/).map(norm).filter(Boolean);
  let found = 0;
  for (let i = 0; i < R.words.length; i++) {
    if (R.words[i].t0 < after) continue;
    let ok = true;
    for (let j = 0; j < toks.length; j++) { if (!R.words[i + j] || norm(R.words[i + j].text) !== toks[j]) { ok = false; break; } }
    if (ok && ++found === occ) return { i, j: i + toks.length - 1 };
  }
  throw new Error('cue word not found: "' + q + '" #' + occ);
}
const at = (q, occ = 1) => R.words[findWord(q, occ).i].t0;
const atEnd = (q, occ = 1) => R.words[findWord(q, occ).j].t1;

// ---------------------------------------------------------------- layer helpers
function fadeAlpha(L, t) {
  const fi = L.fi ?? 0.35, fo = L.fo ?? 0.35;
  if (t < L.t0 || t > L.t1) return 0;
  return Math.min(fi > 0 ? clamp((t - L.t0) / fi) : 1, fo > 0 ? clamp((L.t1 - t) / fo) : 1);
}
function visible(proj, ll) {
  const r = proj.rotate();
  return d3.geoDistance(ll, [-r[0], -r[1]]) < Math.PI / 2 - 0.02;
}
function feature(key, res = '50m') {
  const k = res + ':' + key;
  if (R.feats[k]) return R.feats[k];
  const topo = R.topo[res];
  const fc = topojson.feature(topo, topo.objects.countries);
  const keys = Array.isArray(key) ? key : [key];
  const fs = fc.features.filter(f => keys.some(q => String(f.id) === String(q) || (f.properties.name || '').toLowerCase() === String(q).toLowerCase()));
  if (!fs.length) throw new Error('country not found: ' + key);
  const out = fs.length === 1 ? fs[0] : { type: 'FeatureCollection', features: fs };
  R.feats[k] = out;
  return out;
}
function kmToDeg(km) { return km / 111.195; }
function greatCircleCoords(pts, n = 256) {
  const out = [];
  for (let s = 0; s < pts.length - 1; s++) {
    const it = d3.geoInterpolate(pts[s], pts[s + 1]);
    const segN = Math.max(8, Math.round(n * d3.geoDistance(pts[s], pts[s + 1]) / Math.PI));
    for (let i = (s ? 1 : 0); i <= segN; i++) out.push(it(i / segN));
  }
  return out;
}
function partialLine(coords, p) {
  if (p >= 1) return coords;
  let total = 0; const seg = [];
  for (let i = 1; i < coords.length; i++) { const d = d3.geoDistance(coords[i - 1], coords[i]); seg.push(d); total += d; }
  let target = total * p, acc = 0; const out = [coords[0]];
  for (let i = 1; i < coords.length; i++) {
    if (acc + seg[i - 1] >= target) { const f = (target - acc) / (seg[i - 1] || 1); out.push(d3.geoInterpolate(coords[i - 1], coords[i])(f)); return out; }
    acc += seg[i - 1]; out.push(coords[i]);
  }
  return out;
}
function moveGeometry(geo, from, to) {
  const r1 = d3.geoRotation([-from[0], -from[1]]);
  const r2 = d3.geoRotation([-to[0], -to[1]]);
  const tp = c => r2.invert(r1(c));
  const mapCoords = (c, depth) => depth === 0 ? tp(c) : c.map(x => mapCoords(x, depth - 1));
  const g = (geom) => {
    if (geom.type === 'Polygon') return { type: 'Polygon', coordinates: mapCoords(geom.coordinates, 2) };
    if (geom.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: mapCoords(geom.coordinates, 3) };
    if (geom.type === 'LineString') return { type: 'LineString', coordinates: mapCoords(geom.coordinates, 1) };
    return geom;
  };
  if (geo.type === 'FeatureCollection') return { type: 'FeatureCollection', features: geo.features.map(f => ({ type: 'Feature', properties: {}, geometry: g(f.geometry) })) };
  if (geo.type === 'Feature') return { type: 'Feature', properties: {}, geometry: g(geo.geometry) };
  return g(geo);
}
function uid() { return 'u' + Math.random().toString(36).slice(2, 9); }

// ---------------------------------------------------------------- API given to episodes
function makeAPI() {
  const add = L => { L.t0 = L.t0 ?? 0; L.t1 = L.t1 ?? R.dur; R.layers.push(L); return L; };
  const sfx = (t, kind, gain = 1) => R.cues.push({ t, kind, gain });
  const A = {
    W, H, E, at, atEnd, prog, lerp, clamp, fmtNum, feature, kmToDeg, sfx,
    get dur() { return R.dur; },
    words: () => R.words,
    sentence: i => { const ws = R.words.filter(w => w.s === i); return { t0: ws[0].t0, t1: ws[ws.length - 1].t1 }; },
    cam: {
      init(s) { R.camInit = { lon: 0, lat: 0, r: 470, cx: W / 2, cy: 1010, ...s }; },
      move(t, to, dur = 1.4, ease = 'inOut', whoosh = true) {
        R.moves.push({ t, to, dur, ease }); R.moves.sort((a, b) => a.t - b.t);
        if (whoosh) sfx(t, 'whoosh', 0.8);
      },
      drift(degPerSec) { R.drift = degPerSec; },
      // fn(t) -> partial camera state; blended in/out over `blend` seconds. Later moves still apply underneath.
      follow(t0, t1, fn, blend = 0.8) { (R.follows = R.follows || []).push({ t0, t1, fn, blend }); },
    },
    // point along a polyline of [lon,lat] at fraction p (by arc length)
    along(coords, p) { const part = partialLine(coords, clamp(p)); return part[part.length - 1]; },
    gc: greatCircleCoords,
    dim(t0, t1, amount = 0.45) { add({ t0, t1, fi: 0.5, fo: 0.5, dimAmount: amount, kind: 'dim' }); },
    sun(t0, t1, fn) { add({ t0, t1, kind: 'sun', fn }); },

    headline(o) {
      // o: text, sub, t0, t1, y, size, color, count:{from,to,dec,t0,t1,suffix,prefix}
      if (o.pop !== false) sfx(o.t0, o.count ? 'tick' : 'pop', 0.7);
      return add({ ...o, kind: 'html', render(t, a) {
        let txt = o.text;
        if (o.count) {
          const c = o.count; const p = prog(t, c.t0 ?? o.t0, c.t1 ?? (o.t0 + 1.2), 'out');
          txt = (c.prefix || '') + fmtNum(lerp(c.from, c.to, p), c.dec || 0) + (c.suffix || '');
        }
        const sc = 0.86 + 0.14 * E.outBack(clamp(a * 1.05));
        const col = o.color || '#fff';
        const glow = o.glow ? `text-shadow:0 0 28px ${o.glow}, 0 0 8px ${o.glow}, 0 6px 26px rgba(0,0,0,.9);` : '';
        return `<div class="headline" style="top:${o.y ?? 150}px;font-size:${o.size ?? 140}px;color:${col};opacity:${a};transform:scale(${sc});${glow}">${txt}${o.sub ? `<span class="sub" style="${o.subColor ? 'color:' + o.subColor : ''}">${o.sub}</span>` : ''}</div>`;
      } });
    },
    label(o) {
      // o: ll | xy, text, sub, color, size, dx, dy, t0, t1
      return add({ ...o, kind: 'html', render(t, a, proj) {
        let xy = o.xy;
        if (o.ll) { if (!visible(proj, o.ll)) return ''; xy = proj(o.ll); }
        const x = xy[0] + (o.dx || 0), y = xy[1] + (o.dy || 0);
        return `<div class="label" style="left:${x}px;top:${y}px;opacity:${a};font-size:${o.size || 40}px;color:${o.color || '#fff'}">${o.text}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}</div>`;
      } });
    },
    pin(o) {
      // o: ll, color, size, pulse, label/sub handled via label()
      sfx(o.t0, 'pop', 0.6);
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        if (!visible(proj, o.ll)) return '';
        const [x, y] = proj(o.ll); const c = o.color || '#ff3b4e'; const s = o.size || 11;
        const pp = ((t - o.t0) % 1.6) / 1.6;
        const pulse = o.pulse === false ? '' : `<circle cx="${x}" cy="${y}" r="${s + pp * 38}" fill="none" stroke="${c}" stroke-width="3" opacity="${a * (1 - pp) * 0.8}"/>`;
        const sc = E.outBack(clamp((t - o.t0) / 0.4));
        return `${pulse}<circle cx="${x}" cy="${y}" r="${s * 2.2 * sc}" fill="${c}" opacity="${0.25 * a}"/><circle cx="${x}" cy="${y}" r="${s * sc}" fill="${c}" stroke="#fff" stroke-width="3" opacity="${a}"/>`;
      } });
    },
    arc(o) {
      // o: pts [[lon,lat],...], draw:[t0,t1], color, width, dash, head
      const coords = greatCircleCoords(o.pts, o.n || 400);
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        const p = o.progress ? clamp(o.progress(t)) : o.draw ? prog(t, o.draw[0], o.draw[1], o.ease || 'inOut') : 1;
        if (p <= 0) return '';
        const part = partialLine(coords, p);
        const path = d3.geoPath(proj)({ type: 'LineString', coordinates: part });
        if (!path) return '';
        const c = o.color || '#ffd23f', w = o.width || 6;
        let head = '';
        if (o.head !== false && p < 1) {
          const last = part[part.length - 1];
          if (visible(proj, last)) { const [x, y] = proj(last); head = `<circle cx="${x}" cy="${y}" r="${w * 1.6}" fill="#fff" opacity="${a}"/>`; }
        }
        return `<path d="${path}" fill="none" stroke="${c}" stroke-width="${w * 3}" stroke-linecap="round" opacity="${0.22 * a}"/>` +
          `<path d="${path}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity="${a}"/>` + head;
      } });
    },
    circle(o) {
      // o: center, radiusDeg | radiusKm, draw:[t0,t1], color, width, fill, fillOpacity
      const rdeg = o.radiusDeg ?? kmToDeg(o.radiusKm);
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        const p = o.draw ? prog(t, o.draw[0], o.draw[1]) : 1;
        const circ = d3.geoCircle().center(o.center).radius(Math.max(1e-6, rdeg * (o.grow ? p : 1))).precision(0.5)();
        let path;
        if (o.grow || p >= 1) path = d3.geoPath(proj)(circ);
        else path = d3.geoPath(proj)({ type: 'LineString', coordinates: partialLine(circ.coordinates[0], p) });
        if (!path) return '';
        const c = o.color || '#ffd23f';
        const fill = (o.fill && (p >= 1 || o.grow)) ? `<path d="${path}" fill="${o.fill}" fill-opacity="${(o.fillOpacity ?? 0.18) * a}" stroke="none"/>` : '';
        return fill + `<path d="${path}" fill="none" stroke="${c}" stroke-width="${(o.width || 4) * 3}" opacity="${0.18 * a}"/><path d="${path}" fill="none" stroke="${c}" stroke-width="${o.width || 4}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity="${a}"/>`;
      } });
    },
    country(o) {
      // o: key (name / iso numeric or array), res, fill, fillOpacity, stroke, width, glow, moveFrom/moveTo/moveT
      const f = o.geo || feature(o.key, o.res || '50m');
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        let g = f;
        if (o.moveTo) {
          const p = prog(t, o.moveT[0], o.moveT[1]);
          const from = o.moveFrom || d3.geoCentroid(f);
          const to = d3.geoInterpolate(from, o.moveTo)(p);
          g = moveGeometry(f, from, to);
        }
        const path = d3.geoPath(proj)(g);
        if (!path) return '';
        const c = o.stroke || '#fff';
        const fill = o.fill || 'none';
        const pulse = o.pulse ? 0.75 + 0.25 * Math.sin((t - o.t0) * 5) : 1;
        return (o.glow ? `<path d="${path}" fill="none" stroke="${o.glow}" stroke-width="${(o.width || 3) * 5}" opacity="${0.25 * a}" stroke-linejoin="round"/>` : '') +
          `<path d="${path}" fill="${fill}" fill-opacity="${(o.fillOpacity ?? 0.55) * a * pulse}" stroke="${c}" stroke-width="${o.width ?? 3}" stroke-linejoin="round" opacity="${a}"/>`;
      } });
    },
    shape(o) {
      // o: geo (GeoJSON geometry), style like country
      return A.country({ ...o, geo: o.geo });
    },
    parallel(o) {
      // o: lat, color, width, label, draw
      const coords = d3.range(-180, 180.5, 1).map(l => [l, o.lat]);
      return A.arcRaw({ ...o, coords });
    },
    meridian(o) {
      const coords = d3.range(-89.9, 89.95, 0.5).map(l => [o.lon, l]);
      return A.arcRaw({ ...o, coords });
    },
    arcRaw(o) {
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        const p = o.draw ? prog(t, o.draw[0], o.draw[1]) : 1;
        if (p <= 0) return '';
        const n = Math.max(2, Math.round(o.coords.length * p));
        const path = d3.geoPath(proj)({ type: 'LineString', coordinates: o.coords.slice(0, n) });
        if (!path) return '';
        const c = o.color || '#fff';
        return `<path d="${path}" fill="none" stroke="${c}" stroke-width="${(o.width || 3) * 3}" opacity="${0.2 * a}"/><path d="${path}" fill="none" stroke="${c}" stroke-width="${o.width || 3}" ${o.dash ? `stroke-dasharray="${o.dash}"` : ''} opacity="${a}"/>`;
      } });
    },
    bars(o) {
      // o: y, rows:[{label, value, max, color, dec, suffix, prefix}], grow:[t0,t1]
      sfx(o.t0, 'tick', 0.5);
      return add({ ...o, kind: 'html', render(t, a) {
        const p = o.grow ? prog(t, o.grow[0], o.grow[1], 'out') : 1;
        const rows = o.rows.map((r, i) => {
          const pi = r.grow ? prog(t, r.grow[0], r.grow[1], 'out') : p;
          const v = r.value * pi;
          const w = clamp(v / r.max) * 100;
          return `<div class="bar-row"><div class="bar-head"><span>${r.label}</span><span style="color:${r.color}">${r.prefix || ''}${fmtNum(v, r.dec || 0)}${r.suffix || ''}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${w}%;background:${r.color};box-shadow:0 0 18px ${r.color}"></div></div></div>`;
        }).join('');
        return `<div class="panel" style="top:${o.y ?? 130}px;opacity:${a}">${rows}</div>`;
      } });
    },
    emoji(o) {
      // o: ll | xy, char, size, bob
      sfx(o.t0, 'pop', 0.5);
      return add({ ...o, kind: 'html', render(t, a, proj) {
        let xy = o.xy;
        if (o.ll) { if (!visible(proj, o.ll)) return ''; xy = proj(o.ll); }
        const bob = o.bob === false ? 0 : Math.sin((t - o.t0) * 2.4) * 8;
        const sc = E.outBack(clamp((t - o.t0) / 0.45));
        return `<div class="emoji" style="left:${xy[0] + (o.dx || 0)}px;top:${xy[1] + (o.dy || 0) + bob}px;font-size:${o.size || 110}px;opacity:${a};transform:translate(-50%,-50%) scale(${sc})">${o.char}</div>`;
      } });
    },
    flag(o) {
      // o: ll | xy, code (iso2 lower), w
      sfx(o.t0, 'pop', 0.45);
      return add({ ...o, kind: 'html', render(t, a, proj) {
        let xy = o.xy;
        if (o.ll) { if (!visible(proj, o.ll)) return ''; xy = proj(o.ll); }
        const w = o.w || 90; const sc = E.outBack(clamp((t - o.t0) / 0.45));
        return `<img class="flag" src="flags/${o.code}.svg" style="left:${xy[0] + (o.dx || 0)}px;top:${xy[1] + (o.dy || 0)}px;width:${w}px;height:${w * 0.75}px;opacity:${a};transform:translate(-50%,-50%) scale(${sc})">`;
      } });
    },
    card(o) {
      sfx(o.t0, 'pop', 0.5);
      return add({ ...o, kind: 'html', render(t, a, proj) {
        let xy = o.xy;
        if (o.ll) { if (!visible(proj, o.ll)) return ''; xy = proj(o.ll); }
        const sc = E.outBack(clamp((t - o.t0) / 0.45));
        return `<div class="card" style="left:${xy[0] + (o.dx || 0)}px;top:${xy[1] + (o.dy || 0)}px;opacity:${a};transform:translate(-50%,-50%) scale(${sc}) rotate(${o.rot || -2}deg)"><div class="k">${o.k}</div><div class="v">${o.v}</div></div>`;
      } });
    },
    clock(o) {
      // o: xy | ll, r, h, m (static) or fn(t)->[h,m], label
      return add({ ...o, kind: 'svg', render(t, a, proj) {
        let xy = o.xy;
        if (o.ll) { if (!visible(proj, o.ll)) return ''; xy = proj(o.ll); }
        const [x, y] = [xy[0] + (o.dx || 0), xy[1] + (o.dy || 0)]; const r = o.r || 46;
        const [h, m] = o.fn ? o.fn(t) : [o.h, o.m];
        const ha = ((h % 12) + m / 60) / 12 * 2 * Math.PI, ma = m / 60 * 2 * Math.PI;
        const ticks = d3.range(12).map(i => { const an = i / 12 * 2 * Math.PI; return `<line x1="${x + Math.sin(an) * r * 0.8}" y1="${y - Math.cos(an) * r * 0.8}" x2="${x + Math.sin(an) * r * 0.92}" y2="${y - Math.cos(an) * r * 0.92}" stroke="#222" stroke-width="3"/>`; }).join('');
        return `<g opacity="${a}"><circle cx="${x}" cy="${y}" r="${r + 5}" fill="${o.ring || '#ffd23f'}"/><circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>${ticks}
          <line x1="${x}" y1="${y}" x2="${x + Math.sin(ha) * r * 0.5}" y2="${y - Math.cos(ha) * r * 0.5}" stroke="#111" stroke-width="6" stroke-linecap="round"/>
          <line x1="${x}" y1="${y}" x2="${x + Math.sin(ma) * r * 0.78}" y2="${y - Math.cos(ma) * r * 0.78}" stroke="#111" stroke-width="4" stroke-linecap="round"/>
          <circle cx="${x}" cy="${y}" r="5" fill="#ff3b4e"/></g>`;
      } });
    },
    html(o) { return add({ ...o, kind: 'html', render: (t, a, proj) => o.fn(t, a, proj) }); },
    svg(o) { return add({ ...o, kind: 'svg', render: (t, a, proj) => o.fn(t, a, proj) }); },
    endcard(o) {
      sfx(o.t0, 'boom', 0.9);
      return add({ ...o, t1: R.dur + 1, fo: 0, kind: 'html', render(t, a) {
        const p = prog(t, o.t0, o.t0 + 0.9, 'out');
        return `<div class="endcard" style="top:${o.y ?? 760}px;opacity:${a}">
          <div class="tag" style="opacity:${prog(t, o.t0 + 0.15, o.t0 + 0.8)}">${o.tag}</div>
          <div class="brand" style="transform:scale(${0.9 + 0.1 * p})">Daily Bypass</div>
          <div class="line2" style="opacity:${prog(t, o.t0 + 0.4, o.t0 + 1.1)}">${o.line2}</div></div>`;
      } });
    },
  };
  return A;
}

// ---------------------------------------------------------------- captions
function buildChunks() {
  const hot = new Set((R.ep.hot || []).map(norm));
  const chunks = []; let cur = [];
  const ws = R.words;
  for (let i = 0; i < ws.length; i++) {
    const w = ws[i];
    w.hot = w.hot || hot.has(norm(w.text));
    cur.push(w);
    const next = ws[i + 1];
    const chars = cur.map(x => x.text).join(' ').length;
    const punct = /[.,!?;:—]$/.test(w.text);
    const gap = next ? next.t0 - w.t1 : 9;
    const nextChars = next ? chars + 1 + next.text.length : 99;
    if (!next || punct || gap > 0.3 || cur.length >= 3 || nextChars > 17 || next.s !== w.s) { chunks.push(cur); cur = []; }
  }
  for (let i = 0; i < chunks.length; i++) {
    const c = chunks[i];
    c.t0 = c[0].t0 - 0.04;
    const nxt = chunks[i + 1];
    c.t1 = nxt ? Math.min(nxt[0].t0 - 0.04, c[c.length - 1].t1 + 0.9) : c[c.length - 1].t1 + 0.7;
  }
  R.chunks = chunks;
}
function renderCaptions(t) {
  if (R.ep.captionsOff && t > R.ep.captionsOff) return '';
  const c = R.chunks.find(c => t >= c.t0 && t < c.t1);
  if (!c) return '';
  const y = R.ep.captionY ?? 1480;
  const pop = E.outBack(clamp((t - c.t0) / 0.18));
  const html = c.map(w => {
    const spoken = t >= w.t0 - 0.02;
    const txt = w.text.replace(/[.,!?;:—]+$/, '');
    return `<span class="w ${spoken ? 'spoken' : 'future'} ${w.hot ? 'hot' : ''}">${esc(txt)}</span>`;
  }).join('');
  return `<div class="line" style="top:${y}px;transform:scale(${0.92 + 0.08 * pop})">${html}</div>`;
}

// ---------------------------------------------------------------- frame
const geoEl = () => document.getElementById('geo');
const uiEl = () => document.getElementById('ui');
const capEl = () => document.getElementById('cap');

window.seek = function (t) {
  const cam = camAt(t);
  const proj = projFor(cam);
  let dim = 0; R.sun = null;
  let svg = '', html = '';
  for (const L of R.layers) {
    const a = fadeAlpha(L, t);
    if (a <= 0) continue;
    if (L.kind === 'dim') { dim = Math.max(dim, L.dimAmount * a); continue; }
    if (L.kind === 'sun') { R.sun = L.fn(t); continue; }
    const out = L.render(t, a, proj);
    if (L.kind === 'svg') svg += out; else html += out;
  }
  R.dim = dim;
  glDraw(cam, t);
  geoEl().innerHTML = svg;
  uiEl().innerHTML = html;
  capEl().innerHTML = renderCaptions(t);
  return true;
};

// ---------------------------------------------------------------- boot
async function boot() {
  const epDir = qs.get('ep');
  const meta = await loadJSON(`${epDir}/meta.json`);
  await loadScript(`${epDir}/episode.js`);
  R.ep = { ...meta, ...window.EPISODE, textures: { details: meta.details || [], ...(meta.textures || {}) } };
  const vo = await loadJSON(`${epDir}/build/words.json`);
  R.words = vo.words; R.voDur = vo.duration;
  R.dur = vo.duration + (R.ep.tail ?? 3.2);
  R.topo['50m'] = await loadJSON('data/countries-50m.json');
  if (R.ep.hires) R.topo['10m'] = await loadJSON('data/countries-10m.json');
  glInit();
  const tex = R.ep.textures || {};
  const base = await loadImage(tex.base || 'tex/base_8k.jpg');
  glTexture(0, base, true);
  const U = R.uniforms, gl = R.gl;
  const details = tex.details || [];
  for (let i = 0; i < 2; i++) {
    const d = details[i];
    if (d) {
      const img = await loadImage(`${epDir}/build/${d.file}`);
      glTexture(1 + i, img, false);
      gl.uniform4f(i ? U.uB1 : U.uB0, d.bbox[0], d.bbox[1], d.bbox[2], d.bbox[3]);
      gl.uniform1f(i ? U.uHasD1 : U.uHasD0, 1);
    } else gl.uniform1f(i ? U.uHasD1 : U.uHasD0, 0);
  }
  if (tex.night) { glTexture(3, await loadImage(tex.night), true); gl.uniform1f(U.uHasNight, 1); } else gl.uniform1f(U.uHasNight, 0);
  const A = makeAPI();
  A.cam.init({});
  R.ep.build(A);
  if (!R.layers.some(l => l.kind === 'html' && l.brand)) {/* endcard added by episode */}
  buildChunks();
  document.fonts && await document.fonts.ready;
  window.seek(0);
  window.META = { duration: R.dur, voDuration: R.voDur, cues: R.cues, fps: 30 };
  window.READY = true;
}
boot().catch(e => { window.BOOT_ERROR = String(e.stack || e); console.error(e); });
})();
