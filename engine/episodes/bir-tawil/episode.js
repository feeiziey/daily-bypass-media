// Bir Tawil: ~2,060 km2 between Egypt and Sudan that neither claims.
// 1899 "political" line = 22nd parallel (Egypt's claim). 1902 "administrative" line (Sudan's claim) dips south
// around Bir Tawil and bulges north around the Halaib Triangle (~20,580 km2, Red Sea coast).
// Outlines: Natural Earth 10m admin_0_disputed_areas (Bir Tawil, Halayib Triangle), Wadi Halfa salient from
// Natural Earth countries-10m. Drawn as approximate.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp, E } = A;
    const RED = '#ff3b4e', BLUE = '#5ab8ff', GREEN = '#3ee08f', YEL = '#ffd23f', HAL = '#ff8f6b';
    const cw = ring => { const g = { type: 'Polygon', coordinates: [ring] }; return d3.geoArea(g) > 2 * Math.PI ? { type: 'Polygon', coordinates: [ring.slice().reverse()] } : g; };

    const BT_RING = [[33.1811, 21.9954], [33.3924, 21.9955], [33.6251, 21.9955], [33.8577, 21.9955], [34.0761, 21.9955], [34.0842, 21.9955], [33.9991, 21.7674], [33.8665, 21.7497], [33.7173, 21.7309], [33.5584, 21.711], [33.4396, 21.8006], [33.3037, 21.903], [33.1811, 21.9954]];
    const HAL_NW = [[34.0842, 21.9955], [34.1475, 22.1919], [34.3211, 22.2263], [34.5017, 22.2621], [34.6821, 22.2979], [34.7776, 22.4998], [34.8282, 22.6069], [34.862, 22.6802], [34.9437, 22.8579], [35.2121, 22.7863], [35.3458, 22.9016], [35.4867, 23.0233], [35.6211, 23.1393]];
    const HAL_COAST = [[35.6352, 23.1109], [35.6546, 23.0738], [35.6678, 22.9826], [35.6953, 22.9321], [35.7637, 22.8704], [35.7234, 22.9319], [35.7644, 22.9077], [35.7819, 22.8411], [35.8296, 22.7848], [35.886, 22.7357], [35.9558, 22.7045], [36.0401, 22.6902], [36.1206, 22.6757], [36.1978, 22.6517], [36.2747, 22.5924], [36.2964, 22.522], [36.3432, 22.4671], [36.4048, 22.4329], [36.4281, 22.426], [36.4398, 22.3564], [36.5406, 22.3104], [36.6233, 22.2496], [36.7137, 22.1691], [36.7476, 22.161], [36.7822, 22.1645], [36.8094, 22.1208], [36.8719, 22.0741], [36.8954, 22.0661], [36.8984, 22.0175], [36.8836, 21.9957]];
    const HAL_S = []; for (let x = 36.65; x > 34.1; x -= 0.25) HAL_S.push([+x.toFixed(3), 21.9956]);
    const HAL_RING = [...HAL_NW, ...HAL_COAST, ...HAL_S, [34.0842, 21.9955]];
    const BT = cw(BT_RING), HALAIB = cw(HAL_RING);
    const BTC = [33.72, 21.87], HALC = [35.4, 22.45];

    const L1899 = []; for (let x = 29.5; x <= 36.88; x += 0.25) L1899.push([x, 22]); L1899.push([36.884, 22]);
    const SALIENT = [[31.25, 22], [31.261, 22.001], [31.311, 22.096], [31.358, 22.188], [31.387, 22.214], [31.423, 22.227], [31.463, 22.215], [31.491, 22.173], [31.466, 22.084], [31.434, 22.0]];
    const BT_SOUTH = [[33.1811, 22], [33.3037, 21.903], [33.4396, 21.8006], [33.5584, 21.711], [33.7173, 21.7309], [33.8665, 21.7497], [33.9991, 21.7674], [34.0842, 22]];
    const L1902 = [[29.5, 22], [30.4, 22], [31.25, 22], ...SALIENT.slice(1), [32.0, 22], [32.6, 22], ...BT_SOUTH, ...HAL_NW.slice(1)];

    // Mauritius main island, for a true-size comparison
    const mu = A.feature('Mauritius');
    const muPolys = mu.geometry.type === 'MultiPolygon' ? mu.geometry.coordinates : [mu.geometry.coordinates];
    const muMain = muPolys.map(c => ({ type: 'Polygon', coordinates: c })).sort((a, b) => d3.geoArea(b) - d3.geoArea(a))[0];
    const MUC = d3.geoCentroid(muMain);

    // ---- cues
    const tMau = at('Mauritius'), tNo = at('no'), tCalled = at('called'), tEgypt1 = at('Egypt', 1);
    const t1899 = at('1899'), t22 = at('22nd'), t1902 = at('1902'), tTribes = at('tribes');
    const tDipped = at('dipped'), tBulged = at('bulged');
    const tEgClaim = at('Egypt claims'), tTri = at('coastal'), tHal1 = at('Halaib', 1);
    const tSdClaim = at('Sudan claims'), tHal2 = at('Halaib', 2);
    const tCatch = at('Heres'), tEgLine = at('Egypts'), tSdLine = at('Sudans');
    const tClaim = at('Claim'), tLose = at('lose');
    const tNum = at('Bir Tawil is'), t2060 = at('2,060'), tRock = at('rock');
    const tTen = at('Halaib is'), tTimes = at('ten'), tCoast = at('Red');
    const tSo = at('So'), tBelongs = at('belongs');
    const tEnd = A.sentence(12).t1 + 1.2;

    // ---- camera
    const REG = { lon: 34.6, lat: 22.15, r: 10500 };
    cam.init({ lon: 44, lat: 2, r: 540, cy: 1000 });
    cam.move(0.2, { lon: 46, lat: 0, r: 580 }, 2.4, 'out', false);
    cam.move(tNo - 0.3, { lon: BTC[0], lat: BTC[1] - 0.45, r: 19000 }, 2.2);
    cam.move(tEgypt1 - 0.4, { lon: 31.5, lat: 21.5, r: 2600 }, 1.5);
    cam.move(t1899 - 0.2, REG, 1.5);
    cam.move(tDipped - 0.2, { lon: BTC[0], lat: BTC[1] - 0.12, r: 28000 }, 1.3);
    cam.move(tBulged - 0.1, { lon: 35.3, lat: 22.3, r: 12500 }, 1.3);
    cam.move(tEgClaim - 0.2, REG, 1.3);
    cam.move(tCatch - 0.2, { lon: BTC[0], lat: BTC[1] - 0.12, r: 28000 }, 1.2);
    cam.move(tClaim - 0.2, REG, 1.3);
    cam.move(tNum - 0.2, { lon: BTC[0], lat: BTC[1] - 0.12, r: 26000 }, 1.2);
    cam.move(tTen - 0.2, { lon: 34.9, lat: 22.1, r: 10000 }, 1.3);
    cam.move(tSo - 0.2, { lon: BTC[0], lat: BTC[1] - 0.15, r: 20000 }, 1.3);
    cam.move(tEnd, { lon: 38, lat: 10, r: 560, cy: 1060 }, 2.6, 'out', false);

    // ---- hook: Mauritius, then the desert
    A.pin({ t0: tMau - 0.1, t1: tNo + 0.6, ll: MUC, color: RED, size: 9 });
    A.label({ t0: tMau - 0.1, t1: tNo + 0.5, ll: MUC, dy: -70, text: 'Mauritius', size: 44 });
    A.pin({ t0: tMau + 0.2, t1: tNo + 0.6, ll: BTC, color: YEL, size: 9 });
    A.label({ t0: tMau + 0.2, t1: tNo + 0.5, ll: BTC, dy: -70, text: 'Bir Tawil', size: 44, color: YEL });
    A.headline({ t0: 0.25, t1: tCalled - 0.15, text: 'Nobody wants it', sub: 'a desert the size of Mauritius', size: 130, y: 160 });
    A.shape({ t0: tNo + 0.2, t1: tEgypt1 + 0.2, geo: muMain, fill: RED, fillOpacity: 0.45, stroke: '#fff', width: 3, moveFrom: MUC, moveTo: [33.66, 21.2], moveT: [tNo + 0.1, tNo + 1.9] });
    A.label({ t0: tNo + 1.6, t1: tEgypt1 + 0.1, ll: [33.66, 21.2], dy: 95, text: 'Mauritius', sub: 'main island · true size', size: 44 });
    A.shape({ t0: tNo + 0.6, t1: t1899, geo: BT, fill: YEL, fillOpacity: 0.4, stroke: YEL, width: 4, glow: YEL });
    A.label({ t0: tNo + 1.6, t1: tEgypt1 + 0.1, ll: BTC, dy: -100, text: 'Bir Tawil', sub: 'about 2,060 km²', size: 52, color: YEL });

    // ---- Egypt / Sudan
    A.country({ t0: tCalled, t1: t1899 + 0.4, key: 'Egypt', fill: BLUE, fillOpacity: 0.14, stroke: BLUE, width: 2.5 });
    A.country({ t0: tCalled, t1: t1899 + 0.4, key: 'Sudan', fill: GREEN, fillOpacity: 0.14, stroke: GREEN, width: 2.5 });
    A.label({ t0: tEgypt1 - 0.1, t1: t1899 + 0.2, ll: [29.5, 26.2], text: 'Egypt', size: 76, color: BLUE });
    A.label({ t0: at('Sudan', 1) - 0.1, t1: t1899 + 0.2, ll: [30.5, 16.8], text: 'Sudan', size: 76, color: GREEN });
    A.label({ t0: tCalled + 0.5, t1: t1899 + 0.2, ll: [36.6, 21.5], text: 'Red Sea', size: 40, color: BLUE });
    A.headline({ t0: tCalled - 0.05, t1: t1899 - 0.15, text: 'Bir Tawil', sub: '21.9°N · 33.7°E · Egypt / Sudan', size: 140, y: 160, color: YEL, subColor: '#fff' });

    // ---- the two lines (persist)
    A.arc({ t0: t1899, t1: tEnd, pts: L1899, color: BLUE, width: 8, draw: [t1899 + 0.2, t22 + 0.9], n: 60 });
    A.arc({ t0: t1902, t1: tEnd, pts: L1902, color: GREEN, width: 8, dash: '18 12', draw: [t1902 + 0.3, tTribes + 1.0], n: 200 });
    A.label({ t0: t22 - 0.1, t1: t1902 + 0.2, ll: [30.3, 22], dy: -48, text: '22°N', sub: '1899 line', size: 48, color: BLUE });
    A.headline({ t0: t1899 - 0.05, t1: t1902 - 0.15, text: '1899', sub: 'the border = the 22nd parallel', size: 150, y: 150, color: BLUE, subColor: '#fff' });
    A.headline({ t0: t1902 - 0.05, t1: tDipped - 0.15, text: '1902', sub: 'a second line · following tribal land', size: 150, y: 150, color: GREEN, subColor: '#fff' });
    A.label({ t0: tTribes - 0.2, t1: tDipped, ll: [34.9, 22.95], dx: -60, dy: -70, text: '1902 line', sub: 'administrative', size: 44, color: GREEN });
    A.html({ t0: t1899, t1: tEnd - 0.3, fn: (t, a) => `<div class="label" style="left:540px;top:1395px;font-family:'Space Mono';font-size:17px;letter-spacing:4px;opacity:${0.7 * a}">OUTLINES APPROXIMATE · NATURAL EARTH</div>` });

    // ---- the areas
    const hlFill = t => {
      if (t < tEgClaim) return [HAL, 0.35];
      if (t < tSdClaim) return [BLUE, 0.5];
      if (t < tCatch) return [GREEN, 0.5];
      if (t < tLose) return [HAL, 0.3];
      if (t < tTen) return ['#888', 0.2];
      return [HAL, 0.5];
    };
    const btFill = t => {
      if (t < tEgLine) return [YEL, 0.35];
      if (t < tSdLine) return [GREEN, 0.55];
      if (t < tClaim) return [BLUE, 0.55];
      return [YEL, 0.4];
    };
    A.svg({ t0: tDipped - 0.1, t1: tEnd, fn: (t, a, proj) => {
      const p = d3.geoPath(proj); let out = '';
      const [hc, ho] = hlFill(t), [bc, bo] = btFill(t);
      const ha = prog(t, tBulged, tBulged + 0.6), ba = prog(t, tDipped, tDipped + 0.6);
      const pulse = (t > tNum && t < tTen) ? 0.75 + 0.25 * Math.sin(t * 6) : 1;
      if (ha > 0) out += `<path d="${p(HALAIB)}" fill="${hc}" fill-opacity="${ho * ha * a}" stroke="${HAL}" stroke-width="3" opacity="${a * ha}" stroke-linejoin="round"/>`;
      out += `<path d="${p(BT)}" fill="${bc}" fill-opacity="${bo * ba * a * pulse}" stroke="${YEL}" stroke-width="4" opacity="${a * ba}" stroke-linejoin="round"/>`;
      return out;
    } });
    A.label({ t0: tDipped + 0.2, t1: tBulged, ll: BTC, dy: -110, text: 'Bir Tawil', size: 54, color: YEL });
    A.label({ t0: tBulged + 0.2, t1: tEgClaim - 0.1, ll: HALC, text: 'Halaib', sub: 'triangle', size: 58, color: '#fff' });
    A.label({ t0: tBulged + 0.2, t1: tEgClaim - 0.1, ll: [36.9, 22.9], text: 'Red Sea', size: 40, color: BLUE });

    // ---- the claims
    const claimHead = (t0, t1, code, text, sub, color) => {
      A.headline({ t0, t1, text, sub, size: 118, y: 165, color, subColor: '#fff' });
      A.flag({ t0: t0 + 0.1, t1, xy: [540, 110], code, w: 84 });
    };
    claimHead(tEgClaim - 0.05, tSdClaim - 0.15, 'eg', 'Egypt: the 1899 line', 'Halaib → Egypt', BLUE);
    claimHead(tSdClaim - 0.05, tCatch - 0.15, 'sd', 'Sudan: the 1902 line', 'Halaib → Sudan', GREEN);
    A.label({ t0: tTri, t1: tCatch - 0.1, ll: HALC, text: 'Halaib', sub: 'claimed by both', size: 58 });
    A.label({ t0: tEgClaim + 0.3, t1: tCatch - 0.1, ll: BTC, dy: 90, text: 'Bir Tawil', size: 40, color: YEL });
    A.headline({ t0: tCatch - 0.05, t1: tEgLine - 0.15, text: 'The catch', size: 150, y: 160 });
    claimHead(tEgLine - 0.05, tSdLine - 0.15, 'eg', "Egypt's line", 'Bir Tawil → Sudan', BLUE);
    claimHead(tSdLine - 0.05, tClaim - 0.15, 'sd', "Sudan's line", 'Bir Tawil → Egypt', GREEN);
    A.label({ t0: tEgLine + 0.3, t1: tSdLine - 0.1, ll: BTC, dy: 0, text: 'Sudan?', size: 70, color: '#fff' });
    A.label({ t0: tSdLine + 0.3, t1: tClaim - 0.1, ll: BTC, dy: 0, text: 'Egypt?', size: 70, color: '#fff' });
    A.headline({ t0: tClaim - 0.05, t1: tNum - 0.15, text: 'Claim it, lose Halaib', sub: 'accepting one line = accepting its result', size: 104, y: 170, color: '#fff' });
    A.emoji({ t0: tLose - 0.05, t1: tNum - 0.1, ll: HALC, char: '❌', size: 110, bob: false });
    A.sfx(tLose, 'pop', 0.6);

    // ---- the numbers
    A.headline({ t0: tNum - 0.05, t1: tTen - 0.15, text: '', count: { from: 0, to: 2060, t0: t2060, t1: atEnd('kilometers') + 0.3, suffix: ' km²' }, sub: 'Bir Tawil · rock and sand', size: 150, y: 150, color: YEL, subColor: '#fff' });
    A.emoji({ t0: tRock - 0.1, t1: tTen - 0.1, ll: BTC, dy: -150, char: '🪨', size: 90 });
    A.bars({ t0: tTen - 0.05, t1: tSo - 0.15, y: 150, grow: [tTimes - 0.2, tTimes + 1.2], rows: [
      { label: 'Bir Tawil', value: 2060, max: 20580, color: YEL, suffix: ' km²' },
      { label: 'Halaib Triangle', value: 20580, max: 20580, color: HAL, suffix: ' km²' },
    ] });
    A.label({ t0: tTimes, t1: tSo - 0.1, ll: HALC, text: '10×', sub: 'Halaib', size: 90, color: HAL });
    A.arc({ t0: tCoast - 0.1, t1: tSo, pts: [...HAL_COAST, [36.8836, 21.9957]].slice().reverse().concat([]), color: BLUE, width: 8, draw: [tCoast, tCoast + 1.0], n: 80 });
    A.label({ t0: tCoast - 0.1, t1: tSo - 0.1, ll: [37.1, 22.9], text: 'Red Sea coast', size: 44, color: BLUE });

    // ---- the twist
    A.headline({ t0: tSo - 0.05, t1: tBelongs - 0.15, text: 'Terra nullius', sub: 'no government claims it', size: 140, y: 160, color: YEL, subColor: '#fff' });
    A.headline({ t0: tBelongs - 0.05, t1: tEnd - 0.1, text: '“It’s yours.”', sub: 'Egypt ⇄ Sudan', size: 140, y: 160 });
    A.html({ t0: tBelongs - 0.05, t1: tEnd - 0.1, fn: (t, a) => {
      const sc = E.outBack(clamp((t - tBelongs + 0.05) / 0.45));
      const f = (code, x) => `<img src="flags/${code}.svg" style="position:absolute;left:${x}px;top:470px;width:150px;height:112px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.7);transform:translate(-50%,-50%) scale(${sc})">`;
      const arr = (x, dir) => `<div style="position:absolute;left:${x}px;top:470px;transform:translate(-50%,-50%) scale(${sc}) ${dir < 0 ? 'scaleX(-1)' : ''};font-family:Anton;font-size:90px;color:${YEL};text-shadow:0 3px 12px #000">➜</div>`;
      return `<div style="position:absolute;left:0;top:0;width:1080px;opacity:${a}">${f('eg', 260)}${arr(430, 1)}${arr(650, -1)}${f('sd', 820)}<div style="position:absolute;left:540px;top:470px;transform:translate(-50%,-50%);font-family:'Space Mono';font-size:22px;letter-spacing:4px;color:#fff;text-shadow:0 2px 8px #000"></div></div>`;
    } });
    A.dim(tCalled, tEnd + 0.2, 0.2);
    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the land nobody wants', line2: '2,060 km². Claimed by no one.', y: 760 });
  },
};
