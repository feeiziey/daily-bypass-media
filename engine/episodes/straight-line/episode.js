// The Straight Line: Sonmiani (Pakistan) -> Kamchatka, 32,089.7 km over water.
// Route = the long arc of the great circle through Sonmiani and the Mozambique Channel.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp } = A;
    const D = Math.PI / 180;
    const v = (lon, lat) => [Math.cos(lat * D) * Math.cos(lon * D), Math.cos(lat * D) * Math.sin(lon * D), Math.sin(lat * D)];
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const norm = a => { const l = Math.hypot(...a); return a.map(x => x / l); };
    const S = [66.6, 25.4];
    const a = v(...S), m = v(41.0, -18.5);
    let w = cross(norm(cross(a, m)), a);
    if (w[0] * m[0] + w[1] * m[1] + w[2] * m[2] < 0) w = w.map(x => -x);
    const pt = deg => { const c = Math.cos(deg * D), s = Math.sin(deg * D); const p = a.map((x, i) => c * x + s * w[i]); return [Math.atan2(p[1], p[0]) / D, Math.asin(p[2]) / D]; };
    const TOTAL = 288.6;
    const route = []; for (let d = 0; d <= TOTAL; d += 1.5) route.push(pt(d));
    route.push(pt(TOTAL));
    const END = pt(TOTAL);

    // narration-synced progress along the route (degrees of arc)
    const keys = [
      [at('ship'), 0], [at('Madagascar'), 48], [at('tip'), 76], [at('Atlantic', 1), 100],
      [at('Antarctica'), 130], [at('Pacific'), 150], [at('North'), 185], [at('weeks'), 240], [atEnd('Russia'), TOTAL],
    ];
    const degAt = t => {
      if (t <= keys[0][0]) return 0;
      for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) return lerp(keys[i - 1][1], keys[i][1], (t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      return TOTAL;
    };

    const tHere = at('here'), tShip = at('ship'), tRussia = atEnd('Russia');
    const tTotal = at('Total'), t80 = at('80%'), t2012 = at('2012'), t2018 = at('2018');
    const tLand = at('longest', 1), tThird = at('Barely'), tPlanet = at('We'), tEnd = A.sentence(13).t1 + 1.3;

    // ---- camera
    cam.init({ lon: 70, lat: -5, r: 540, cy: 1000 });
    cam.drift(0.6);
    cam.move(0.2, { r: 575 }, 4, 'out', false);
    cam.move(tHere - 0.3, { lon: S[0] - 3, lat: S[1] - 2, r: 1500 }, 1.5);
    cam.move(tShip + 0.4, { lon: 55, lat: 0, r: 700 }, 1.2);
    cam.follow(tShip + 1.0, tRussia + 0.3, t => { const h = pt(Math.max(0, degAt(t) - 3)); return { lon: h[0], lat: clamp(h[1], -50, 55), r: 690 }; }, 1.2);
    cam.move(tRussia + 0.2, { lon: END[0] + 4, lat: END[1] - 4, r: 1150 }, 1.2);
    cam.move(tTotal - 0.2, { lon: -95, lat: -20, r: 560 }, 1.6);
    cam.follow(tTotal + 1.6, t2012 - 0.2, t => ({ lon: -95 - (t - tTotal) * 9, lat: -20, r: 560 }), 1.0);
    cam.move(tLand - 0.3, { lon: 62, lat: 50, r: 560 }, 1.6);
    cam.move(tPlanet - 0.2, { lon: -165, lat: -8, r: 575 }, 2.2);
    cam.move(tEnd, { r: 520, cy: 1060 }, 2.5, 'out', false);

    // ---- hook
    A.arc({ t0: 0.1, t1: tHere, pts: route, color: '#ffffff', width: 3, dash: '10 12', head: false, fo: 0.6 });
    A.headline({ t0: at('32,000') - 0.1, t1: tHere - 0.1, text: '32,000 km', sub: 'in a straight line · zero land', size: 150, y: 160 });

    // ---- start
    A.pin({ t0: at('beach'), t1: tRussia + 0.5, ll: S, color: '#ff3b4e' });
    A.label({ t0: at('beach'), t1: tShip + 0.6, ll: S, dx: 0, dy: -95, text: 'Sonmiani', sub: 'Balochistan · Pakistan', size: 58 });
    A.headline({ t0: at('Pakistan') - 0.1, t1: tShip - 0.1, text: 'Start: Pakistan', sub: '25.4°N · 66.6°E', size: 110, y: 170, pop: false });
    A.emoji({ t0: at('Point'), t1: tShip + 1.0, ll: S, dx: -30, dy: 90, char: '🚢', size: 100 });
    A.headline({ t0: at('never', 2) - 0.1, t1: at('wheel') + 0.9, text: 'Never turn', sub: 'one heading · one great circle', size: 120, y: 170 });

    // ---- the voyage
    A.arc({ t0: tShip, t1: A.dur, pts: route, color: '#ffd23f', width: 7, progress: t => degAt(t) / TOTAL, fo: 0 });
    const L = (q, ll, text, sub, dur = 2.6, extra = {}) => A.label({ t0: at(q) - 0.1, t1: at(q) + dur, ll, text, sub, size: 52, ...extra });
    L('Africa', [24, 2], 'Africa');
    L('Madagascar', [46.8, -19.5], 'Madagascar', '', 2.6, { dx: 60 });
    L('tip', [22, -34.2], 'Cape Agulhas', 'tip of Africa', 2.4, { dy: -40 });
    L('Atlantic', [-10, -35], 'South Atlantic', '', 2.4);
    L('Antarctica', [-58, -68], 'Antarctica', '', 2.8);
    L('America', [-68, -45], 'South America', '', 2.8);
    L('Pacific', [-128, -8], 'Pacific Ocean', '', 3.0);
    A.emoji({ t0: at('North') - 0.1, t1: tRussia - 0.2, xy: [540, 360], char: '🧭', size: 90 });
    A.pin({ t0: tRussia - 0.3, t1: tTotal + 0.2, ll: END, color: '#3ee08f' });
    A.label({ t0: tRussia - 0.3, t1: tTotal + 0.2, ll: END, dy: -90, text: 'Kamchatka', sub: 'Russia · the first land', size: 60 });
    A.headline({ t0: at('first') - 0.1, t1: tTotal - 0.2, text: 'Land ahoy', sub: 'Karaginsky district · Kamchatka', size: 120, y: 170, color: '#3ee08f' });

    // ---- the number
    A.headline({ t0: tTotal, t1: t80 - 0.1, text: '', count: { from: 0, to: 32090, t0: tTotal + 0.1, t1: at('kilometers', 2) + 0.6, suffix: ' km' }, sub: 'Sonmiani → Kamchatka', size: 150, y: 160 });
    A.bars({ t0: t80 - 0.05, t1: t2012 - 0.1, y: 150, grow: [t80, t80 + 1.4], rows: [
      { label: 'This route', value: 32090, max: 40075, color: '#ffd23f', suffix: ' km' },
      { label: 'Earth, all the way round', value: 40075, max: 40075, color: '#5ab8ff', suffix: ' km' },
    ] });
    A.card({ t0: t2012, t1: t2018 - 0.1, xy: [540, 330], k: 'posted on reddit', v: '2012', rot: -3 });
    A.card({ t0: t2018, t1: tLand - 0.2, xy: [540, 330], k: 'checked by an algorithm', v: '2018 · It held', rot: 2 });
    A.label({ t0: t2018 + 0.6, t1: tLand - 0.2, xy: [540, 470], text: '', sub: 'Chabukswar & Mukherjee · arXiv 1804.07389', size: 20 });

    // ---- land line: Sagres (PT) -> Jinjiang (CN), 11,241.1 km
    const sag = [-8.94, 37.01], jin = [118.55, 24.78];
    A.arc({ t0: tLand, t1: tPlanet, pts: [sag, jin], color: '#3ee08f', width: 7, draw: [at('Portugal'), at('China') + 1.2] });
    A.pin({ t0: at('Portugal') - 0.1, t1: tPlanet, ll: sag, color: '#3ee08f', size: 9 });
    A.pin({ t0: at('China') - 0.1, t1: tPlanet, ll: jin, color: '#3ee08f', size: 9 });
    A.label({ t0: at('Portugal') - 0.1, t1: tPlanet, ll: sag, dy: 58, text: 'Portugal', size: 38 });
    A.label({ t0: at('China') - 0.1, t1: tPlanet, ll: jin, dy: 58, text: 'China', size: 38 });
    A.headline({ t0: at('About', 2) - 0.1, t1: tThird - 0.1, text: '11,241 km', sub: 'longest straight line on land', size: 140, y: 160, color: '#3ee08f', subColor: '#fff' });
    A.bars({ t0: tThird - 0.05, t1: tPlanet - 0.1, y: 150, grow: [tThird, tThird + 1.0], rows: [
      { label: 'By sea', value: 32090, max: 32090, color: '#ffd23f', suffix: ' km' },
      { label: 'By land', value: 11241, max: 32090, color: '#3ee08f', suffix: ' km' },
    ] });

    // ---- final wonder
    A.headline({ t0: at('Ocean') - 0.15, t1: tEnd, text: 'Planet Ocean', sub: 'water covers ~71% of the surface', size: 130, y: 170, color: '#5ab8ff', subColor: '#fff' });
    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the longest straight line', line2: '32,090 km. Zero land.', y: 760 });
  },
};
