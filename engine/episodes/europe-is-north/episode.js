// Europe Is North: latitude pairs across the Atlantic, then why Europe is mild
// (Seager et al. 2002: mostly the westerlies + seasonal ocean heat release, not Gulf Stream heat transport).
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp } = A;

    const shots = [];
    const go = (t, to, dur = 1.4) => shots.push({ t, to, dur });
    const rollShots = () => {
      shots.sort((a, b) => a.t - b.t);
      shots.forEach((sh, i) => {
        cam.move(sh.t, sh.to, sh.dur);
        const hold0 = sh.t + sh.dur, hold1 = i + 1 < shots.length ? shots[i + 1].t : A.dur;
        if (hold1 - hold0 > 0.3 && !sh.still) cam.move(hold0, { lon: sh.to.lon + 0.35 * (hold1 - hold0) * Math.min(1, 560 / sh.to.r), r: sh.to.r * (1 + 0.012 * (hold1 - hold0)) }, hold1 - hold0, 'linear', false);
      });
    };

    const C = {
      nyc: [-74.006, 40.713], rome: [12.496, 41.903], madrid: [-3.704, 40.417],
      paris: [2.352, 48.857], seattle: [-122.332, 47.606], london: [-0.128, 51.507], calgary: [-114.071, 51.045],
      venice: [12.316, 45.440], montreal: [-73.567, 45.502], middle: [-82.68, 41.68],
    };
    const par = (lat, w, e, step = 1) => { const p = []; for (let l = w; l <= e; l += step) p.push([l, lat]); p.push([e, lat]); return p; };

    // ---- cues
    const tNY = at('New', 2), tRome = at('Rome', 2), tFollow = at('Follow'), tMadrid = at('Madrid');
    const tParis = at('Paris'), tLondon = at('London'), tVenice = at('Venice'), tEven = at('Even');
    const tYet = at('Yet'), tRome8 = at('Rome', 4), tMost = at('Most'), tBut = at('But');
    const tWest = at('Westerlies'), tNYW = at('New', 5), tSo = at('So'), tDown = at('warm', 2);
    const tEnd = A.sentence(15).t1 + 1.2;

    // ---- camera
    cam.init({ lon: -40, lat: 40, r: 540, cy: 1000 });
    cam.drift(0);
    go(0.1, { lon: -31, lat: 44, r: 640 }, 2.4);
    go(tFollow - 0.2, { lon: -58, lat: 41, r: 900 }, 1.3);
    shots.push({ t: tFollow + 1.2, to: { lon: -8, lat: 40, r: 900 }, dur: tMadrid - tFollow - 0.9, still: true });
    go(tParis - 0.5, { lon: -58, lat: 46, r: 560 }, 1.6);
    go(tEven - 0.3, { lon: C.middle[0] + 0.1, lat: C.middle[1] + 0.05, r: 12000 }, 1.8);
    shots.push({ t: tYet - 0.3, to: { lon: -31, lat: 42, r: 600 }, dur: 1.8, still: true });
    go(tWest - 0.3, { lon: -25, lat: 47, r: 680 }, 1.4);
    go(tNYW - 0.3, { lon: -80, lat: 48, r: 700 }, 1.5);
    go(tSo - 0.3, { lon: -12, lat: 45, r: 780 }, 1.5);
    rollShots();
    cam.move(tEnd, { r: 520, cy: 1060 }, 2.5, 'out', false);

    // ---- hook: two pins, two parallels
    A.pin({ t0: 0.4, t1: tFollow, ll: C.rome, color: '#3ee08f' });
    A.pin({ t0: at('New', 1), t1: tFollow, ll: C.nyc, color: '#ff3b4e' });
    A.label({ t0: 0.4, t1: tFollow, ll: C.rome, dy: -70, text: 'Rome', size: 50 });
    A.label({ t0: at('New', 1), t1: tFollow, ll: C.nyc, dy: 70, text: 'New York', size: 50 });
    A.arc({ t0: tNY, t1: tParis - 0.3, pts: par(40.713, -100, 40), color: '#ff3b4e', width: 4, draw: [tNY, tNY + 1.4], head: false });
    A.arc({ t0: tRome, t1: tFollow + 0.2, pts: par(41.903, -100, 40), color: '#3ee08f', width: 4, draw: [tRome, tRome + 1.2], head: false });
    A.headline({ t0: 0.3, t1: tNY - 0.1, text: 'Rome: further north', sub: 'than New York City', size: 110, y: 170 });
    A.headline({ t0: tNY - 0.05, t1: tRome - 0.1, text: '40.7°N', sub: 'New York City', size: 160, y: 150, color: '#ff3b4e', subColor: '#fff', pop: false });
    A.headline({ t0: tRome - 0.05, t1: tFollow - 0.1, text: '41.9°N', sub: 'Rome · about 130 km further north', size: 160, y: 150, color: '#3ee08f', subColor: '#fff' });

    // ---- follow 40.7 N east to Madrid
    A.pin({ t0: tFollow, t1: tParis - 0.3, ll: C.nyc, color: '#ff3b4e' });
    A.label({ t0: tFollow, t1: tFollow + 1.6, ll: C.nyc, dy: 70, text: 'New York', sub: '40.71°N', size: 46 });
    A.arc({ t0: tFollow + 0.2, t1: tParis - 0.3, pts: par(40.713, -74, -3.7, 0.5), color: '#ffd23f', width: 7, draw: [tFollow + 1.2, tMadrid + 0.1] });
    A.pin({ t0: tMadrid - 0.1, t1: tParis - 0.3, ll: C.madrid, color: '#3ee08f' });
    A.label({ t0: tMadrid - 0.1, t1: tParis - 0.3, ll: C.madrid, dy: -80, text: 'Madrid', sub: '40.42°N', size: 56 });
    A.headline({ t0: tFollow - 0.05, t1: tMadrid - 0.15, text: "New York's line", sub: 'follow 40.7°N east', size: 120, y: 170 });
    A.headline({ t0: tMadrid - 0.05, t1: tParis - 0.3, text: 'Madrid', sub: 'same latitude as New York', size: 150, y: 160, color: '#3ee08f', subColor: '#fff' });
    A.flag({ t0: tMadrid, t1: tParis - 0.3, xy: [540, 400], code: 'es', w: 100 });

    // ---- pairs across the ocean
    const pair = (tA, tB, t1, eu, na, euName, naName, euLat, naLat, lab) => {
      A.arc({ t0: tA, t1, pts: par(euLat, -130, 20), color: '#3ee08f', width: 4, draw: [tA, tA + 1.0], head: false });
      A.arc({ t0: tB, t1, pts: par(naLat, -130, 20), color: '#ffd23f', width: 4, draw: [tB, tB + 1.0], head: false });
      A.pin({ t0: tA, t1, ll: eu, color: '#3ee08f', size: 9 });
      A.pin({ t0: tB, t1, ll: na, color: '#ffd23f', size: 9 });
      A.label({ t0: tA, t1, ll: eu, dy: lab[0], dx: lab[1], text: euName, sub: euLat.toFixed(2) + '°N', size: 42 });
      A.label({ t0: tB, t1, ll: na, dy: lab[2], dx: lab[3], text: naName, sub: naLat.toFixed(2) + '°N', size: 42 });
    };
    pair(tParis, at('Seattle'), tLondon - 0.1, C.paris, C.seattle, 'Paris', 'Seattle', 48.857, 47.606, [62, 10, 62, 0]);
    A.headline({ t0: tParis - 0.05, t1: tLondon - 0.15, text: 'Paris > Seattle', sub: '48.86°N vs 47.61°N', size: 130, y: 165 });
    pair(tLondon, at('Calgary'), tVenice - 0.1, C.london, C.calgary, 'London', 'Calgary', 51.507, 51.045, [-62, 0, -62, 0]);
    A.headline({ t0: tLondon - 0.05, t1: tVenice - 0.15, text: 'London > Calgary', sub: '51.51°N vs 51.05°N', size: 130, y: 165 });
    A.arc({ t0: tVenice, t1: tEven - 0.2, pts: par(45.47, -130, 20), color: '#5ab8ff', width: 5, draw: [tVenice, tVenice + 1.2], head: false });
    A.pin({ t0: tVenice, t1: tEven - 0.2, ll: C.venice, color: '#3ee08f', size: 9 });
    A.pin({ t0: at('Montreal'), t1: tEven - 0.2, ll: C.montreal, color: '#ffd23f', size: 9 });
    A.label({ t0: tVenice, t1: tEven - 0.2, ll: C.venice, dy: -62, text: 'Venice', sub: '45.44°N', size: 42 });
    A.label({ t0: at('Montreal'), t1: tEven - 0.2, ll: C.montreal, dy: -62, text: 'Montreal', sub: '45.50°N', size: 42 });
    A.headline({ t0: tVenice - 0.05, t1: tEven - 0.2, text: 'Venice = Montreal', sub: '45.44°N vs 45.50°N', size: 130, y: 165 });

    // ---- Canada's southernmost point vs Rome's parallel
    const tRome3 = at('Rome', 3);
    A.country({ t0: tEven + 0.8, t1: tYet - 0.2, key: 'Canada', fill: 'none', stroke: '#ff3b4e', width: 3 });
    A.arc({ t0: tEven + 1.0, t1: tYet - 0.2, pts: par(41.903, -90, -75, 0.25), color: '#3ee08f', width: 5, draw: [tRome3 - 0.6, tRome3 + 0.6], head: false });
    A.pin({ t0: at('island') - 0.1, t1: tYet - 0.2, ll: C.middle, color: '#ff3b4e', size: 9 });
    A.label({ t0: at('island') - 0.1, t1: tYet - 0.2, ll: C.middle, dy: 95, text: 'Middle Island', sub: "Canada's southernmost point · 41.68°N", size: 50 });
    A.label({ t0: tRome3, t1: tYet - 0.2, ll: [-84.4, 41.903], dy: -45, text: "Rome's latitude", sub: '41.90°N', size: 40, color: '#3ee08f' });
    A.label({ t0: tEven + 1.0, t1: tYet - 0.2, ll: [-81.0, 42.25], text: 'Lake Erie', size: 38, color: '#5ab8ff' });
    A.headline({ t0: tEven - 0.05, t1: tRome3 - 0.15, text: "Canada's south tip", sub: 'Middle Island · Lake Erie', size: 120, y: 170 });
    A.headline({ t0: tRome3 - 0.1, t1: tYet - 0.2, text: 'South of Rome', sub: '41.68°N < 41.90°N', size: 140, y: 160 });

    // ---- January temperatures
    A.pin({ t0: tYet + 0.8, t1: tMost - 0.1, ll: C.nyc, color: '#5ab8ff' });
    A.pin({ t0: tYet + 0.8, t1: tMost - 0.1, ll: C.rome, color: '#ffd23f' });
    A.card({ t0: at('1') - 0.1, t1: tMost - 0.1, ll: C.nyc, dy: -110, dx: 70, k: 'NYC · January', v: '≈1°C', rot: -3 });
    A.card({ t0: at('8') - 0.1, t1: tMost - 0.1, ll: C.rome, dy: -110, dx: -70, k: 'Rome · January', v: '≈8°C', rot: 3 });
    A.emoji({ t0: at('1') - 0.1, t1: tMost - 0.1, ll: C.nyc, dy: 90, char: '🥶', size: 80 });
    A.headline({ t0: tYet - 0.05, t1: tRome8 - 0.1, text: 'Same latitude…', sub: 'average temperature in January', size: 130, y: 165 });
    A.headline({ t0: tRome8 - 0.05, t1: tMost - 0.15, text: '+7°C', sub: 'Rome is milder, though further north', size: 170, y: 150, color: '#ffd23f', subColor: '#fff' });

    // ---- the Gulf Stream (the usual answer)
    const gulf = [[-80.5, 25.5], [-79.8, 30], [-75.2, 35.2], [-68, 38.5], [-58, 40.5], [-47, 43.5], [-37, 48], [-25, 52], [-14, 56], [-4, 60], [6, 64]];
    const tG1 = at('Stream') + 0.6;
    A.arc({ t0: tMost + 0.1, t1: tWest - 0.2, pts: gulf, color: '#ff8a3d', width: 10, draw: [tMost + 0.2, tG1], fo: 0.6 });
    A.label({ t0: tG1 - 0.2, t1: tBut + 0.3, ll: [-52, 38.5], text: 'Gulf Stream', size: 46, color: '#ff8a3d' });
    A.headline({ t0: tMost - 0.05, t1: tBut - 0.1, text: 'The Gulf Stream?', sub: 'the usual answer', size: 130, y: 165 });
    A.card({ t0: at('2002') - 0.05, t1: tWest - 0.2, xy: [540, 330], k: 'Seager et al. · 2002', v: "It's the wind", rot: -2 });
    A.label({ t0: at('2002') + 0.5, t1: tWest - 0.2, xy: [540, 450], text: '', sub: 'Quarterly Journal of the Royal Meteorological Society', size: 20 });

    // ---- wind streaks (escape hatch): short dashes flowing along great circles
    const streaks = (t0, t1, paths, color, speed = 0.35, width = 5) => A.svg({ t0, t1, fn(t, a, proj) {
      const path = d3.geoPath(proj); let s = '';
      paths.forEach((pp, i) => {
        const it = d3.geoInterpolate(pp[0], pp[1]);
        for (let k = 0; k < 3; k++) {
          const ph = ((t - t0) * speed + k / 3 + i * 0.137) % 1;
          const seg = []; for (let j = 0; j <= 8; j++) seg.push(it(clamp(ph + j * 0.018)));
          const d = path({ type: 'LineString', coordinates: seg });
          if (!d) continue;
          const fade = Math.sin(Math.PI * ph);
          s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${a * fade * 0.9}"/>`;
        }
      });
      return s;
    } });
    const westerlies = [];
    for (let i = 0; i < 7; i++) { const la = 36 + i * 3.4; westerlies.push([[-62, la - 6], [18, la + 4]]); }
    streaks(tWest - 0.1, tNYW - 0.1, westerlies, '#ffffff');
    A.circle({ t0: at('ocean', 1) - 0.1, t1: tNYW - 0.1, center: [-30, 47], radiusKm: 1600, color: '#ff8a3d', width: 3, fill: '#ff8a3d', fillOpacity: 0.2, grow: true, draw: [at('ocean', 1), at('heat') + 0.4] });
    A.label({ t0: at('heat') - 0.1, t1: tNYW - 0.1, ll: [-30, 47], text: 'Summer heat', sub: 'stored in the ocean, released in winter', size: 46, color: '#ffb074' });
    A.label({ t0: at('Europe', 1) - 0.1, t1: tNYW - 0.1, ll: [14, 50], text: 'Europe', size: 50 });
    A.headline({ t0: tWest - 0.05, t1: tNYW - 0.15, text: 'Westerlies', sub: 'mild ocean air, blown into Europe', size: 140, y: 160, color: '#fff' });

    // ---- New York's winter wind
    const nwPaths = [];
    for (let i = 0; i < 6; i++) nwPaths.push([[-112 + i * 3, 62 - i * 1.2], [-78 + i * 2.4, 38 + i * 1.3]]);
    streaks(tNYW - 0.1, tSo - 0.1, nwPaths, '#9fd8ff', 0.35, 5);
    A.pin({ t0: tNYW, t1: tSo - 0.1, ll: C.nyc, color: '#ff3b4e' });
    A.label({ t0: tNYW, t1: tSo - 0.1, ll: C.nyc, dy: 70, text: 'New York', size: 46 });
    A.emoji({ t0: at('frozen'), t1: tSo - 0.1, ll: [-100, 58], char: '❄️', size: 100 });
    A.headline({ t0: tNYW - 0.05, t1: tSo - 0.15, text: 'Frozen air', sub: 'NYC winds blow off the continent', size: 150, y: 160, color: '#9fd8ff', subColor: '#fff' });

    // ---- loop: Rome, downwind
    A.pin({ t0: tSo, t1: A.dur, ll: C.rome, color: '#3ee08f' });
    A.label({ t0: tSo, t1: tEnd, ll: C.rome, dy: 70, text: 'Rome', sub: '41.9°N', size: 50 });
    A.arc({ t0: tSo, t1: tEnd, pts: par(41.903, -60, 40), color: '#3ee08f', width: 4, draw: [tSo, tSo + 1.2], head: false });
    A.headline({ t0: at('south', 2) - 0.1, t1: tDown - 0.1, text: 'Not south', size: 150, y: 160 });
    streaks(tDown - 0.2, tEnd + 0.4, westerlies.slice(1, 5), '#ffffff', 0.35, 4);
    A.headline({ t0: at('downwind') - 0.1, t1: tEnd, text: 'Downwind', sub: 'of a warm ocean', size: 160, y: 150, color: '#3ee08f', subColor: '#fff' });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'further north than you think', line2: 'Rome sits above New York.', y: 760 });
  },
};
