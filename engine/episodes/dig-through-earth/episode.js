// Dig Through Earth: antipodes. Kansas -> southern Indian Ocean; flipped shapes are point reflections
// [lon, lat] -> [lon +- 180, -lat] (rings reversed, because the antipodal map flips orientation).
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp, E } = A;
    // Camera shots. Instead of the global drift, each shot slowly pushes in and pans a little
    // until the next shot starts, so every target lands exactly where it is aimed.
    const shots = [];
    const go = (t, to, dur = 1.4) => shots.push({ t, to, dur });
    const rollShots = () => {
      shots.sort((a, b) => a.t - b.t);
      shots.forEach((sh, i) => {
        cam.move(sh.t, sh.to, sh.dur);
        const hold0 = sh.t + sh.dur, hold1 = i + 1 < shots.length ? shots[i + 1].t : A.dur;
        if (hold1 - hold0 > 0.3) cam.move(hold0, { lon: sh.to.lon + 0.35 * (hold1 - hold0) * Math.min(1, 560 / sh.to.r), r: sh.to.r * (1 + 0.012 * (hold1 - hold0)) }, hold1 - hold0, 'linear', false);
      });
    };
    const anti = ([lon, lat]) => [lon > 0 ? lon - 180 : lon + 180, -lat];
    const flipRing = ring => ring.map(anti).reverse();
    const polysOf = g => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    const flipPolys = polys => ({ type: 'MultiPolygon', coordinates: polys.map(p => p.map(flipRing)) });
    const featPolys = f => f.type === 'FeatureCollection' ? f.features.flatMap(x => polysOf(x.geometry)) : polysOf(f.geometry);

    // ---- geometry
    const usPolys = featPolys(A.feature('United States of America'));
    const inBox = (p, w, s, e, n) => { const [lon, lat] = p[0][0]; return lon > w && lon < e && lat > s && lat < n; };
    const lower48 = usPolys.filter(p => inBox(p, -126, 24, -66, 50));
    const hawaii = usPolys.filter(p => inBox(p, -161, 18, -154, 23));
    const L48 = { type: 'MultiPolygon', coordinates: lower48 };
    const L48f = flipPolys(lower48);
    const chinaF = flipPolys(featPolys(A.feature('China')));
    const spainF = flipPolys(featPolys(A.feature('Spain')).filter(p => p[0][0][0] > -10)); // mainland + Balearics, not Canaries
    const hawaiiF = flipPolys(hawaii);
    const bermudaF = flipPolys(featPolys(A.feature('Bermuda')));
    const ALL = ['Afghanistan', 'Albania', 'Algeria', 'Angola', 'Antarctica', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bangladesh', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herz.', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Central African Rep.', 'Chad', 'Chile', 'China', 'Colombia', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia', "Côte d'Ivoire", 'Dem. Rep. Congo', 'Denmark', 'Djibouti', 'Dominican Rep.', 'Ecuador', 'Egypt', 'El Salvador', 'Eq. Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Falkland Is.', 'Fiji', 'Finland', 'Fr. S. Antarctic Lands', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Greenland', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Lithuania', 'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Mali', 'Mauritania', 'Mexico', 'Moldova', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'N. Cyprus', 'Namibia', 'Nepal', 'Netherlands', 'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'S. Sudan', 'Saudi Arabia', 'Senegal', 'Serbia', 'Sierra Leone', 'Slovakia', 'Slovenia', 'Solomon Is.', 'Somalia', 'Somaliland', 'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States of America', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'W. Sahara', 'Yemen', 'Zambia', 'Zimbabwe', 'eSwatini'];
    const worldF = flipPolys(featPolys(A.feature(ALL)));

    // "through the core" morph: every point slides along its chord through Earth's centre.
    // In an orthographic view a chord is a straight screen line through the globe centre.
    const thru = (polys, tA, tB, color) => A.svg({ t0: tA - 0.2, t1: tB + 0.05, fo: 0, fn(t, a, proj) {
      const s = E.inOut(clamp((t - tA) / (tB - tA)));
      const [cx, cy] = proj.translate(); const k = 1 - 2 * s;
      let d = '';
      for (const poly of polys) for (const ring of poly) {
        d += 'M' + ring.map(u => { const p = proj(u); return `${(cx + k * (p[0] - cx)).toFixed(1)},${(cy + k * (p[1] - cy)).toFixed(1)}`; }).join('L') + 'Z';
      }
      const front = s > 0.5;
      return `<path d="${d}" fill="${color}" fill-opacity="${(front ? 0.5 : 0.22) * a}" stroke="#fff" stroke-width="${front ? 3 : 2}" ${front ? '' : 'stroke-dasharray="6 7"'} stroke-linejoin="round" opacity="${a}"/>`;
    } });

    // ---- places
    const KS = [-98.58, 39.83];            // geographic centre of the lower 48 (Lebanon, Kansas)
    const KA = anti(KS);                   // 39.83 S, 81.42 E
    const AMS = [77.55, -37.83], STP = [77.53, -38.72], KER = [69.3, -48.95];
    const LQ = [-65.59, -22.10], HK = [114.17, 22.30], HKA = anti(HK);
    const PER = [115.86, -31.95], BER = [-64.78, 32.30], BERA = anti(BER);

    // ---- cues
    const tWont = at("won't"), tStart = at('Start'), tDrill = at('drill'), tTun = at('tunnel');
    const tOut = at('come out'), tFlip = at('Flip'), tAlmost = at('Almost'), tOnly = at('only', 1);
    const tChina = at("China's"), tHK = at('Hong'), tSpain = at("Spain's"), tHaw = at("Hawaii's");
    const tBer = at("Bermuda's"), t15 = at('15%'), tRest = at('rest'), tSo = at('So'), tArg = at('start', 2), tEnd = A.sentence(16).t1 + 1.2;

    // ---- camera
    cam.init({ lon: 178, lat: 58, r: 560, cy: 1000 });
    cam.drift(0);
    cam.move(0.1, { lon: -172, lat: 52, r: 590 }, 3.8, 'out', false);
    go(tStart - 0.25, { lon: KS[0], lat: KS[1] - 3, r: 1500 }, 1.3);
    // side ("x-ray") view: Kansas near the upper-left limb, the exit point behind the lower-right limb
    go(tDrill - 0.1, { lon: -22, lat: 6, r: 520, cy: 1010 }, 1.5);
    go(tOut - 0.3, { lon: KA[0], lat: KA[1] + 7, r: 1150 }, 1.6);
    go(tFlip - 0.1, { lon: KA[0] + 6, lat: KA[1] + 10, r: 600 }, 1.3);
    go(tOnly - 0.2, { lon: 74, lat: -43, r: 2100 }, 1.5);
    go(tChina - 0.35, { lon: -64, lat: -36, r: 720 }, 1.5);
    go(tHK - 0.2, { lon: LQ[0] + 0.1, lat: LQ[1] - 0.6, r: 3000 }, 1.5);
    go(tSpain - 0.35, { lon: 173, lat: -41, r: 1700 }, 1.5);
    go(tHaw - 0.3, { lon: 23, lat: -21, r: 1800 }, 1.4);
    go(tBer - 0.3, { lon: 116.5, lat: -31.8, r: 5200 }, 1.4);
    go(t15 - 0.5, { lon: -75, lat: -8, r: 560 }, 1.8);
    go(tRest - 0.2, { lon: -35, lat: 25, r: 560 }, 1.8);
    go(tSo - 0.2, { lon: -64, lat: -30, r: 1100 }, 1.5);
    rollShots();
    cam.move(tEnd, { r: 520, cy: 1060 }, 2.5, 'out', false);

    // ---- hook: USA and China on the same globe
    A.country({ t0: 0.2, t1: tStart - 0.1, key: 'United States of America', fill: '#ff3b4e', fillOpacity: 0.28, stroke: '#ff3b4e', width: 2.5 });
    A.country({ t0: 0.8, t1: tStart - 0.1, key: 'China', fill: '#ffd23f', fillOpacity: 0.3, stroke: '#ffd23f', width: 2.5 });
    A.label({ t0: 0.4, t1: tStart - 0.1, ll: [-100, 44], text: 'USA', size: 54 });
    A.label({ t0: 0.9, t1: tStart - 0.1, ll: [104, 36], text: 'China', size: 54 });
    A.headline({ t0: 0.3, t1: tWont - 0.05, text: 'Dig to China?', sub: 'the playground theory', size: 140, y: 160 });
    A.headline({ t0: tWont, t1: tStart - 0.1, text: 'Nope.', sub: 'not even close', size: 150, y: 160, color: '#ff3b4e', subColor: '#fff', pop: false });
    A.emoji({ t0: tWont, t1: tStart - 0.1, xy: [540, 470], char: '🚫', size: 90, bob: false });

    // ---- Kansas
    A.pin({ t0: tStart + 0.2, t1: tOut, ll: KS, color: '#ff3b4e' });
    A.label({ t0: at('Kansas') - 0.1, t1: tDrill + 0.4, ll: KS, dy: -95, text: 'Kansas', sub: 'centre of the lower 48 · 39.8°N', size: 60 });
    A.emoji({ t0: at('Kansas'), t1: tDrill + 0.5, ll: KS, dx: 70, dy: 40, char: '⛏️', size: 90 });

    // ---- the tunnel: straight screen line through the globe centre
    const tD0 = tDrill + 0.9, tD1 = atEnd('long') + 0.2;
    A.svg({ t0: tDrill + 0.6, t1: tOut + 1.2, fn(t, a, proj) {
      const [cx, cy] = proj.translate(); const r = proj.scale();
      const p0 = proj(KS); const p1 = [2 * cx - p0[0], 2 * cy - p0[1]];
      const s = prog(t, tD0, tD1, 'inOut');
      const hx = lerp(p0[0], p1[0], s), hy = lerp(p0[1], p1[1], s);
      const core = `<circle cx="${cx}" cy="${cy}" r="${r * 0.19}" fill="#ff7a2f" fill-opacity="${0.16 * a}" stroke="#ff9a4f" stroke-width="2" stroke-dasharray="5 7" opacity="${0.8 * a}"/>` +
        `<circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="#ffb46b" stroke-width="1.5" stroke-dasharray="3 9" opacity="${0.5 * a}"/>`;
      if (s <= 0) return core;
      return core + `<line x1="${p0[0]}" y1="${p0[1]}" x2="${hx}" y2="${hy}" stroke="#ffd23f" stroke-width="22" stroke-linecap="round" opacity="${0.22 * a}"/>` +
        `<line x1="${p0[0]}" y1="${p0[1]}" x2="${hx}" y2="${hy}" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" opacity="${a}"/>` +
        (s < 1 ? `<circle cx="${hx}" cy="${hy}" r="12" fill="#fff" opacity="${a}"/>` : '');
    } });
    A.label({ t0: tD0 + 0.9, t1: tOut - 0.1, xy: [540, 1010], dx: 150, dy: 30, text: '', sub: "Earth's core", size: 20 });
    A.headline({ t0: tTun - 0.1, t1: tOut - 0.15, text: '', count: { from: 0, to: 12700, t0: tD0, t1: tD1, prefix: '~', suffix: ' km' }, sub: 'straight down · through the centre', size: 140, y: 160 });

    // ---- exit
    A.pin({ t0: tOut + 0.8, t1: tChina - 0.2, ll: KA, color: '#3ee08f' });
    A.circle({ t0: tOut + 0.8, t1: tFlip + 0.5, center: KA, radiusKm: 300, color: '#5ab8ff', width: 3, grow: true, draw: [tOut + 0.8, tOut + 2.0] });
    A.label({ t0: tOut + 0.9, t1: tFlip - 0.1, ll: KA, dy: -95, text: 'You exit here', sub: '39.8°S · 81.4°E', size: 58 });
    A.headline({ t0: at('southern') - 0.1, t1: tFlip - 0.15, text: 'Indian Ocean', sub: 'open water · far from any continent', size: 130, y: 170, color: '#5ab8ff', subColor: '#fff' });
    A.emoji({ t0: at('Ocean', 1), t1: tFlip - 0.1, ll: KA, dx: 0, dy: 110, char: '🌊', size: 90 });

    // ---- flip the lower 48
    const tF0 = at('other', 1) - 0.1, tF1 = atEnd('planet') + 0.3;
    A.headline({ t0: tFlip - 0.05, t1: tAlmost - 0.1, text: 'Flip the USA', sub: 'every point → its antipode', size: 130, y: 170 });
    thru(lower48, tF0, tF1, '#ff3b4e');
    A.shape({ t0: tF1, t1: tChina - 0.2, fi: 0, geo: L48f, fill: '#ff3b4e', fillOpacity: 0.45, stroke: '#fff', width: 2.5 });
    A.label({ t0: tF1, t1: tOnly - 0.1, ll: [KA[0] + 2, KA[1] + 13], text: 'Upside-down USA', size: 46, color: '#ff8a96' });
    A.label({ t0: tAlmost, t1: tOnly - 0.1, ll: [134, -25], text: 'Australia', size: 44 });
    A.label({ t0: tAlmost, t1: tOnly - 0.1, ll: [46.5, -19.5], text: 'Madagascar', size: 40 });
    A.headline({ t0: tAlmost - 0.05, t1: tOnly - 0.15, text: 'Splash', sub: 'almost all of it: open ocean', size: 140, y: 170, color: '#5ab8ff', subColor: '#fff' });

    // ---- the only land: French Southern Lands
    A.headline({ t0: at('French') - 0.1, t1: tChina - 0.25, text: 'Tiny exceptions', sub: 'French Southern & Antarctic Lands', size: 120, y: 170 });
    A.pin({ t0: at('few'), t1: tChina - 0.2, ll: AMS, color: '#3ee08f', size: 9 });
    A.pin({ t0: at('few') + 0.15, t1: tChina - 0.2, ll: STP, color: '#3ee08f', size: 9 });
    A.pin({ t0: at('tiny'), t1: tChina - 0.2, ll: KER, color: '#3ee08f', size: 9 });
    A.label({ t0: at('few'), t1: tChina - 0.2, ll: AMS, dx: 150, dy: -10, text: 'Amsterdam I.', size: 36 });
    A.label({ t0: at('few') + 0.15, t1: tChina - 0.2, ll: STP, dx: 145, dy: 30, text: 'St-Paul I.', size: 36 });
    A.label({ t0: at('tiny'), t1: tChina - 0.2, ll: KER, dx: 0, dy: 70, text: 'Kerguelen', sub: 'opposite Montana', size: 40 });
    A.flag({ t0: at('French'), t1: tChina - 0.2, xy: [540, 420], code: 'tf', w: 110 });

    // ---- China -> South America
    const tC0 = at('opposite', 1) - 0.1, tC1 = atEnd('America', 2) + 0.25;
    thru(featPolys(A.feature('China')), tC0, tC1, '#ffd23f');
    A.shape({ t0: tC1, t1: tHK + 0.4, fi: 0, geo: chinaF, fill: '#ffd23f', fillOpacity: 0.42, stroke: '#fff', width: 2.5 });
    A.country({ t0: tChina + 0.4, t1: tHK + 0.4, key: ['Argentina', 'Chile'], fill: 'none', stroke: '#3ee08f', width: 3 });
    A.headline({ t0: tChina - 0.05, t1: tHK - 0.15, text: "China's other side", sub: 'Argentina · Chile · the Pacific', size: 120, y: 170 });
    A.label({ t0: tC1, t1: tHK - 0.1, ll: [-72, -44], dx: -20, text: 'Flipped China', size: 44, color: '#ffd23f' });

    // ---- Hong Kong <-> La Quiaca
    A.pin({ t0: tHK + 0.8, t1: tSpain - 0.2, ll: LQ, color: '#3ee08f' });
    A.pin({ t0: at('opposite', 2), t1: tSpain - 0.2, ll: HKA, color: '#ffd23f', size: 9 });
    A.label({ t0: at('La'), t1: tSpain - 0.2, ll: LQ, dy: -95, text: 'La Quiaca', sub: 'Argentina · 22.1°S', size: 60 });
    A.label({ t0: at('opposite', 2), t1: tSpain - 0.2, ll: HKA, dy: 90, dx: -40, text: "Hong Kong's antipode", sub: '22.3°S · 65.8°W', size: 40, color: '#ffd23f' });
    A.headline({ t0: tHK - 0.05, t1: tSpain - 0.2, text: 'Hong Kong ↔ La Quiaca', sub: 'about 30 km apart, through the planet', size: 96, y: 175 });
    A.flag({ t0: tHK, t1: tSpain - 0.2, xy: [430, 420], code: 'hk', w: 100 });
    A.flag({ t0: at('Argentina', 1), t1: tSpain - 0.2, xy: [650, 420], code: 'ar', w: 100 });

    // ---- Spain <-> New Zealand
    A.shape({ t0: at('New') - 0.1, t1: tHaw - 0.1, geo: spainF, fill: '#ffd23f', fillOpacity: 0.45, stroke: '#fff', width: 2.5, glow: '#ffd23f' });
    A.country({ t0: tSpain + 0.3, t1: tHaw - 0.1, key: 'New Zealand', fill: 'none', stroke: '#3ee08f', width: 3 });
    A.headline({ t0: tSpain - 0.05, t1: tHaw - 0.15, text: 'Spain ↔ New Zealand', size: 110, y: 175 });
    A.flag({ t0: tSpain, t1: tHaw - 0.15, xy: [430, 360], code: 'es', w: 100 });
    A.flag({ t0: at('Zealand'), t1: tHaw - 0.15, xy: [650, 360], code: 'nz', w: 100 });
    A.label({ t0: at('New') + 0.2, t1: tHaw - 0.1, ll: [178.5, -38.5], dx: 60, dy: -70, text: 'Flipped Spain', size: 40, color: '#ffd23f' });

    // ---- Hawaii <-> Botswana
    A.country({ t0: tHaw + 0.2, t1: tBer - 0.1, key: 'Botswana', fill: 'none', stroke: '#3ee08f', width: 3 });
    A.shape({ t0: at('Botswana') - 0.1, t1: tBer - 0.1, geo: hawaiiF, fill: '#ffd23f', fillOpacity: 0.6, stroke: '#fff', width: 2.5, glow: '#ffd23f' });
    A.headline({ t0: tHaw - 0.05, t1: tBer - 0.15, text: 'Hawaii ↔ Botswana', size: 110, y: 175 });
    A.flag({ t0: tHaw, t1: tBer - 0.15, xy: [430, 360], code: 'us', w: 100 });
    A.flag({ t0: at('Botswana'), t1: tBer - 0.15, xy: [650, 360], code: 'bw', w: 100 });
    A.label({ t0: at('Botswana') + 0.2, t1: tBer - 0.1, ll: [24.5, -22.3], dy: 110, text: 'Flipped Hawaii', size: 40, color: '#ffd23f' });

    // ---- Bermuda <-> Perth
    A.shape({ t0: at('Perth') - 0.1, t1: t15 - 0.3, geo: bermudaF, fill: '#ffd23f', fillOpacity: 0.7, stroke: '#fff', width: 2.5, glow: '#ffd23f' });
    A.pin({ t0: at('Perth'), t1: t15 - 0.3, ll: PER, color: '#3ee08f' });
    A.label({ t0: at('Perth'), t1: t15 - 0.3, ll: PER, dx: 120, dy: -70, text: 'Perth', size: 58 });
    A.label({ t0: at('Perth') + 0.2, t1: t15 - 0.3, ll: BERA, dx: -40, dy: -110, text: 'Flipped Bermuda', sub: 'in the ocean off Perth', size: 40, color: '#ffd23f' });
    A.headline({ t0: tBer - 0.05, t1: t15 - 0.3, text: 'Bermuda ↔ Perth', size: 110, y: 175 });
    A.flag({ t0: tBer, t1: t15 - 0.3, xy: [430, 360], code: 'bm', w: 100 });
    A.flag({ t0: at('Perth'), t1: t15 - 0.3, xy: [650, 360], code: 'au', w: 100 });

    // ---- the number: flipped world over the real one
    A.shape({ t0: t15 - 0.4, t1: tSo - 0.1, geo: worldF, fill: '#ff3b4e', fillOpacity: 0.34, stroke: '#ff8a96', width: 1.2 });
    A.headline({ t0: t15 - 0.1, t1: tRest - 0.15, text: '', count: { from: 0, to: 15, t0: t15, t1: t15 + 1.3, prefix: '~', suffix: '%' }, sub: 'of land has land on the other side', size: 170, y: 150 });
    A.label({ t0: t15 + 1.0, t1: tRest - 0.15, xy: [540, 420], text: '', sub: 'red = the whole world, flipped', size: 20 });
    A.label({ t0: at('land', 3), t1: tRest - 0.15, ll: [-60, 10], text: 'Flipped Asia', sub: 'lands on South America', size: 40, color: '#ff8a96' });
    A.headline({ t0: tRest - 0.05, t1: tSo - 0.15, text: '85% → ocean', sub: 'flipped Australia lands in the Atlantic', size: 130, y: 165, color: '#5ab8ff', subColor: '#fff' });
    A.label({ t0: tRest + 0.8, t1: tSo - 0.15, ll: [-45, 26], dy: 0, text: 'Flipped Australia', size: 40, color: '#ff8a96' });

    // ---- loop: dig from Argentina
    A.pin({ t0: tSo + 0.8, t1: A.dur, ll: [-64.5, -31], color: '#3ee08f' });
    A.emoji({ t0: at('dig', 2), t1: tEnd, ll: [-64.5, -31], dx: 70, dy: 30, char: '⛏️', size: 90 });
    A.headline({ t0: at('China', 2) - 0.1, t1: tArg - 0.1, text: 'Want China?', size: 140, y: 170 });
    A.headline({ t0: tArg, t1: tEnd, text: 'Start in Argentina', sub: 'the real tunnel to China', size: 120, y: 170, color: '#3ee08f', subColor: '#fff' });
    A.flag({ t0: at('Argentina', 2), t1: tEnd, xy: [540, 420], code: 'ar', w: 110 });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the other side of the world', line2: 'Kansas → Indian Ocean.', y: 760 });
  },
};
