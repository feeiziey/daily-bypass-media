// One Clock: China spans ~61 degrees of longitude (73.5E-134.8E) but runs on UTC+8.
// Sun and clocks share one driver: Beijing time B(t) -> subsolar lon = (20 - B) * 15 (EoT ignored).
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, clamp, lerp } = A;
    const YEL = '#ffd23f', RED = '#ff3b4e', GRN = '#3ee08f', BLU = '#5ab8ff', ORG = '#ff8c3a';
    const KAS = [75.99, 39.47], BEI = [116.4, 39.9], URU = [87.6, 43.8];
    const WEST = [73.5, 39.4], EAST = [134.77, 48.35];
    const WAKHAN = [74.7, 37.15];

    const tChina = at('China'), tFive = at('five'), tOne = at('one'), tPamir = at('Pamir'), tAmur = at('Amur'), t60 = at('60');
    const tSun = at('sun'), tBei = at('Beijing'), tUTC = at('UTC+8'), t1949 = at('1949'), tFive2 = at('five', 2), tMade = at('made');
    const tWatch = at('watch'), tCare = at('care'), tKas = at('Kashgar'), tNoon = at('noon'), t3pm = at('3pm');
    const tWinter = at('winter'), t10am = at('10am'), tSummer = at('summer'), t10pm = at('10pm');
    const tAhead = at('3hours'), tSo = at('So'), tXj = at('Xinjiang'), tTwo = at('Two');
    const tAfghan = at('Afghan'), tWakhan = at('Wakhan'), tJumps = at('jumps'), tBig = at('biggest');
    const tOneC = at('One country'), tKeeps = at('keeps'), tEnd = A.sentence(13).t1 + 1.2;

    // ---- the day driver
    // Beijing clock hours (continuous) and subsolar latitude, keyed to narration
    const keysB = [
      [0, 9.0], [tWatch - 0.3, 9.0], [tNoon - 0.4, 14.93], [tWinter - 0.1, 14.93], [t10am - 0.2, 24 + 10.22],
      [tSummer - 0.1, 24 + 10.22], [t10pm - 0.2, 24 + 22.43], [tSo - 0.2, 24 + 22.43], [tAfghan - 0.4, 48 + 12.0], [A.dur + 2, 48 + 12.5],
    ];
    const keysL = [[0, 0], [tWinter - 0.1, 0], [t10am - 0.2, -23.44], [tSummer - 0.1, -23.44], [t10pm - 0.2, 23.44], [tSo - 0.2, 23.44], [tAfghan - 0.4, 10], [A.dur + 2, 10]];
    const interp = (keys, t) => {
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], prog(t, keys[i - 1][0], keys[i][0], 'inOut'));
      return keys[keys.length - 1][1];
    };
    const B = t => interp(keysB, t);
    const sunLL = t => [((20 - B(t)) * 15 + 540) % 360 - 180, interp(keysL, t)];
    const hm = h => { const x = ((h % 24) + 24) % 24; return [Math.floor(x), (x % 1) * 60]; };
    const fmt = h => { const [H, M] = hm(h); return String(H).padStart(2, '0') + ':' + String(Math.floor(M)).padStart(2, '0'); };

    // ---- camera
    cam.init({ lon: 104, lat: 30, r: 540, cy: 1020 });
    cam.move(0.2, { r: 600 }, 3.5, 'out', false);
    cam.move(tPamir - 0.3, { lon: 104, lat: 38, r: 1080, cy: 1060 }, 1.5);
    cam.move(tWatch - 0.4, { lon: 100, lat: 36, r: 1050, cy: 1080 }, 1.4);
    cam.move(tAhead - 0.3, { lon: 98, lat: 37, r: 1350, cy: 1080 }, 1.2);
    cam.move(tSo - 0.2, { lon: 84, lat: 40, r: 2600, cy: 1060 }, 1.4);
    cam.move(tAfghan - 0.3, { lon: 74.0, lat: 36.9, r: 7500, cy: 1000 }, 1.8);
    cam.move(tWakhan + 0.2, { lon: 74.6, lat: 37.1, r: 13000, cy: 1000 }, 1.6, 'inOut', false);
    cam.move(tOneC - 0.3, { lon: 104, lat: 33, r: 1150, cy: 1060 }, 1.8);
    cam.move(tEnd, { r: 560, cy: 1060 }, 2.5, 'out', false);

    // ---- hook
    A.country({ t0: 0.2, t1: tEnd, key: 'China', fill: YEL, fillOpacity: 0.16, stroke: YEL, width: 3, fo: 0.8 });
    A.headline({ t0: tFive - 0.1, t1: tOne - 0.15, text: '5 zones wide', sub: 'by the sun', size: 140, y: 160 });
    A.headline({ t0: tOne - 0.1, t1: tPamir - 0.2, text: '1 clock', sub: 'beijing time · everywhere', size: 160, y: 150, color: YEL, subColor: '#fff' });
    A.clock({ t0: tOne - 0.1, t1: tPamir - 0.2, ll: [100, 36], r: 64, fn: t => hm(B(t)) });

    // ---- the width
    A.pin({ t0: tPamir - 0.1, t1: tSun - 0.1, ll: WEST, color: RED, size: 10 });
    A.label({ t0: tPamir - 0.1, t1: tSun - 0.1, ll: WEST, dy: 70, text: 'Pamirs', sub: '73.5°E', size: 44 });
    A.pin({ t0: tAmur - 0.1, t1: tSun - 0.1, ll: EAST, color: RED, size: 10 });
    A.label({ t0: tAmur - 0.1, t1: tSun - 0.1, ll: EAST, dy: 70, dx: -30, text: 'Amur River', sub: '134.8°E', size: 44 });
    A.meridian({ t0: tPamir, t1: tSun - 0.1, lon: 73.5, color: RED, width: 3, dash: '8 10' });
    A.meridian({ t0: tAmur, t1: tSun - 0.1, lon: 134.8, color: RED, width: 3, dash: '8 10' });
    A.headline({ t0: t60 - 0.1, t1: tSun - 0.2, text: '', count: { from: 0, to: 61, t0: t60, t1: t60 + 1.0, suffix: '°' }, sub: 'of longitude', size: 170, y: 150 });

    // 15-degree solar zones over China
    const Z = [75, 90, 105, 120, 135];
    Z.forEach((lon, i) => {
      A.meridian({ t0: tSun + i * 0.12, t1: t1949 + 0.2, lon, color: '#ffffff', width: 2, dash: '4 8' });
      A.label({ t0: tSun + i * 0.12, t1: tBei - 0.1, ll: [lon, 20], text: '+' + (5 + i), sub: 'utc', size: 46, color: YEL });
    });
    A.headline({ t0: tSun - 0.1, t1: tBei - 0.2, text: '≈ 4 hours', sub: 'of sunlight to cross it', size: 140, y: 160 });
    A.emoji({ t0: tSun, t1: tBei - 0.2, xy: [540, 400], char: '☀️', size: 80, bob: false });

    // ---- one clock everywhere
    const cities = [[KAS, 'Kashgar'], [[91.1, 29.65], 'Lhasa'], [[104.07, 30.67], 'Chengdu'], [BEI, 'Beijing'], [[126.6, 45.75], 'Harbin']];
    cities.forEach(([ll, name], i) => {
      A.clock({ t0: tBei + i * 0.15, t1: t1949 - 0.1, ll, r: 34, dy: -52, fn: t => hm(B(t)) });
      A.label({ t0: tBei + i * 0.15, t1: t1949 - 0.1, ll, dy: 16, text: name, size: 30 });
    });
    A.headline({ t0: tBei - 0.1, t1: t1949 - 0.15, text: 'UTC+8', sub: 'beijing time · all of china', size: 160, y: 150, color: YEL, subColor: '#fff' });

    // ---- before 1949: five zones (approximate bands, clipped to China)
    const bands = [[70, 82.5, 'Kunlun', '+5:30', '#b48cff'], [82.5, 97.5, 'Sinkiang-Tibet', '+6', BLU], [97.5, 112.5, 'Kansu-Szechwan', '+7', GRN], [112.5, 127.5, 'Chungyuan', '+8', YEL], [127.5, 136, 'Changpai', '+8:30', ORG]];
    const china = A.feature('China');
    const bandGeo = (w, e) => ({ type: 'Polygon', coordinates: [[[w, 17], [w, 55], [e, 55], [e, 17], [w, 17]]] });
    A.svg({ t0: t1949 - 0.1, t1: tMade + 0.9, fn: (t, a, proj) => {
      const path = d3.geoPath(proj);
      const clip = path(china);
      if (!clip) return '';
      const pOn = i => clamp((t - t1949 - i * 0.18) / 0.4);
      const merge = prog(t, tMade - 0.1, tMade + 0.7);
      return `<defs><clipPath id="cnclip"><path d="${clip}"/></clipPath></defs><g clip-path="url(#cnclip)">` +
        bands.map((b, i) => `<path d="${path(bandGeo(b[0], b[1]))}" fill="${lerp(0, 1, 1 - merge) > 0 ? b[4] : YEL}" fill-opacity="${0.5 * a * pOn(i) * (1 - merge) + 0.35 * merge * a}" stroke="#fff" stroke-width="2" stroke-opacity="${a * (1 - merge)}"/>`).join('') + '</g>';
    } });
    bands.forEach((b, i) => {
      const ll = [(b[0] + Math.min(b[1], 134)) / 2, i === 0 ? 37 : i === 4 ? 45 : 32];
      A.label({ t0: t1949 + 0.4 + i * 0.18, t1: tMade - 0.1, ll, text: b[3], sub: b[2], size: 54, color: b[4] });
    });
    A.card({ t0: t1949 - 0.1, t1: tMade - 0.15, xy: [540, 330], k: 'until · bands approximate', v: '1949 · five zones', rot: -2 });
    A.headline({ t0: tMade - 0.1, t1: tWatch - 0.2, text: 'Now: one', sub: 'utc+8 from border to border', size: 150, y: 160, color: YEL, subColor: '#fff' });

    // ---- the day: sun moves, clocks don't
    A.sun(tWatch - 0.3, tAfghan + 0.2, sunLL);
    A.pin({ t0: tWatch, t1: tSo, ll: KAS, color: RED, size: 10 });
    A.label({ t0: tWatch, t1: tSo, ll: KAS, dy: 60, text: 'Kashgar', size: 44 });
    A.pin({ t0: tWatch, t1: tSo, ll: BEI, color: YEL, size: 10 });
    A.label({ t0: tWatch, t1: tSo, ll: BEI, dy: 60, text: 'Beijing', size: 44 });
    const pairClock = (xy, name, col, t0, t1) => {
      A.clock({ t0, t1, xy, r: 62, ring: col, fn: t => hm(B(t)) });
      A.html({ t0, t1, fn: (t, a) => `<div class="label" style="left:${xy[0]}px;top:${xy[1] + 108}px;opacity:${a};font-size:44px">${fmt(B(t))}<span class="sub">${name}</span></div>` });
    };
    pairClock([280, 470], 'Kashgar clock', RED, tWatch - 0.1, tAhead - 0.2);
    pairClock([800, 470], 'Beijing clock', YEL, tWatch - 0.1, tAhead - 0.2);
    A.headline({ t0: tWatch - 0.1, t1: tKas - 0.2, text: 'Same time', sub: 'different sun', size: 120, y: 170, pop: false });
    A.headline({ t0: tNoon - 0.2, t1: tWinter - 0.2, text: 'Noon at 3 PM', sub: 'kashgar · sun at its highest', size: 120, y: 170, color: YEL, subColor: '#fff' });
    A.emoji({ t0: tNoon - 0.1, t1: tWinter - 0.2, ll: KAS, dy: -80, char: '☀️', size: 70 });
    A.headline({ t0: tWinter - 0.1, t1: tSummer - 0.2, text: 'Sunrise 10 AM', sub: 'kashgar · december', size: 120, y: 170, color: ORG, subColor: '#fff' });
    A.emoji({ t0: t10am - 0.1, t1: tSummer - 0.2, ll: KAS, dy: -80, char: '🌅', size: 70 });
    A.headline({ t0: tSummer - 0.1, t1: tAhead - 0.2, text: 'Sunset 10 PM', sub: 'kashgar · june', size: 120, y: 170, color: BLU, subColor: '#fff' });
    A.emoji({ t0: t10pm - 0.1, t1: tAhead - 0.2, ll: KAS, dy: -80, char: '🌇', size: 70 });

    // ---- the number: 44 degrees = ~3 hours
    A.meridian({ t0: tAhead - 0.2, t1: tSo - 0.1, lon: 120, color: YEL, width: 4 });
    A.meridian({ t0: tAhead - 0.2, t1: tSo - 0.1, lon: 76, color: RED, width: 4 });
    A.arc({ t0: tAhead, t1: tSo - 0.1, pts: [[76, 49], [120, 49]], color: '#fff', width: 5, draw: [tAhead, tAhead + 0.9] });
    A.label({ t0: tAhead + 0.5, t1: tSo - 0.1, ll: [98, 51.5], text: '44°', sub: '≈ 2 h 56 min of sun', size: 52 });
    A.label({ t0: tAhead, t1: tSo - 0.1, ll: [120, 28], dx: 40, text: '120°E', sub: 'beijing time set here', size: 36, color: YEL });
    A.label({ t0: tAhead, t1: tSo - 0.1, ll: [76, 30], text: '76°E', sub: 'kashgar', size: 36, color: RED });
    A.headline({ t0: tAhead - 0.1, t1: tSo - 0.15, text: '', count: { from: 0, to: 3, t0: tAhead, t1: tAhead + 0.8, prefix: '+', suffix: ' hours' }, sub: "kashgar's clock vs its sun", size: 160, y: 150 });

    // ---- Xinjiang Time
    A.pin({ t0: tSo, t1: tAfghan - 0.3, ll: URU, color: BLU, size: 10 });
    A.label({ t0: tSo, t1: tAfghan - 0.3, ll: URU, dy: 60, text: 'Ürümqi', size: 42 });
    A.pin({ t0: tSo, t1: tAfghan - 0.3, ll: KAS, color: BLU, size: 10 });
    A.label({ t0: tSo, t1: tAfghan - 0.3, ll: KAS, dy: 60, text: 'Kashgar', size: 42 });
    A.label({ t0: at('unofficial') - 0.1, t1: tAfghan - 0.3, ll: [85, 41.5], text: 'Xinjiang', size: 70, color: 'rgba(255,255,255,.9)' });
    A.clock({ t0: tXj - 0.1, t1: tAfghan - 0.3, xy: [280, 470], r: 62, ring: BLU, fn: t => hm(B(t) - 2) });
    A.html({ t0: tXj - 0.1, t1: tAfghan - 0.3, fn: (t, a) => `<div class="label" style="left:280px;top:578px;opacity:${a};font-size:44px;color:${BLU}">${fmt(B(t) - 2)}<span class="sub">xinjiang time</span></div>` });
    A.clock({ t0: tXj - 0.1, t1: tAfghan - 0.3, xy: [800, 470], r: 62, ring: YEL, fn: t => hm(B(t)) });
    A.html({ t0: tXj - 0.1, t1: tAfghan - 0.3, fn: (t, a) => `<div class="label" style="left:800px;top:578px;opacity:${a};font-size:44px;color:${YEL}">${fmt(B(t))}<span class="sub">beijing time</span></div>` });
    A.headline({ t0: tSo - 0.1, t1: tXj - 0.2, text: 'Their own clock', sub: 'unofficial · local', size: 120, y: 170 });
    A.headline({ t0: tXj - 0.1, t1: tAfghan - 0.3, text: 'UTC+6', sub: 'xinjiang time · 2 h behind', size: 150, y: 160, color: BLU, subColor: '#fff' });

    // ---- Wakhan: +3:30
    const border = { type: 'LineString', coordinates: [[74.544,  37.021],  [74.519,  37.031],  [74.505,  37.046],  [74.494,  37.067],  [74.476,  37.083],  [74.415,  37.107],  [74.382,  37.127],  [74.368,  37.148],  [74.368,  37.168],  [74.382,  37.171],  [74.422,  37.168],  [74.443,  37.171],  [74.458,  37.178],  [74.469,  37.19],  [74.476,  37.21],  [74.487,  37.225],  [74.501,  37.232],  [74.533,  37.232],  [74.577,  37.242],  [74.591,  37.244],  [74.598,  37.24],  [74.609,  37.23],  [74.616,  37.229],  [74.623,  37.23],  [74.627,  37.234],  [74.631,  37.239],  [74.641,  37.249],  [74.645,  37.256],  [74.652,  37.259],  [74.67,  37.261],  [74.677,  37.264],  [74.699,  37.281],  [74.71,  37.291],  [74.721,  37.298],  [74.739,  37.296],  [74.746,  37.288],  [74.782,  37.22],  [74.793,  37.213],  [74.814,  37.215],  [74.893,  37.23]] };
    A.country({ t0: tAfghan - 0.2, t1: tOneC - 0.2, key: 'Afghanistan', fill: ORG, fillOpacity: 0.3, stroke: ORG, width: 3 });
    A.shape({ t0: tWakhan - 0.1, t1: tOneC - 0.2, geo: border, fill: 'none', stroke: '#fff', width: 7, glow: '#fff' });
    A.label({ t0: tAfghan, t1: tOneC - 0.2, ll: [72.9, 36.35], text: 'Afghanistan', size: 54, color: '#ffb27a' });
    A.label({ t0: tAfghan, t1: tOneC - 0.2, ll: [75.6, 37.6], text: 'China', size: 60, color: YEL });
    A.label({ t0: tWakhan - 0.1, t1: tOneC - 0.2, ll: [73.4, 37.25], dy: -50, text: 'Wakhan', sub: 'corridor', size: 40, color: '#ffb27a' });
    A.clock({ t0: tWakhan, t1: tOneC - 0.2, xy: [280, 470], r: 62, ring: ORG, fn: t => hm(B(t) - 3.5) });
    A.html({ t0: tWakhan, t1: tOneC - 0.2, fn: (t, a) => `<div class="label" style="left:280px;top:578px;opacity:${a};font-size:44px;color:#ffb27a">${fmt(B(t) - 3.5)}<span class="sub">afghanistan · utc+4:30</span></div>` });
    A.clock({ t0: tWakhan + 0.3, t1: tOneC - 0.2, xy: [800, 470], r: 62, ring: YEL, fn: t => hm(B(t)) });
    A.html({ t0: tWakhan + 0.3, t1: tOneC - 0.2, fn: (t, a) => `<div class="label" style="left:800px;top:578px;opacity:${a};font-size:44px;color:${YEL}">${fmt(B(t))}<span class="sub">china · utc+8</span></div>` });
    A.headline({ t0: tAfghan - 0.1, t1: tJumps - 0.2, text: 'The Afghan border', sub: '≈ 92 km of mountains', size: 110, y: 170 });
    A.headline({ t0: tJumps - 0.1, t1: tOneC - 0.2, text: '+3:30', sub: 'biggest clock jump on any land border', size: 170, y: 150, color: YEL, subColor: '#fff' });

    // ---- loop: one clock, five suns
    Z.forEach((lon, i) => A.meridian({ t0: tOneC + i * 0.1, t1: tEnd, lon, color: '#ffffff', width: 2, dash: '4 8' }));
    A.clock({ t0: at('One clock', 2) - 0.1, t1: tEnd, ll: [104, 34], r: 66, fn: t => hm(B(t)) });
    Z.forEach((lon, i) => A.emoji({ t0: tKeeps + i * 0.12, t1: tEnd, ll: [lon, 51], char: '☀️', size: 60, bob: false }));
    A.headline({ t0: tOneC - 0.1, t1: tEnd, text: 'One clock', sub: 'five suns', size: 150, y: 160, color: YEL, subColor: '#fff' });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'china runs on one clock', line2: 'Five zones wide. One time.', y: 760 });
  },
};
