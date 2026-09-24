// The Sea That Vanished: Messinian salinity crisis (5.97-5.33 Ma) and the Zanclean flood (5.33 Ma).
// Drawdown: Aloisi et al. 2024 (Nat. Commun.) ~70% of the water lost. Flood: Garcia-Castellanos et al. 2009 (Nature).
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp } = A;

    // ---------- Mediterranean = rough polygon over the basin (other seas excluded) minus the land
    const ring = [[-5.6, 34.8], [-5.6, 36.2], [-5.0, 37.6], [-1, 39.6], [2, 43.6], [7, 45.4], [12, 46.4], [14, 46.0], [20, 42.6], [23, 41.4],
      [26.1, 40.35], [27.5, 39.5], [30, 37.6], [36.6, 37.2], [36.6, 36.0], [36.2, 32], [34.5, 30.6], [32.1, 30.5], [25, 30.7], [20, 30.1],
      [15, 30.8], [11, 32.5], [10, 33.5], [8, 34.6], [0, 34.9]];
    ring.push(ring[0]);
    const seaPoly = { type: 'Polygon', coordinates: [ring] };
    const land = A.feature(['Spain', 'Portugal', 'France', 'Italy', 'Switzerland', 'Austria', 'Slovenia', 'Croatia', 'Bosnia and Herz.',
      'Montenegro', 'Albania', 'Greece', 'Macedonia', 'Bulgaria', 'Turkey', 'Cyprus', 'N. Cyprus', 'Syria', 'Lebanon', 'Israel', 'Palestine',
      'Jordan', 'Egypt', 'Libya', 'Tunisia', 'Algeria', 'Morocco', 'Malta', 'Serbia', 'Kosovo', 'Hungary', 'Romania', 'San Marino',
      'Vatican', 'Monaco', 'Andorra', 'Saudi Arabia', 'Iraq', 'Georgia', 'Armenia']);
    // one geometry per country, rewound if d3 would read it as its complement, drawn as separate paths
    // (a single combined path lets nonzero winding cancel some countries, e.g. Libya/Egypt)
    const rewind = g => {
      const rev = r => r.slice().reverse();
      if (g.type === 'Polygon') return { type: 'Polygon', coordinates: g.coordinates.map(rev) };
      if (g.type === 'MultiPolygon') return { type: 'MultiPolygon', coordinates: g.coordinates.map(p => p.map(rev)) };
      return g;
    };
    const landGeoms = (land.features || [land]).map(f => f.geometry).map(g => {
      if (g.type === 'MultiPolygon') return g.coordinates.map(c => ({ type: 'Polygon', coordinates: c }));
      return [g];
    }).flat().map(g => (d3.geoArea(g) > 2 * Math.PI ? rewind(g) : g));
    let uidN = 0;
    const seaMask = (proj, id, extra = '') => {
      const P = d3.geoPath(proj);
      const sp = P(seaPoly);
      if (!sp) return null;
      const lp = landGeoms.map(g => P(g)).filter(Boolean).map(d => `<path d="${d}" fill="#000" stroke="#000" stroke-width="2"/>`).join('');
      return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-300" y="-300" width="1680" height="2520"><path d="${sp}" fill="#fff"/>${lp}${extra}</mask></defs>`;
    };
    // a whole-sea fill; col / opacity may be functions of t
    const seaFill = (t0, t1, col, op, o = {}) => A.svg({ t0, t1, fi: o.fi ?? 0.6, fo: o.fo ?? 0.6, fn: (t, a, proj) => {
      const id = 'sm' + (uidN++);
      const d = seaMask(proj, id); if (!d) return '';
      const c = typeof col === 'function' ? col(t) : col, p = typeof op === 'function' ? op(t) : op;
      const sp = d3.geoPath(proj)(seaPoly);
      // coastline: land outlines stroked inside the mask, so only the sea-side half shows -> a crisp shore edge
      const coast = landGeoms.map(g => d3.geoPath(proj)(g)).filter(Boolean).join('');
      return d + `<g mask="url(#${id})"><path d="${sp}" fill="${c}" opacity="${(a * p).toFixed(3)}"/>` +
        (o.salt ? `<path d="${sp}" fill="url(#saltpat)" opacity="${(a * p * 0.6).toFixed(3)}"/>` : '') +
        (o.coast ? `<path d="${coast}" fill="none" stroke="${o.coast}" stroke-width="5" stroke-linejoin="round" opacity="${(a * p).toFixed(3)}"/>` : '') + `</g>`;
    } });
    // salt crust pattern (defined once in its own layer so url(#saltpat) resolves)
    A.svg({ t0: 0, t1: A.dur + 1, fi: 0, fo: 0, fn: () => `<defs><pattern id="saltpat" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><rect width="22" height="22" fill="none"/><circle cx="4" cy="6" r="2.2" fill="#fff"/><circle cx="15" cy="15" r="1.6" fill="#fff"/><path d="M0 20 L9 18" stroke="#fff" stroke-width="1.4"/></pattern></defs>` });

    const GIB = [-5.35, 35.97];
    const tSix = at('6'), tMed = at('Mediterranean'), tDis = at('disappeared'), tGate = at('gateways'), tSpain = at('Spain');
    const tMor = at('Morocco'), tClosed = at('closed'), tRivers = at('Rivers'), tSun = at('sun'), tLost = at('lost');
    const t70 = at('70%'), tWhat = at('What remained'), tSalty = at('salty'), tDead = at('Dead'), tSalt = at('Salt'), t3 = at('3');
    const tStill = at('It\'s still'), tThen = at('Then'), t533 = at('5.33'), tBroke = at('broke'), tGib = at('Gibraltar');
    const tModel = at('One'), t100 = at('100'), t500 = at('500'), tSea = at('Sea level'), t10 = at('10'), t90 = at('90%'), tTwo = at('two');
    const tToday = at('Today'), t14 = at('14'), tFull = at('full'), tEnd = A.sentence(12).t1 + 1.3;

    // ---------- camera (no drift: slow pushes instead, the close-ups are tight)
    const MED = { lon: 18, lat: 37.5, r: 1150 };
    cam.init({ lon: 12, lat: 28, r: 540, cy: 1000 });
    cam.move(0.2, { r: 580 }, 2.0, 'out', false);
    cam.move(tMed - 0.4, { ...MED }, 1.6);
    cam.move(tMed + 1.3, { lon: 17, r: 1220 }, 3.0, 'inOutSine', false);
    cam.move(tGate - 0.3, { lon: -4.3, lat: 36.1, r: 4600 }, 1.6);
    cam.move(tGate + 1.4, { lon: -4.1, lat: 36.1, r: 5000 }, 3.0, 'inOutSine', false);
    cam.move(tRivers - 0.3, { ...MED }, 1.6);
    cam.move(tRivers + 1.4, { lon: 19, r: 1200 }, 4.0, 'inOutSine', false);
    cam.move(tWhat - 0.1, { lon: 18, lat: 36, r: 1300 }, 3.5, 'inOutSine', false);
    cam.move(tSalt - 0.1, { lon: 17, lat: 36.5, r: 1180 }, 5.0, 'inOutSine', false);
    cam.move(tThen - 0.2, { lon: -2.5, lat: 36.5, r: 2600 }, 1.8);
    cam.move(tGib - 0.4, { lon: -4.8, lat: 36.1, r: 3400 }, 1.4, 'inOut', false);
    cam.move(tModel - 0.1, { lon: 5, lat: 37.5, r: 1500 }, 2.4);
    cam.move(t500 - 0.2, { lon: 14, lat: 37, r: 1250 }, 3.0, 'inOutSine', false);
    cam.move(t90 - 0.5, { ...MED, r: 1180 }, 2.5, 'inOutSine', false);
    cam.move(tToday - 0.2, { lon: -5.52, lat: 35.93, r: 24000 }, 2.0);
    cam.move(tToday + 1.8, { r: 30000 }, 3.0, 'inOutSine', false);
    cam.move(tEnd, { lon: 14, lat: 34, r: 620, cy: 1060 }, 2.6, 'inOut', false);

    // ---------- hook: the sea, then a flash of it gone
    seaFill(tMed - 0.2, tGate - 0.3, t => (t < tDis - 0.1 ? '#2d8fe6' : '#f7f1e3'), t => (t < tDis - 0.1 ? 0.45 : 0.8), { salt: false, coast: '#1b4f86' });
    A.label({ t0: tMed + 0.1, t1: tDis - 0.1, ll: [18, 34.2], text: 'Mediterranean Sea', size: 58, color: '#bfe3ff' });
    A.headline({ t0: tSix - 0.1, t1: tDis - 0.15, text: '6 million years ago', sub: 'the Messinian salinity crisis', size: 110, y: 165 });
    A.headline({ t0: tDis - 0.1, t1: tGate - 0.3, text: 'Almost gone', sub: 'most of the sea evaporated', size: 140, y: 160, color: '#efe3c8', subColor: '#ffd23f' });

    // ---------- gateways
    const betic = [[-7.0, 37.1], [-5.6, 37.3], [-4.2, 37.25], [-3.0, 37.35], [-1.8, 37.6]];
    const rif = [[-6.9, 34.6], [-5.6, 34.3], [-4.3, 34.35], [-3.2, 34.9]];
    const gateCol = t => (t < tClosed - 0.1 ? '#5ab8ff' : '#ff3b4e');
    A.svg({ t0: tGate - 0.1, t1: tRivers - 0.2, fn: (t, a, proj) => {
      const P = d3.geoPath(proj); let out = '';
      for (const g of [betic, rif]) {
        const p = prog(t, tGate, tGate + 1.2);
        const n = Math.max(2, Math.round(g.length * 8 * p));
        const coords = A.gc(g, 60).slice(0, Math.round(A.gc(g, 60).length * p) || 2);
        const d = P({ type: 'LineString', coordinates: coords }); if (!d) continue;
        const c = gateCol(t);
        const dash = t < tClosed - 0.1 ? '' : 'stroke-dasharray="14 12"';
        out += `<path d="${d}" fill="none" stroke="${c}" stroke-width="30" stroke-linecap="round" opacity="${0.22 * a}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" ${dash} opacity="${a}"/>`;
      }
      // X marks when closed
      if (t > tClosed - 0.1) {
        const s = E_out(clamp((t - tClosed + 0.1) / 0.35));
        for (const ll of [[-4.3, 37.3], [-4.8, 34.33]]) {
          const [x, y] = proj(ll); const r = 34 * s;
          out += `<path d="M${x - r} ${y - r} L${x + r} ${y + r} M${x + r} ${y - r} L${x - r} ${y + r}" stroke="#ff3b4e" stroke-width="12" stroke-linecap="round" opacity="${a}"/>`;
        }
      }
      return out;
    } });
    const E_out = p => 1 - Math.pow(1 - p, 3);
    A.label({ t0: tGate + 0.4, t1: tRivers - 0.2, ll: [-4.2, 37.25], dy: -80, text: 'Betic gateway', sub: 'through southern Spain', size: 44 });
    A.label({ t0: tGate + 0.4, t1: tRivers - 0.2, ll: [-4.8, 34.33], dy: 80, text: 'Rifian gateway', sub: 'through northern Morocco', size: 44 });
    A.flag({ t0: tSpain - 0.1, t1: tRivers - 0.2, ll: [-4.2, 37.25], dx: -215, dy: -80, code: 'es', w: 80 });
    A.flag({ t0: tMor - 0.1, t1: tRivers - 0.2, ll: [-4.8, 34.33], dx: -215, dy: 80, code: 'ma', w: 80 });
    A.label({ t0: tGate + 0.2, t1: tRivers - 0.2, ll: [-8.6, 36.0], text: 'Atlantic', size: 46, color: '#9fd6ff' });
    A.headline({ t0: tGate - 0.1, t1: tClosed - 0.15, text: 'The gateways', sub: 'Atlantic ↔ Mediterranean', size: 130, y: 160 });
    A.headline({ t0: tClosed - 0.1, t1: tRivers - 0.25, text: 'Sealed off', sub: 'no more Atlantic top-ups', size: 140, y: 160, color: '#ff3b4e', subColor: '#fff' });

    // ---------- evaporation
    seaFill(tRivers - 0.2, tToday + 0.4, t => {
      // blue sea draining to salt, then masked flood takes over later
      return '#f7f1e3';
    }, t => 0.86 * prog(t, tLost - 0.2, t70 + 1.2), { salt: true, fo: 0.8, coast: '#1b4f86' });
    seaFill(tRivers - 0.2, t70 + 1.4, '#2d8fe6', t => 0.42 * (1 - prog(t, tLost - 0.2, t70 + 1.2)), { fo: 0.3 });
    A.emoji({ t0: tSun - 0.2, t1: tLost + 0.2, xy: [540, 470], char: '☀️', size: 120 });
    const rivers = [
      [[31.1, 29.2], [31.2, 30.2], [31.0, 31.4]],        // Nile
      [[4.8, 45.2], [4.75, 44.2], [4.6, 43.4]],           // Rhône
      [[9.0, 45.1], [11.0, 45.0], [12.4, 44.95]],         // Po
      [[-0.9, 41.7], [0.3, 41.1], [0.85, 40.7]],          // Ebro
    ];
    rivers.forEach(r => A.arc({ t0: tRivers - 0.05, t1: tLost + 0.2, pts: r, color: '#5ab8ff', width: 6, draw: [tRivers, tRivers + 0.9] }));
    A.label({ t0: tRivers + 0.2, t1: tLost + 0.2, ll: [31.1, 29.2], dy: 40, text: 'Nile', size: 36, color: '#9fd6ff' });
    A.label({ t0: tRivers + 0.2, t1: tLost + 0.2, ll: [4.8, 45.2], dy: -34, text: 'Rhône', size: 36, color: '#9fd6ff' });
    A.headline({ t0: tRivers - 0.1, t1: tLost - 0.15, text: 'Sun > Rivers', sub: 'evaporation wins', size: 140, y: 160, color: '#ffd23f', subColor: '#fff' });
    A.headline({ t0: tLost - 0.1, t1: tWhat - 0.15, text: '', count: { from: 0, to: 70, t0: t70 - 0.1, t1: t70 + 1.1, prefix: '−', suffix: '%' }, sub: 'of its water · one estimate', size: 170, y: 150 });

    // ---------- hypersaline lakes
    const lakes = [[[18.4, 35.3], 250], [[27.4, 33.4], 210], [[12.6, 39.8], 130], [[5.6, 39.4], 200], [[32.8, 33.5], 110]];
    lakes.forEach(([c, km], i) => A.circle({ t0: tWhat + 0.1 + i * 0.15, t1: tSalt + 1.5, fo: 0.8, center: c, radiusKm: km, color: '#6fe3d6', width: 3, fill: '#35c2b5', fillOpacity: 0.7, draw: [tWhat + 0.1 + i * 0.15, at('shrinking') + 1.4], grow: true }));
    A.label({ t0: tSalty - 0.1, t1: tSalt - 0.2, ll: [18.6, 35.4], dy: 125, text: 'Salty lakes', sub: 'illustrative', size: 46, color: '#bff5ee' });
    A.headline({ t0: tWhat - 0.1, t1: tSalt - 0.2, text: 'Giant Dead Seas', sub: 'brine pools on a salt floor', size: 130, y: 165, color: '#6fe3d6', subColor: '#fff' });
    A.emoji({ t0: tDead - 0.05, t1: tSalt - 0.2, xy: [540, 440], char: '🧂', size: 100 });

    // ---------- salt
    A.bars({ t0: tSalt - 0.1, t1: tStill - 0.1, y: 140, grow: [t3 - 0.2, t3 + 1.1], rows: [
      { label: 'Salt layers, in places', value: 3000, max: 3000, color: '#efe3c8', suffix: ' m' },
      { label: 'Burj Khalifa', value: 828, max: 3000, color: '#5ab8ff', suffix: ' m' },
    ] });
    A.label({ t0: tSalt + 0.2, t1: tThen - 0.1, ll: [18, 34], text: 'Salt floor', sub: 'nearly 1 million km³ of salt', size: 52, color: '#fff7e4' });
    A.headline({ t0: tStill - 0.1, t1: tThen - 0.15, text: 'Still down there', sub: 'buried under today\'s seabed', size: 125, y: 165 });

    // ---------- the flood
    const R = t => {       // flood front radius (deg of arc from Gibraltar)
      const k = [[tBroke, 0], [tModel, 4], [t100, 9], [t500, 14], [t10, 22], [t90, 31], [tTwo + 0.4, 44]];
      if (t <= k[0][0]) return 0;
      for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
      return 44;
    };
    A.svg({ t0: tBroke - 0.1, t1: tToday + 0.4, fi: 0.2, fo: 0.8, fn: (t, a, proj) => {
      const r = R(t); if (r <= 0.05) return '';
      const id = 'fm' + (uidN++);
      const d = seaMask(proj, id); if (!d) return '';
      const P = d3.geoPath(proj);
      const circ = d3.geoCircle().center(GIB).radius(r).precision(0.4)();
      const cp = P(circ); if (!cp) return '';
      const sp = P(seaPoly);
      const cid = 'fc' + id;
      return d + `<defs><clipPath id="${cid}"><path d="${cp}"/></clipPath></defs><g mask="url(#${id})"><g clip-path="url(#${cid})">` +
        `<path d="${sp}" fill="#1f7fd8" opacity="${0.8 * a}"/>` +
        `<path d="${cp}" fill="none" stroke="#bfe6ff" stroke-width="16" opacity="${0.55 * a}"/><path d="${cp}" fill="none" stroke="#ffffff" stroke-width="4" opacity="${0.9 * a}"/></g></g>`;
    } });
    // the inflow jet through the strait
    A.arc({ t0: tBroke - 0.1, t1: t500, pts: [[-9.5, 36.1], [-5.6, 35.97], [-2.5, 36.1]], color: '#5ab8ff', width: 12, draw: [tBroke - 0.1, tBroke + 0.9] });
    A.pin({ t0: tGib - 0.1, t1: tModel + 0.4, ll: GIB, color: '#ff3b4e' });
    A.label({ t0: tGib - 0.1, t1: tModel + 0.3, ll: GIB, dy: -100, text: 'Gibraltar', sub: 'the breach', size: 56 });
    A.headline({ t0: t533 - 0.1, t1: tModel - 0.15, text: '5.33 million years ago', sub: 'the Atlantic breaks back in', size: 104, y: 170, color: '#5ab8ff', subColor: '#fff' });
    A.headline({ t0: tModel - 0.1, t1: t500 - 0.15, text: '', count: { from: 0, to: 100, t0: t100 - 0.1, t1: t100 + 1.2, suffix: ' million m³/s' }, sub: 'peak flow · the zanclean flood · one model', size: 100, y: 170, color: '#5ab8ff', subColor: '#fff' });
    A.bars({ t0: t500 - 0.1, t1: tSea - 0.15, y: 140, grow: [t500, t500 + 1.3], rows: [
      { label: 'Zanclean flood (peak)', value: 100, max: 100, color: '#5ab8ff', suffix: 'M m³/s' },
      { label: 'Amazon River', value: 0.21, max: 100, color: '#3ee08f', suffix: 'M m³/s', dec: 2 },
    ] });
    A.label({ t0: t500 + 0.8, t1: tSea - 0.15, xy: [540, 420], text: '≈ 500 Amazons', size: 64, color: '#ffd23f' });
    A.headline({ t0: tSea - 0.1, t1: t90 - 0.15, text: '', count: { from: 0, to: 10, t0: t10 - 0.2, t1: t10 + 0.9, prefix: '+', suffix: ' m a day' }, sub: 'sea level rise · possibly more', size: 140, y: 160 });
    A.emoji({ t0: t10 - 0.1, t1: t90 - 0.15, xy: [540, 440], char: '🌊', size: 100 });
    A.headline({ t0: t90 - 0.1, t1: tToday - 0.2, text: '', count: { from: 0, to: 90, t0: t90 - 0.05, t1: t90 + 1.0, suffix: '%' }, sub: 'refilled in under 2 years · one model', size: 170, y: 150, color: '#5ab8ff', subColor: '#fff' });
    A.card({ t0: tTwo - 0.1, t1: tToday - 0.2, xy: [540, 470], k: 'the refill may have taken', v: 'months', rot: -2 });

    // ---------- today
    const oliv = [-5.589, 36.004], cires = [-5.482, 35.913];
    A.arc({ t0: t14 - 0.2, t1: tEnd + 0.2, pts: [oliv, cires], color: '#ffd23f', width: 10, head: false, draw: [t14 - 0.2, t14 + 0.7] });
    A.pin({ t0: t14 - 0.2, t1: tEnd + 0.2, ll: oliv, color: '#ffd23f', size: 8, pulse: false });
    A.pin({ t0: t14 + 0.4, t1: tEnd + 0.2, ll: cires, color: '#ffd23f', size: 8, pulse: false });
    A.label({ t0: t14 + 0.2, t1: tEnd + 0.2, ll: [-5.536, 35.958], dx: 100, dy: 40, text: '14 km', size: 64, color: '#ffd23f' });
    A.label({ t0: tToday + 0.3, t1: tEnd + 0.2, ll: [-5.62, 36.3], text: 'Spain', size: 44 });
    A.label({ t0: tToday + 0.3, t1: tEnd + 0.2, ll: [-5.5, 35.6], text: 'Morocco', size: 44 });
    A.label({ t0: tToday + 0.6, t1: tEnd + 0.2, ll: [-6.2, 35.95], text: 'Atlantic', size: 36, color: '#9fd6ff' });
    A.label({ t0: tToday + 0.6, t1: tEnd + 0.2, ll: [-4.95, 36.05], text: 'Mediterranean', size: 36, color: '#9fd6ff' });
    A.headline({ t0: tToday - 0.1, t1: tEnd, text: 'Strait of Gibraltar', sub: 'the only link to the ocean', size: 110, y: 165 });
    A.headline({ t0: at('keeps') - 0.1, t1: tEnd, text: '', sub: 'close it, and the sea shrinks again', size: 40, y: 420, subColor: '#ffd23f', pop: false });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the sea that vanished', line2: 'Refilled through a 14 km gap.', y: 760 });
  },
};
