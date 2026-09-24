// Twelve Clocks: France has 12 time zones (13 with Adélie Land), Russia and the US 11.
// Territory offsets are standard time (no DST). Clocks show one shared instant, ticking slowly.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, clamp, lerp } = A;
    const D = Math.PI / 180;
    const YEL = '#ffd23f', RED = '#ff3b4e', GRN = '#3ee08f', BLU = '#5ab8ff';

    // territories: ll, standard UTC offset (hours)
    const T = {
      metro: { ll: [2.3, 46.6], off: 1, name: 'France' },
      guiana: { ll: [-53.1, 3.9], off: -3, name: 'French Guiana' },
      guad: { ll: [-61.55, 16.2], off: -4, name: 'Guadeloupe' },
      mart: { ll: [-61.0, 14.65], off: -4, name: 'Martinique' },
      spm: { ll: [-56.3, 46.9], off: -3, name: 'St-Pierre & Miquelon' },
      stm: { ll: [-63.05, 18.07], off: -4, name: 'Saint Martin' },
      may: { ll: [45.15, -12.8], off: 3, name: 'Mayotte' },
      reu: { ll: [55.5, -21.1], off: 4, name: 'Réunion' },
      ker: { ll: [69.5, -49.3], off: 5, name: 'Kerguelen' },
      nc: { ll: [165.6, -21.4], off: 11, name: 'New Caledonia' },
      wal: { ll: [-176.2, -13.3], off: 12, name: 'Wallis & Futuna' },
      tah: { ll: [-149.4, -17.65], off: -10, name: 'Tahiti' },
      mrq: { ll: [-140.1, -9.0], off: -9.5, name: 'Marquesas' },
      gam: { ll: [-134.95, -23.1], off: -9, name: 'Gambier' },
      clip: { ll: [-109.2, 10.3], off: -8, name: 'Clipperton' },
    };
    const offTxt = o => 'UTC' + (o < 0 ? '−' : '+') + Math.floor(Math.abs(o)) + (Math.abs(o) % 1 ? ':30' : '');

    // one shared instant: Monday 20:00 UTC at t=0, running 2 minutes per second
    const utcMin = t => 20 * 60 + t * 2;
    const local = (off, t) => { const m = utcMin(t) + off * 60; const d = Math.floor(m / 1440); const mm = ((m % 1440) + 1440) % 1440; return { h: Math.floor(mm / 60), m: mm % 60, d }; };
    const DAYS = ['MON', 'TUE', 'WED', 'SUN'];
    const dayName = d => (d < 0 ? 'SUN' : DAYS[d]);
    const hhmm = l => String(l.h).padStart(2, '0') + ':' + String(Math.floor(l.m)).padStart(2, '0');

    // clock + label for a territory
    const clockAt = (k, t0, t1, o = {}) => {
      const p = T[k];
      A.clock({ t0, t1, ll: p.ll, dx: o.dx || 0, dy: o.dy ?? -78, r: o.r || 44, ring: o.ring || YEL, fn: t => { const l = local(p.off, t); return [l.h, l.m]; } });
      const ly = (o.dy ?? -78) + (o.r || 44) + 30;
      A.label({ t0, t1, ll: p.ll, dx: o.dx || 0, dy: ly, text: o.text ?? p.name, size: o.size || 38 });
      A.label({ t0, t1, ll: p.ll, dx: o.dx || 0, dy: ly + 40, text: offTxt(p.off), size: 34, color: YEL });
    };

    const tRussia = at('Russia'), tFrance = at('France'), tRus2 = at('Russia', 2), tUS = at('U.S.'), tFr12 = at('France', 2);
    const tStop = at('Because'), tGuiana = at('Guiana'), tGuad = at('Guadeloupe'), tReu = at('Réunion');
    const tCal = at('Caledonia'), tPoly = at('Polynesia'), tWal = at('Wallis'), tPac = at('Pacific');
    const tRun = at('clocks'), tM10 = at('UTC−10'), tP12 = at('UTC+12'), t22 = at('22'), tSame = at('Same');
    const tStr = at('stranger'), tLong = at('longest'), tSpain = at('Spain'), tBrazil = at('Brazil');
    const tIsl = at('island'), tNL = at('Netherlands'), tCount = at('Count'), tAdelie = at('Adélie'), t13 = at('13th');
    const tSpread = at('Spread'), tAlways = at('always'), tEnd = A.sentence(14).t1 + 1.2;

    const subLon = t => lerp(-20, -380, prog(t, tSpread, tEnd + 2.5, 'linear'));

    // ---- camera
    cam.init({ lon: 55, lat: 42, r: 540, cy: 1010 });
    cam.drift(0);
    cam.move(0.2, { r: 575 }, 3, 'out', false);
    cam.move(tFrance - 0.25, { lon: 8, lat: 40, r: 640 }, 1.1);
    cam.move(tUS - 0.2, { lon: -150, lat: 28, r: 600 }, 1.4);
    cam.move(tFr12 - 0.4, { lon: 3, lat: 45, r: 1500, cy: 1040 }, 1.3);
    cam.move(tStop, { lon: -28, lat: 20, r: 620, cy: 1020 }, 1.5);
    cam.move(tGuiana - 0.3, { lon: -56, lat: 9, r: 1500, cy: 1020 }, 1.2);
    cam.move(tReu - 0.35, { lon: 50, lat: -17, r: 1500 }, 1.4);
    cam.move(tCal - 0.3, { lon: -178, lat: -17, r: 820, cy: 1000 }, 1.6);
    cam.move(tRun - 0.2, { lon: -163, lat: -15, r: 1200, cy: 1060 }, 1.4);
    cam.move(tStr - 0.1, { lon: 0, lat: 43, r: 4200, cy: 1000 }, 1.5);
    cam.move(tSpain + 0.45, { lon: -25, lat: 25, r: 820, cy: 1000 }, 0.8);
    cam.move(tSpain + 1.25, { lon: -53.2, lat: 3.4, r: 3400, cy: 1000 }, 1.1, 'inOut', false);
    cam.move(tIsl - 0.5, { lon: -63.06, lat: 18.06, r: 150000, cy: 1000 }, 1.6);
    cam.move(tCount - 0.2, { lon: 139, lat: -66, r: 1500, cy: 1000 }, 1.6);
    cam.move(tSpread - 0.2, { lon: -30, lat: 0, r: 540, cy: 1000 }, 1.6);
    cam.follow(tSpread + 0.8, A.dur, t => ({ lon: subLon(t) + 55, lat: 0, r: 540 }), 1.0);
    cam.move(tEnd, { r: 500, cy: 1060 }, 2.5, 'out', false);

    // ---- hook: not Russia, France
    A.headline({ t0: 0.3, t1: tFrance - 0.15, text: 'Most time zones', sub: 'which country wins?', size: 128, y: 160 });
    A.country({ t0: tRussia - 0.1, t1: tFrance + 0.2, key: 'Russia', fill: RED, fillOpacity: 0.28, stroke: RED, width: 3 });
    A.emoji({ t0: at('isnt') - 0.05, t1: tFrance - 0.1, ll: [95, 62], char: '❌', size: 110, bob: false });
    A.country({ t0: tFrance - 0.1, t1: tCount - 0.3, key: 'France', fill: BLU, fillOpacity: 0.55, stroke: '#fff', width: 2.5, glow: BLU });
    A.headline({ t0: tFrance - 0.05, t1: tRus2 - 0.15, text: "It's France", sub: 'not Russia', size: 150, y: 160, color: BLU, subColor: '#fff' });
    A.flag({ t0: tFrance + 0.1, t1: tRus2 - 0.15, xy: [540, 440], code: 'fr', w: 130 });

    // ---- the count
    A.country({ t0: tRus2 - 0.1, t1: tUS + 0.6, key: 'Russia', fill: RED, fillOpacity: 0.3, stroke: RED, width: 2.5 });
    A.country({ t0: tUS, t1: tFr12, key: 'United States of America', fill: '#ffffff', fillOpacity: 0.22, stroke: '#fff', width: 2.5 });
    const usIsl = [[166.6, 19.3, 'Wake · UTC+12'], [-176.5, 0.2, 'Baker · UTC−12']];
    usIsl.forEach(([lo, la, txt], i) => {
      A.pin({ t0: at('tiny') + i * 0.3, t1: tFr12, ll: [lo, la], color: '#fff', size: 8 });
      A.label({ t0: at('tiny') + i * 0.3, t1: tFr12, ll: [lo, la], dy: 48, text: txt, size: 30 });
    });
    A.bars({ t0: tRus2 - 0.1, t1: tStop - 0.1, y: 130, grow: [tRus2, tRus2 + 0.9], rows: [
      { label: 'Russia', value: 11, max: 12, color: RED, suffix: ' zones' },
      { label: 'United States', value: 11, max: 12, color: '#ffffff', suffix: ' zones', grow: [at('also'), at('also') + 0.9] },
      { label: 'France', value: 12, max: 12, color: BLU, suffix: ' zones', grow: [tFr12, tFr12 + 1.0] },
    ] });

    A.dim(tFr12 - 0.4, tStop + 0.2, 0.35);

    // ---- the tour: territories pop, each with its clock
    const pinT = (k, t0, t1, c = BLU) => A.pin({ t0, t1, ll: T[k].ll, color: c, size: 9 });
    A.headline({ t0: tStop - 0.05, t1: tGuiana - 0.2, text: 'Beyond Europe', sub: 'overseas France', size: 120, y: 170 });
    // all territory pins stay on the globe for the rest of the tour
    for (const k of Object.keys(T)) if (k !== 'metro') pinT(k, tStop + 0.3 + Object.keys(T).indexOf(k) * 0.08, tStr - 0.2);
    A.country({ t0: tStop + 0.3, t1: tCount - 0.3, key: [258, 540, 876, 666, 652, 260], fill: BLU, fillOpacity: 0.55, stroke: '#fff', width: 2, glow: BLU });

    clockAt('guiana', tGuiana - 0.1, tReu - 0.5, { dy: 120, dx: 60 });
    clockAt('guad', tGuad - 0.1, tReu - 0.5, { dx: 170, dy: -30, text: 'Guadeloupe' });
    clockAt('mart', at('Martinique') - 0.1, tReu - 0.5, { dx: -150, dy: 20, text: 'Martinique' });
    clockAt('metro', tStop + 0.4, tGuiana - 0.2, { dy: -100 });

    clockAt('reu', tReu - 0.1, tCal - 0.5, { dx: 150, dy: 40, text: 'Réunion' });
    clockAt('may', at('Mayotte') - 0.1, tCal - 0.5, { dx: -80, dy: -120 });
    A.label({ t0: at('Africa') - 0.1, t1: tCal - 0.5, ll: [38, 2], text: 'Africa', size: 44, color: 'rgba(255,255,255,.85)' });

    clockAt('nc', tCal - 0.1, tRun - 0.3, { dx: -10, dy: -100 });
    clockAt('tah', tPoly - 0.1, tRun - 0.3, { dx: 0, dy: -100, text: 'French Polynesia' });
    clockAt('wal', tWal - 0.1, tRun - 0.3, { dx: 0, dy: -100 });
    A.label({ t0: tPac - 0.1, t1: tRun - 0.3, ll: [-165, -32], text: 'Pacific Ocean', size: 44, color: 'rgba(255,255,255,.85)' });

    // ---- extremes: Tahiti UTC−10 vs Wallis UTC+12, with day of week
    A.arc({ t0: tRun, t1: tStr - 0.2, pts: [T.tah.ll, T.wal.ll], color: YEL, width: 5, dash: '12 12', draw: [tM10, tP12 + 0.6], head: false });
    const big = (k, t0, xy, col) => {
      A.clock({ t0, t1: tStr - 0.2, xy, r: 70, ring: col, fn: t => { const l = local(T[k].off, t); return [l.h, l.m]; } });
      A.html({ t0, t1: tStr - 0.2, fn: (t, a) => {
        const l = local(T[k].off, t);
        return `<div class="label" style="left:${xy[0]}px;top:${xy[1] + 128}px;opacity:${a};font-size:46px;color:${col}">${dayName(l.d)} ${hhmm(l)}<span class="sub">${T[k].name} · ${offTxt(T[k].off)}</span></div>`;
      } });
    };
    big('tah', tM10 - 0.1, [800, 460], GRN);
    big('wal', tP12 - 0.1, [280, 460], YEL);
    A.pin({ t0: tRun, t1: tStr - 0.2, ll: T.tah.ll, color: GRN, size: 11 });
    A.pin({ t0: tRun, t1: tStr - 0.2, ll: T.wal.ll, color: YEL, size: 11 });
    A.label({ t0: tRun, t1: tStr - 0.2, ll: T.tah.ll, dy: 50, text: 'Tahiti', size: 40 });
    A.label({ t0: tRun, t1: tStr - 0.2, ll: T.wal.ll, dy: 50, text: 'Wallis', size: 40 });
    A.headline({ t0: tRun - 0.05, t1: t22 - 0.15, text: 'UTC−10 → UTC+12', sub: 'one republic', size: 104, y: 170, pop: false });
    A.headline({ t0: t22 - 0.05, t1: tStr - 0.2, text: '', count: { from: 0, to: 22, t0: t22, t1: t22 + 0.9, suffix: ' hours' }, sub: 'apart · same country', size: 150, y: 160 });

    // ---- borders: Spain vs Brazil
    const spain = { type: 'MultiLineString', coordinates: [[[-1.795, 43.408], [-1.625, 43.283], [-1.471, 43.267], [-1.406, 43.198], [-1.481, 43.071], [-1.37, 43.038], [-1.301, 43.1], [-1.175, 43.021], [-0.934, 42.949], [-0.74, 42.909], [-0.585, 42.798], [-0.34, 42.83], [-0.139, 42.75], [-0.041, 42.689], [0.2, 42.72], [0.376, 42.699], [0.632, 42.689], [0.653, 42.8], [0.697, 42.845], [1.01, 42.779], [1.208, 42.713], [1.348, 42.691], [1.427, 42.595]], [[1.705, 42.503], [1.928, 42.427], [2.032, 42.354], [2.201, 42.422], [2.374, 42.39], [2.569, 42.345], [2.651, 42.34], [2.702, 42.408], [2.893, 42.456], [3.051, 42.448], [3.213, 42.43]]] };
    const brazil = { type: 'LineString', coordinates: [[-51.652, 4.061], [-51.767, 3.993], [-51.828, 3.87], [-51.929, 3.776], [-51.99, 3.702], [-52.116, 3.452], [-52.231, 3.271], [-52.328, 3.181], [-52.357, 3.051], [-52.418, 2.903], [-52.555, 2.648], [-52.584, 2.528], [-52.699, 2.363], [-52.872, 2.266], [-52.966, 2.183], [-53.081, 2.202], [-53.228, 2.205], [-53.286, 2.296], [-53.365, 2.323], [-53.509, 2.254], [-53.682, 2.292], [-53.768, 2.355], [-53.83, 2.313], [-53.945, 2.233], [-54.128, 2.12], [-54.229, 2.153], [-54.434, 2.207], [-54.55, 2.294], [-54.618, 2.327]] };
    A.country({ t0: tLong - 0.1, t1: tBrazil - 0.2, key: 'Spain', fill: '#ffffff', fillOpacity: 0.12, stroke: 'rgba(255,255,255,.6)', width: 2 });
    A.shape({ t0: tSpain - 0.1, t1: tBrazil - 0.2, geo: spain, fill: 'none', stroke: YEL, width: 7, glow: YEL });
    A.label({ t0: tLong, t1: tSpain + 0.6, ll: [-2.5, 40.3], text: 'Spain', size: 60 });
    A.label({ t0: tLong, t1: tSpain + 0.6, ll: [1.5, 45.8], text: 'France', size: 60 });
    A.headline({ t0: tLong - 0.1, t1: tBrazil - 0.2, text: 'Longest border?', sub: 'not the Pyrenees', size: 120, y: 170 });
    A.country({ t0: tBrazil - 0.2, t1: tIsl - 0.2, key: 'Brazil', fill: GRN, fillOpacity: 0.28, stroke: GRN, width: 2.5 });
    A.shape({ t0: tBrazil - 0.1, t1: tIsl - 0.2, geo: brazil, fill: 'none', stroke: YEL, width: 7, glow: YEL });
    A.label({ t0: tBrazil, t1: tIsl - 0.2, ll: [-52.2, 1.2], text: 'Brazil', size: 64, color: GRN });
    A.label({ t0: at('Guiana', 2) - 0.2, t1: tIsl - 0.2, ll: [-53.3, 4.2], text: 'French Guiana', size: 50 });
    A.headline({ t0: tBrazil - 0.1, t1: tIsl - 0.2, text: 'Brazil', sub: 'longest land border of France', size: 150, y: 160, color: GRN, subColor: '#fff' });
    A.flag({ t0: tBrazil + 0.2, t1: tIsl - 0.2, xy: [540, 440], code: 'br', w: 120 });

    // ---- Saint Martin: France meets the Netherlands
    A.dim(tIsl - 0.3, tCount + 0.1, 0.35);
    A.country({ t0: tIsl - 0.2, t1: tCount + 0.1, key: 'St-Martin', res: '10m', fill: BLU, fillOpacity: 0.6, stroke: '#fff', width: 3 });
    A.country({ t0: tIsl - 0.2, t1: tCount + 0.1, key: 'Sint Maarten', res: '10m', fill: '#ff8c3a', fillOpacity: 0.6, stroke: '#fff', width: 3 });
    A.shape({ t0: tNL - 0.4, t1: tCount - 0.2, geo: { type: 'LineString', coordinates: [[-63.017, 18.033], [-63.085, 18.058], [-63.107, 18.062]] }, fill: 'none', stroke: YEL, width: 7, glow: YEL });
    A.flag({ t0: at('Saint') - 0.05, t1: tCount - 0.2, ll: [-63.07, 18.1], dy: -190, code: 'fr', w: 110 });
    A.label({ t0: at('Saint') - 0.05, t1: tCount - 0.2, ll: [-63.06, 18.1], dy: -110, text: 'Saint-Martin', sub: 'France', size: 48 });
    A.flag({ t0: tNL - 0.1, t1: tCount - 0.2, ll: [-63.06, 18.03], dy: 170, code: 'nl', w: 110 });
    A.label({ t0: tNL - 0.1, t1: tCount - 0.2, ll: [-63.06, 18.03], dy: 90, text: 'Sint Maarten', sub: 'Netherlands', size: 48, color: '#ffb27a' });
    A.headline({ t0: tIsl - 0.1, t1: tCount - 0.2, text: 'Saint Martin', sub: 'one island · two countries', size: 130, y: 170 });

    // ---- Adélie Land: the disputed 13th
    const wedge = { type: 'Polygon', coordinates: [[[136, -66.3], [139, -66.4], [142, -66.6], [142, -80], [142, -89.5], [136, -89.5], [136, -80], [136, -66.3]]] };
    A.shape({ t0: tAdelie - 0.2, t1: tSpread - 0.1, geo: wedge, fill: BLU, fillOpacity: 0.6, stroke: YEL, width: 4, glow: YEL });
    A.pin({ t0: tAdelie, t1: tSpread - 0.1, ll: [140.0, -66.66], color: BLU, size: 9 });
    A.clock({ t0: t13 - 0.2, t1: tSpread - 0.1, ll: [139, -74], r: 44, ring: BLU, fn: t => { const l = local(10, t); return [l.h, l.m]; } });
    A.label({ t0: tAdelie - 0.1, t1: tSpread - 0.1, ll: [139, -61.5], text: 'Adélie Land', sub: 'french claim · few countries recognise it', size: 56 });
    A.label({ t0: t13 - 0.2, t1: tSpread - 0.1, ll: [139, -61.5], dy: 62, text: 'UTC+10', size: 44, color: YEL });
    A.headline({ t0: tCount - 0.05, t1: t13 - 0.15, text: 'Antarctica', sub: 'French claim', size: 130, y: 170, pop: false });
    A.headline({ t0: t13 - 0.1, t1: tSpread - 0.1, text: 'Zone 13?', sub: 'only if you count Antarctica', size: 150, y: 160, color: BLU, subColor: '#fff' });

    // ---- the sun never sets on France: day/night sweeps, every territory lights up when in daylight
    A.sun(tSpread - 0.2, A.dur + 1, t => [subLon(t), 0]);
    const all = Object.values(T);
    A.svg({ t0: tSpread + 0.2, t1: A.dur + 1, fn: (t, a, proj) => {
      const sl = subLon(t);
      let s = '';
      for (const p of all) {
        const r = proj.rotate();
        if (d3.geoDistance(p.ll, [-r[0], -r[1]]) > Math.PI / 2 - 0.03) continue;
        const up = Math.cos(p.ll[1] * D) * Math.cos((p.ll[0] - sl) * D) > 0;
        const [x, y] = proj(p.ll);
        const c = up ? YEL : '#6b7a99';
        s += `<circle cx="${x}" cy="${y}" r="${up ? 22 : 10}" fill="${c}" opacity="${(up ? 0.3 : 0.2) * a}"/><circle cx="${x}" cy="${y}" r="${up ? 10 : 7}" fill="${c}" stroke="#fff" stroke-width="2.5" opacity="${a}"/>`;
      }
      return s;
    } });
    A.headline({ t0: tSpread - 0.05, t1: tAlways - 0.1, text: 'Pick any moment', sub: 'some french land is in daylight', size: 110, y: 170, pop: false });
    A.headline({ t0: tAlways - 0.1, t1: tEnd, text: 'Always daytime', sub: 'somewhere in France', size: 130, y: 170, color: YEL, subColor: '#fff' });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the most time zones on earth', line2: '12 zones. Russia has 11.', y: 760 });
  },
};
