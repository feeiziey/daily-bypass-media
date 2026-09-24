// The Desert That Feeds a Jungle: Saharan dust -> Amazon (Yu et al. 2015, CALIPSO 2007-2013 averages).
// 182 Mt/yr leave Africa (15°W), 132 Mt still airborne at 35°W, 27.7 Mt deposited on the Amazon basin,
// ~43 Mt reach the Caribbean, ~22,000 t of that is phosphorus.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp } = A;

    // ---------- deterministic noise
    const rnd = (i, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

    // ---------- dust paths (Sahara -> Atlantic -> Amazon / Caribbean)
    const BOD = [18.0, 16.8];
    const SRC = [BOD, [-6, 21], [0, 17.5], [4, 23], [-11, 19.5], [10, 19], [13, 17]];
    const NP = 48;
    const paths = [];
    for (let i = 0; i < NP; i++) {
      const s = SRC[i % SRC.length];
      const src = [s[0] + (rnd(i, 1) - 0.5) * 3, s[1] + (rnd(i, 2) - 0.5) * 2];
      const j = (rnd(i, 3) - 0.5);
      const fate = rnd(i, 4);
      const carib = fate < 0.24;
      const pts = [src, [-17, 15 + j * 5], [-35, 9 + j * 7]];
      if (carib) pts.push([-50, 13 + j * 4], [-62 - rnd(i, 5) * 8, 15 + j * 5]);
      else pts.push([-48, 3 + j * 5], [-55 - rnd(i, 5) * 16, -1 - rnd(i, 6) * 8]);
      paths.push(A.gc(pts, 160));
    }
    // particle fates: 15% reach the Amazon, 24% the Caribbean, the rest settle into the ocean on the way
    const NPART = 300;
    const parts = [];
    for (let k = 0; k < NPART; k++) {
      const f = rnd(k, 7);
      let path = k % NP, die = 1;
      const pr = paths[path];
      const isCarib = rnd(path, 4) < 0.24;
      if (f < 0.27) die = 0.2 + rnd(k, 8) * 0.28;            // drops out before 35°W
      else if (f < 0.61 && true) die = 0.58 + rnd(k, 9) * 0.3; // drops out after 35°W
      parts.push({ pr, die, amaz: !isCarib && die === 1, phase: rnd(k, 10), dx: (rnd(k, 11) - 0.5) * 1.6, dy: (rnd(k, 12) - 0.5) * 1.6, sz: 2.6 + rnd(k, 13) * 2.6 });
    }
    const visibleLL = (proj, ll) => { const r = proj.rotate(); return d3.geoDistance(ll, [-r[0], -r[1]]) < Math.PI / 2 - 0.03; };
    const stream = (t0, t1, { start = null, period = 7.5, alpha = 1 } = {}) => A.svg({ t0, t1, fi: 0.6, fo: 0.8, fn: (t, a, proj) => {
      let out = '';
      for (const p of parts) {
        const age = (t - (start ?? -100)) / period - p.phase;
        if (age < 0) continue;
        const u = age % 1;
        if (u > p.die) continue;
        const ll = A.along(p.pr, u);
        const g = [ll[0] + p.dx, ll[1] + p.dy];
        if (!visibleLL(proj, g)) continue;
        const [x, y] = proj(g);
        const fade = Math.min(clamp(u / 0.06), clamp((p.die - u) / 0.07));
        const o = a * alpha * fade;
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(p.sz * 2.6).toFixed(1)}" fill="#f0b861" opacity="${(0.13 * o).toFixed(3)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.sz.toFixed(1)}" fill="#ffd89a" opacity="${(0.85 * o).toFixed(3)}"/>`;
      }
      return out;
    } });

    // local plume off the Bodélé (dust blows south-west)
    const plume = [];
    for (let k = 0; k < 120; k++) plume.push({ a: [BOD[0] + (rnd(k, 20) - 0.5) * 2.2, BOD[1] + (rnd(k, 21) - 0.5) * 1.0], ang: (215 + (rnd(k, 22) - 0.5) * 30) * Math.PI / 180, len: 3 + rnd(k, 23) * 3.5, phase: rnd(k, 24), sz: 2 + rnd(k, 25) * 3 });
    const plumeLayer = (t0, t1, start) => A.svg({ t0, t1, fi: 0.5, fo: 0.6, fn: (t, a, proj) => {
      let out = '';
      for (const p of plume) {
        const age = (t - start) / 3.2 - p.phase;
        if (age < 0) continue;
        const u = age % 1;
        const ll = [p.a[0] + Math.cos(p.ang) * p.len * u, p.a[1] + Math.sin(p.ang) * p.len * u * 0.7];
        const [x, y] = proj(ll);
        const o = a * Math.min(clamp(u / 0.15), clamp((1 - u) / 0.3));
        out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(p.sz * 3).toFixed(1)}" fill="#e9b26a" opacity="${(0.12 * o).toFixed(3)}"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.sz.toFixed(1)}" fill="#ffe0aa" opacity="${(0.8 * o).toFixed(3)}"/>`;
      }
      return out;
    } });

    // ---------- shapes
    // Lake Mega-Chad, rough outline of the Holocene highstand (~361,000 km²), scaled from a hand-traced polygon
    const lakeRaw = [[13.0, 14.8], [14.0, 15.8], [15.2, 16.9], [16.2, 18.0], [17.5, 18.6], [19.0, 18.3], [19.6, 17.3], [19.0, 16.0], [18.2, 15.0], [17.5, 13.5], [16.5, 12.0], [15.5, 10.5], [14.5, 10.2], [13.3, 11.0], [12.3, 12.3], [12.3, 13.8]];
    const LC = [16.0, 14.5];
    const lakeRing = lakeRaw.map(([x, y]) => [LC[0] + (x - LC[0]) * 0.95, LC[1] + (y - LC[1]) * 0.95]);
    lakeRing.push(lakeRing[0]);
    const lake = { type: 'Polygon', coordinates: [lakeRing] };
    // Amazon basin, simplified outline
    const amz = [[-79, -2], [-77.5, -7], [-75, -12], [-71, -15.5], [-66, -18], [-61, -17], [-56, -14.5], [-53, -11], [-51.5, -6.5], [-50, -2.5], [-50.5, 0.5], [-53, 2.2], [-57, 2.2], [-60.5, 4.5], [-64, 4], [-67.5, 2.2], [-71.5, 2], [-75, 0.5]];
    amz.push(amz[0]);
    const amazon = { type: 'Polygon', coordinates: [amz.slice().reverse()] };
    const amzRiver = [[-73.2, -4.4], [-70, -3.8], [-65.5, -3.3], [-60, -3.1], [-57, -2.4], [-54.5, -2.0], [-52, -1.2], [-49.8, -0.3]];

    // ---------- times
    const tAmazon = at('Amazon'), tSahara = at('Sahara'), tDust = at('dust'), tHere = at('here');
    const tDep = at('Depression'), tDustiest = at('dustiest'), tAround = at('Around'), tLake = at('lake');
    const tGermany = at('Germany'), tWhen = at('When'), tAlgae = at('fossil'), tPhos = at('phosphorus');
    const tWinds = at('Winds'), tWest = at('west'), tAtl = at('Atlantic', 1);
    const t182 = at('182'), t132 = at('132'), t277 = at('27.7'), tHidden = at('Hidden'), t22k = at('22,000');
    const tRough = at('Roughly'), tRain = at('rain', 1), tSoil = at('jungle\'s'), tTops = at('tops');
    const tLargest = at('largest'), tFeeding = at('feeding'), tEnd = A.sentence(12).t1 + 1.3;

    // ---------- camera
    cam.init({ lon: -18, lat: 6, r: 540, cy: 1000 });
    const DR = 0.25; cam.drift(DR);
    // compensate drift (runtime scales it by min(1, 560/r)) so targets land where intended
    const lonAt = (lon, t, r = 560) => lon - DR * t * Math.min(1, 560 / r);
    cam.move(0.2, { r: 575 }, 4, 'out', false);
    cam.move(tHere - 0.4, { lon: lonAt(BOD[0] - 0.3, tHere + 1.2, 5200), lat: BOD[1] - 1.0, r: 5200 }, 1.6);
    cam.move(tAround - 0.2, { lon: lonAt(15.8, tAround + 1.2, 2900), lat: 14.2, r: 2900 }, 1.4);
    cam.move(at('dried') + 0.6, { lon: lonAt(BOD[0] - 0.5, at('dried') + 2, 7000), lat: BOD[1] - 0.6, r: 7000 }, 1.5);
    cam.move(tWinds - 0.1, { lon: lonAt(-24, tWinds + 2, 590), lat: 5, r: 590 }, 2.0);
    cam.move(t182 - 0.4, { lon: lonAt(-24, t182 + 1, 700), lat: 8, r: 700 }, 1.6);
    cam.move(t277 - 0.3, { lon: lonAt(-48, t277 + 1, 850), lat: 0, r: 850 }, 1.5);
    cam.move(tRough - 0.2, { lon: lonAt(-61, tRough + 1.5, 1350), lat: -6, r: 1350 }, 1.5);
    cam.move(tSoil - 0.2, { lon: lonAt(-26, tSoil + 2, 600), lat: 5, r: 600 }, 1.8);
    cam.move(tEnd, { r: 520, cy: 1060 }, 2.5, 'out', false);

    // ---------- hook: the connection
    stream(0.1, tHere - 0.3, { period: 6.5, alpha: 0.9 });
    A.shape({ t0: tAmazon - 0.1, t1: tHere - 0.3, geo: amazon, fill: '#3ee08f', fillOpacity: 0.28, stroke: '#3ee08f', width: 3 });
    A.label({ t0: tAmazon - 0.1, t1: tHere - 0.3, ll: [-63, -7], text: 'Amazon', sub: 'rainforest', size: 54, color: '#3ee08f' });
    A.label({ t0: tSahara - 0.1, t1: tHere - 0.3, ll: [8, 25], text: 'Sahara', sub: 'desert', size: 54, color: '#ffd89a' });
    A.headline({ t0: 0.3, t1: tDust - 0.15, text: 'Desert → Jungle', sub: 'across the Atlantic Ocean', size: 128, y: 165 });
    A.headline({ t0: tDust - 0.1, t1: tHere - 0.3, text: 'Dust', sub: 'the fertilizer', size: 150, y: 160, color: '#ffd89a' });

    // ---------- Bodélé
    plumeLayer(tHere, tAround + 0.4, tHere - 1.5);
    A.pin({ t0: tHere + 0.6, t1: tWinds + 0.4, ll: BOD, color: '#ff3b4e' });
    A.label({ t0: tDep - 0.1, t1: tAround - 0.1, ll: BOD, dy: -110, text: 'Bodélé Depression', sub: 'Chad · 16.8°N 18°E', size: 60 });
    A.flag({ t0: at('Chad') - 0.1, t1: tAround - 0.1, ll: BOD, dx: 0, dy: 150, code: 'td', w: 96 });
    A.headline({ t0: tDustiest - 0.1, t1: tAround - 0.15, text: 'Dustiest place on Earth', sub: 'the biggest single dust source', size: 92, y: 160 });

    // ---------- Lake Mega-Chad
    A.shape({ t0: tAround, t1: at('dried') + 1.2, fo: 1.0, geo: lake, fill: '#2d8fe6', fillOpacity: 0.72, stroke: '#9fd6ff', width: 3, glow: '#5ab8ff' });
    A.headline({ t0: tAround, t1: tAlgae - 0.15, text: 'Lake Mega-Chad', sub: '~7,000 years ago · ~361,000 km²', size: 120, y: 160, color: '#5ab8ff', subColor: '#fff' });
    A.label({ t0: tLake, t1: tGermany - 0.1, ll: [15.3, 13.2], text: 'Lake', sub: 'approx. outline', size: 50 });
    A.country({ t0: at('bigger') - 0.1, t1: at('dried') + 0.2, key: 'Germany', fill: 'none', stroke: '#fff', width: 4, moveTo: [15.2, 14.0], moveT: [at('bigger') - 0.1, at('bigger') + 0.8] });
    A.label({ t0: tGermany + 0.3, t1: at('dried') + 0.1, ll: [15.2, 14.0], text: 'Germany', sub: '357,000 km²', size: 48 });

    // ---------- fossil lakebed
    A.card({ t0: tAlgae - 0.05, t1: tWinds - 0.15, xy: [540, 330], k: 'the old lakebed', v: 'Fossil algae', rot: -2 });
    A.label({ t0: tPhos - 0.1, t1: tWinds - 0.15, xy: [540, 470], text: 'rich in phosphorus', sub: 'a nutrient plants need', size: 58, color: '#ffd23f' });
    A.dim(tHere, tWinds, 0.18);
    A.label({ t0: tAlgae, t1: tWinds + 0.2, ll: [BOD[0] + 0.2, BOD[1] - 1.4], text: 'Diatomite', sub: 'white lakebed dust', size: 46 });

    // ---------- the crossing
    stream(tWinds, tEnd + 0.9, { start: tWinds - 0.2, period: 7.5 });
    A.emoji({ t0: tWinds, t1: tWest + 0.8, ll: [8, 20], dy: -20, char: '💨', size: 100 });
    A.arc({ t0: tWest - 0.1, t1: t182 - 0.3, pts: [[5, 22], [-30, 17]], color: '#ffffff', width: 4, dash: '14 12', draw: [tWest - 0.1, tWest + 1.0], fo: 0.5 });
    A.label({ t0: tAtl - 0.1, t1: t182 - 0.2, ll: [-38, 22], text: 'Atlantic Ocean', size: 52, color: '#9fd6ff' });
    A.label({ t0: tWinds + 0.4, t1: t182 - 0.2, ll: [-47, -6], text: 'Amazon', size: 44, color: '#3ee08f' });

    // ---------- the numbers
    A.arc({ t0: t182 - 0.1, t1: t132 - 0.2, pts: [[-15, 40], [-15, -30]], color: '#ffd23f', dash: '10 10', width: 3, head: false, draw: [t182 - 0.1, t182 + 1.2] });
    A.label({ t0: t182 + 0.3, t1: t132 - 0.2, ll: [-15, 36], dx: 0, text: '15°W', sub: 'leaving Africa', size: 40 });
    A.headline({ t0: t182 - 0.1, t1: t132 - 0.1, text: '', count: { from: 0, to: 182, t0: t182, t1: t182 + 1.4, suffix: ' Mt' }, sub: 'dust leaving the Sahara · per year', size: 150, y: 160 });
    A.arc({ t0: t132 - 0.1, t1: t277 - 0.2, pts: [[-35, 40], [-35, -30]], color: '#ffd23f', dash: '10 10', width: 3, head: false, draw: [t132 - 0.1, t132 + 1.2] });
    A.label({ t0: t132 + 0.3, t1: t277 - 0.2, ll: [-35, 36], text: '35°W', sub: 'off South America', size: 40 });
    A.headline({ t0: t132 - 0.1, t1: t277 - 0.1, text: '', count: { from: 182, to: 132, t0: t132, t1: t132 + 1.2, suffix: ' Mt' }, sub: 'still in the air at 35°W', size: 150, y: 160, pop: false });
    A.label({ t0: t132 + 1.4, t1: t277 - 0.2, ll: [-58, 21], text: 'Caribbean', sub: '~43 Mt', size: 38 });

    A.shape({ t0: t277 - 0.1, t1: tSoil + 0.2, geo: amazon, fill: '#3ee08f', fillOpacity: 0.3, stroke: '#3ee08f', width: 4, glow: '#3ee08f', pulse: true });
    A.headline({ t0: t277 - 0.1, t1: tHidden - 0.1, text: '', count: { from: 132, to: 27.7, t0: t277, t1: t277 + 1.3, dec: 1, suffix: ' Mt' }, sub: 'lands on the Amazon basin · per year', size: 150, y: 160, color: '#3ee08f', subColor: '#fff', pop: false });
    A.label({ t0: t277 + 0.6, t1: tRough - 0.2, ll: [-64, -8], text: 'Amazon basin', size: 50, color: '#3ee08f' });
    A.label({ t0: t277 + 0.6, t1: tHidden - 0.1, xy: [540, 400], text: '', sub: 'CALIPSO satellite · 2007–2013 average', size: 20 });

    // ---------- phosphorus
    A.headline({ t0: tHidden - 0.1, t1: tRough - 0.15, text: '', count: { from: 0, to: 22000, t0: t22k, t1: t22k + 1.2, suffix: ' t' }, sub: 'of phosphorus · every year', size: 150, y: 160, color: '#ffd23f', subColor: '#fff' });
    A.card({ t0: t22k + 0.2, t1: tRough - 0.15, xy: [540, 470], k: 'share of the dust', v: '≈ 0.08%', rot: 2 });

    // ---------- balance
    A.arc({ t0: tRough, t1: tSoil, pts: amzRiver, color: '#5ab8ff', width: 7, draw: [at('loses') - 0.1, at('loses') + 1.4] });
    A.headline({ t0: tRough - 0.1, t1: tSoil - 0.15, text: 'In ≈ Out', sub: 'dust in · rain & floods wash it out', size: 140, y: 160 });
    A.emoji({ t0: at('loses'), t1: tSoil - 0.15, xy: [540, 430], char: '⚖️', size: 110 });
    A.emoji({ t0: tRain - 0.1, t1: tSoil - 0.15, ll: [-62, -1], dy: -90, char: '🌧️', size: 90 });
    A.label({ t0: at('washed') - 0.1, t1: tSoil - 0.1, ll: [-49.8, -0.3], dx: -40, dy: 70, text: 'to the sea', size: 38, color: '#9fd6ff' });

    // ---------- loop
    A.headline({ t0: tSoil - 0.1, t1: tTops - 0.1, text: 'Poor soil', sub: 'rain leaches the nutrients', size: 130, y: 165 });
    A.headline({ t0: tTops - 0.1, t1: tLargest - 0.15, text: 'Refill: Africa', sub: 'delivered by the trade winds', size: 130, y: 165, color: '#ffd89a' });
    A.label({ t0: tLargest - 0.1, t1: tEnd, ll: [6, 24], text: 'Sahara', sub: 'largest hot desert', size: 50, color: '#ffd89a' });
    A.label({ t0: tFeeding - 0.1, t1: tEnd, ll: [-62, -7], text: 'Amazon', sub: 'largest rainforest', size: 50, color: '#3ee08f' });
    A.shape({ t0: tFeeding - 0.1, t1: tEnd + 0.3, geo: amazon, fill: '#3ee08f', fillOpacity: 0.3, stroke: '#3ee08f', width: 3 });
    A.headline({ t0: tLargest - 0.1, t1: tEnd, text: 'Desert feeds jungle', sub: 'every single year', size: 118, y: 165 });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the desert that feeds a jungle', line2: '27.7 million tons of dust a year.', y: 760 });
  },
};
