// Pheasant Island (Île des Faisans / Isla de los Faisanes): a France-Spain condominium in the Bidasoa.
// Spain administers 1 Feb - 31 Jul, France 1 Aug - 31 Jan. 6,820 m2. The island is ~200 m long, far below
// what the 8k/21600 textures resolve, so the close-up is an honest schematic panel (labelled as such).
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp, E } = A;
    const ISL = [-1.7654, 43.3426];
    const RED = '#ff3b4e', BLUE = '#5ab8ff', GREEN = '#3ee08f', YEL = '#ffd23f';

    const tRiver = at('sits'), tFrance = at('France', 1), tSpain = at('Spain', 1);
    const t1659 = at('1659'), tPrincess = at('A'), tCrossed = at('crossed'), tShared = at('shared');
    const t1856 = at('1856'), tTurns = at('turns'), tSpainM = at('Spain', 2), tFeb = at('February'), tFranceM = at('France', 2), tAug = at('August');
    const tHand = at('each'), tNaval = at('naval'), tSwap = at('swap'), tRest = at('rest'), tClosed = at('closed');
    const tArea = at('total'), t6820 = at('6,820'), tPitch = at('Smaller'), tSmallest = at('smallest'), tWait = at('Wait');
    const tEnd = A.sentence(13).t1 + 1.2;
    const tSchemIn = t1659 - 0.2, tSchemOut = tWait - 0.5;

    // ---- camera
    cam.init({ lon: 4, lat: 34, r: 560, cy: 1000 });
    cam.move(0.2, { lon: 0, lat: 38, r: 640 }, 3.2, 'out', false);
    cam.move(at('this') - 0.1, { lon: ISL[0], lat: ISL[1] - 1.5, r: 1500 }, 2.0);
    cam.move(tRiver - 0.1, { lon: ISL[0] + 0.2, lat: ISL[1] - 0.25, r: 9000 }, 1.8);
    cam.move(tFrance - 0.2, { lon: ISL[0] + 0.05, lat: ISL[1] - 0.1, r: 14000 }, 1.6, 'inOut', false);
    cam.move(tSchemIn, { lon: ISL[0], lat: ISL[1], r: 40000 }, 1.4, 'in');
    cam.follow(tSchemIn + 1.4, tSchemOut, t => ({ lon: ISL[0] + (t - tSchemIn) * 0.0015, lat: ISL[1], r: 40000 }), 0.6);
    cam.move(tSchemOut, { lon: ISL[0] + 3, lat: ISL[1] - 6, r: 900 }, 2.0, 'out');
    cam.move(tEnd, { r: 560, lon: 6, lat: 34, cy: 1060 }, 2.6, 'out', false);

    // ---- hook: the island on the globe, flags flipping
    A.pin({ t0: 1.5, t1: tSchemIn + 0.4, ll: ISL, color: RED });
    A.headline({ t0: 0.25, t1: tRiver - 0.15, text: 'Every 6 months', sub: 'this island changes country', size: 130, y: 160 });
    const flipper = (t0, t1, xy, w = 150, period = 0.8) => A.html({ t0, t1, fn: (t, a) => {
      const k = (t - t0) / period, i = Math.floor(k), f = k - i;
      const sx = Math.abs(Math.cos(Math.PI * clamp((f - 0.75) / 0.25) / 1)) ; // flip during the last quarter
      const code = (i + (f > 0.875 ? 1 : 0)) % 2 ? 'fr' : 'es';
      const sc = E.outBack(clamp((t - t0) / 0.45));
      return `<img class="flag" src="flags/${code}.svg" style="left:${xy[0]}px;top:${xy[1]}px;width:${w}px;height:${w * 0.75}px;opacity:${a};transform:translate(-50%,-50%) scale(${sc * sx},${sc})">`;
    } });
    flipper(at('this'), tRiver - 0.1, [540, 560]);
    A.sfx(at('changes'), 'pop', 0.5);

    // ---- where: France / Spain, the Bidasoa mouth
    A.country({ t0: tRiver, t1: tSchemIn + 0.6, key: 'France', res: '10m', fill: BLUE, fillOpacity: 0.16, stroke: BLUE, width: 3 });
    A.country({ t0: tRiver, t1: tSchemIn + 0.6, key: 'Spain', res: '10m', fill: RED, fillOpacity: 0.16, stroke: RED, width: 3 });
    A.label({ t0: tRiver + 0.3, t1: tFrance - 0.2, ll: [-3.4, 44.75], text: 'Bay of Biscay', size: 40, color: BLUE });
    A.label({ t0: at('Bidasoa'), t1: tSchemIn + 0.3, ll: ISL, dy: -95, text: 'Bidasoa river', sub: 'the border · 43.34°N 1.77°W', size: 50 });
    A.label({ t0: tFrance - 0.1, t1: tSchemIn + 0.3, ll: ISL, dx: 150, dy: -300, text: 'France', sub: 'Hendaye', size: 72, color: BLUE });
    A.label({ t0: tSpain - 0.1, t1: tSchemIn + 0.3, ll: ISL, dx: -110, dy: 250, text: 'Spain', sub: 'Irún', size: 72, color: RED });
    A.dim(tSchemIn + 0.4, tSchemOut + 0.4, 0.72);

    // ---- the schematic panel (screen space)
    const P = { x: 40, y: 400, w: 1000, h: 980 };
    const cx = 560, cy = 900; // island centre
    const flagState = t => {
      // which flag flies over the island, and fill colour
      if (t < tShared) return { fill: GREEN, flag: null };
      if (t < tTurns) return { fill: 'split', flag: null };
      if (t < tFranceM) return { fill: RED, flag: 'es' };
      if (t < tSwap) return { fill: BLUE, flag: 'fr' };
      if (t < tSmallest) return { fill: RED, flag: 'es' };
      return { fill: 'split', flag: null };
    };
    const flipAt = [tFranceM, tSwap];
    A.svg({ t0: tSchemIn + 0.3, t1: tSchemOut, fi: 0.5, fo: 0.5, fn: (t, a) => {
      const s = (E.outBack(clamp((t - tSchemIn - 0.3) / 0.9)) * 0.1 + 0.9) * (1 + 0.0012 * Math.max(0, t - tSchemIn - 1.2)); // slow push-in
      const tf = `translate(${540 * (1 - s)},${890 * (1 - s)}) scale(${s})`;
      const flow = ((t * 40) % 60).toFixed(1);
      const st = flagState(t);
      const fill = st.fill === 'split' ? 'url(#isplit)' : st.fill;
      // river band, flowing west (left) to the sea
      const top = `M${P.x},792 C 250,760 420,822 620,800 S 900,770 ${P.x + P.w},805`;
      const bot = `L${P.x + P.w},1005 C 880,1030 700,985 520,1004 S 200,1030 ${P.x},998 Z`;
      // flag on a pole at the island's east end
      let flag = '';
      if (st.flag) {
        const fx = cx + 150, fy = cy - 150;
        let sx = 1;
        for (const tt of flipAt) { const d = t - tt; if (d > -0.18 && d < 0.18) sx = Math.abs(d) / 0.18; }
        const pop = E.outBack(clamp((t - tTurns) / 0.45));
        flag = `<line x1="${cx + 110}" y1="${cy - 10}" x2="${cx + 110}" y2="${fy - 40}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
          <g transform="translate(${cx + 112},${fy - 40}) scale(${sx * pop},${pop})"><image href="flags/${st.flag}.svg" x="0" y="0" width="120" height="90" preserveAspectRatio="none"/><rect x="0" y="0" width="120" height="90" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="2"/></g>`;
      }
      return `<defs>
          <linearGradient id="isplit" x1="0" x2="1" y1="0" y2="0"><stop offset="0.5" stop-color="${RED}"/><stop offset="0.5" stop-color="${BLUE}"/></linearGradient>
          <clipPath id="pclip"><rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="28"/></clipPath>
        </defs>
        <g opacity="${a}" transform="${tf}">
        <rect x="${P.x}" y="${P.y}" width="${P.w}" height="${P.h}" rx="28" fill="rgba(6,12,24,0.88)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
        <g clip-path="url(#pclip)">
          <rect x="${P.x}" y="${P.y}" width="${P.w}" height="420" fill="${BLUE}" opacity="0.13"/>
          <rect x="${P.x}" y="960" width="${P.w}" height="420" fill="${RED}" opacity="0.13"/>
          <path d="${top} ${bot}" fill="#1c5d9c"/>
          <path d="${top}" fill="none" stroke="#9fd3ff" stroke-width="3" opacity="0.8"/>
          <path d="M${P.x},998 C 200,1030 520,1004 520,1004 S 880,1030 ${P.x + P.w},1005" fill="none" stroke="#9fd3ff" stroke-width="3" opacity="0.8"/>
          <path d="M${P.x},850 L${P.x + P.w},850 M${P.x},955 L${P.x + P.w},955" stroke="#bfe4ff" stroke-width="3" stroke-dasharray="26 34" stroke-dashoffset="${flow}" opacity="0.35"/>
        </g>
        <text x="${P.x + 40}" y="${P.y + 150}" font-family="Anton" font-size="84" fill="${BLUE}" letter-spacing="2">FRANCE</text>
        <text x="${P.x + 44}" y="${P.y + 192}" font-family="Space Mono" font-size="24" fill="#fff" opacity="0.85" letter-spacing="5">HENDAYE</text>
        <text x="${P.x + 40}" y="${P.y + P.h - 110}" font-family="Anton" font-size="84" fill="${RED}" letter-spacing="2">SPAIN</text>
        <text x="${P.x + 44}" y="${P.y + P.h - 68}" font-family="Space Mono" font-size="24" fill="#fff" opacity="0.85" letter-spacing="5">IRÚN</text>
        <text x="${P.x + 36}" y="${cy + 12}" font-family="Space Mono" font-size="21" fill="#cfe9ff" letter-spacing="4">← SEA</text>
        <text x="${P.x + P.w - 36}" y="${cy - 60}" text-anchor="end" font-family="Anton" font-size="34" fill="#cfe9ff" letter-spacing="3" opacity="0.9">BIDASOA</text>
        <g transform="rotate(-4 ${cx} ${cy})">
          <ellipse cx="${cx}" cy="${cy}" rx="228" ry="58" fill="${fill}" stroke="#fff" stroke-width="4"/>
          <text x="${cx}" y="${cy + 15}" text-anchor="middle" font-family="Anton" font-size="40" fill="#08131f" letter-spacing="1">PHEASANT ISLAND</text>
        </g>
        ${flag}
        <text x="${P.x + P.w - 30}" y="${P.y + P.h - 26}" text-anchor="end" font-family="Space Mono" font-size="19" fill="#fff" opacity="0.6" letter-spacing="4">SCHEMATIC · NOT TO SCALE</text>
        </g>`;
    } });

    // ---- 1659 / 1660
    A.headline({ t0: t1659 - 0.05, t1: tPrincess - 0.15, text: '1659', sub: 'Treaty of the Pyrenees · signed here', size: 150, y: 150 });
    A.emoji({ t0: at('signed') - 0.1, t1: tPrincess - 0.1, xy: [cx - 120, cy - 150], char: '📜', size: 96 });
    A.headline({ t0: tPrincess - 0.05, t1: tShared - 0.15, text: '1660', sub: 'Maria Theresa of Spain → Louis XIV', size: 150, y: 150 });
    // the princess crosses from the Spanish bank to the French bank
    const crossPath = [[440, 1190], [470, 1000], [520, 900], [600, 790], [660, 610]];
    const along = p => { const n = crossPath.length - 1, k = Math.min(n - 1e-6, p * n), i = Math.floor(k), f = k - i; return [lerp(crossPath[i][0], crossPath[i + 1][0], f), lerp(crossPath[i][1], crossPath[i + 1][1], f)]; };
    A.svg({ t0: at('princess') - 0.2, t1: tShared - 0.1, fn: (t, a) => {
      const p = prog(t, tCrossed - 0.2, at('marry') + 0.6, 'inOut');
      const pts = []; for (let i = 0; i <= 40; i++) { const q = i / 40 * p; pts.push(along(q)); }
      return `<path d="M${pts.map(q => q.map(v => v.toFixed(1)).join(',')).join(' L')}" fill="none" stroke="${YEL}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round" opacity="${a}"/>`;
    } });
    A.html({ t0: at('princess') - 0.2, t1: tShared - 0.1, fn: (t, a) => {
      const p = prog(t, tCrossed - 0.2, at('marry') + 0.6, 'inOut'); const [x, y] = along(p);
      const sc = E.outBack(clamp((t - at('princess') + 0.2) / 0.45));
      return `<div class="emoji" style="left:${x}px;top:${y - 10}px;font-size:84px;opacity:${a};transform:translate(-50%,-50%) scale(${sc})">👑</div>`;
    } });
    A.sfx(tCrossed, 'whoosh', 0.5);

    // ---- owned by both
    A.headline({ t0: tShared - 0.05, t1: t1856 - 0.15, text: 'Owned by both', sub: 'a condominium · joint sovereignty', size: 120, y: 160 });
    A.flag({ t0: tShared + 0.1, t1: t1856 - 0.1, xy: [cx - 150, cy - 150], code: 'es', w: 110 });
    A.flag({ t0: at('both') - 0.05, t1: t1856 - 0.1, xy: [cx + 150, cy - 150], code: 'fr', w: 110 });
    A.headline({ t0: t1856 - 0.05, t1: tSpainM - 0.15, text: 'Since 1856', sub: 'Treaty of Bayonne · they take turns', size: 130, y: 160 });

    // ---- calendar (headline band)
    const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const owner = m => (m >= 1 && m <= 6) ? 'es' : 'fr';
    const fillT = m => {
      if (owner(m) === 'es') return lerp(tFeb - 0.1, tFeb + 0.9, (m - 1) / 5);
      const k = m === 0 ? 5 : m - 7; return lerp(tAug - 0.1, tAug + 0.9, k / 5);
    };
    A.sfx(tFeb - 0.1, 'tick', 0.5); A.sfx(tAug - 0.1, 'tick', 0.5);
    A.html({ t0: tSpainM - 0.1, t1: tHand - 0.1, fn: (t, a) => {
      const cells = M.map((m, i) => {
        const on = prog(t, fillT(i), fillT(i) + 0.25, 'out');
        const c = owner(i) === 'es' ? RED : BLUE;
        const x = 70 + (i % 6) * 160, y = 140 + Math.floor(i / 6) * 86;
        return `<div style="position:absolute;left:${x}px;top:${y}px;width:146px;height:74px;border-radius:12px;border:2px solid rgba(255,255,255,${0.35 + 0.4 * on});background:${c};background-color:rgba(255,255,255,0.06);overflow:hidden">
          <div style="position:absolute;inset:0;background:${c};opacity:${0.85 * on}"></div>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:Anton;font-size:40px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.8)">${m}</div></div>`;
      }).join('');
      const la = prog(t, tFeb, tFeb + 0.4), lb = prog(t, tAug, tAug + 0.4);
      const legend = `<div style="position:absolute;left:70px;right:70px;top:322px;display:flex;justify-content:space-between;font-family:'Space Mono';font-size:23px;letter-spacing:3px;color:#fff;text-shadow:0 2px 8px #000">
        <span style="opacity:${la}"><img src="flags/es.svg" style="width:36px;height:27px;vertical-align:-5px;border-radius:3px;margin-right:10px">SPAIN 1 FEB–31 JUL</span>
        <span style="opacity:${lb}"><img src="flags/fr.svg" style="width:36px;height:27px;vertical-align:-5px;border-radius:3px;margin-right:10px">FRANCE 1 AUG–31 JAN</span></div>`;
      return `<div style="position:absolute;left:0;top:0;width:1080px;opacity:${a}">${cells}${legend}</div>`;
    } });

    // ---- handover
    A.headline({ t0: tHand - 0.05, t1: tRest - 0.15, text: 'Handover', sub: 'naval officers from both sides', size: 130, y: 160 });
    A.emoji({ t0: tNaval - 0.1, t1: tRest - 0.1, xy: [cx - 250, cy - 170], char: '⚓', size: 90 });
    A.emoji({ t0: tSwap - 0.15, t1: tRest - 0.1, xy: [cx - 110, cy - 170], char: '📄', size: 80 });
    A.sfx(tSwap, 'whoosh', 0.5);

    // ---- closed
    A.headline({ t0: tRest - 0.05, t1: tArea - 0.15, text: 'Closed', sub: 'uninhabited · rare open days only', size: 140, y: 160 });
    A.emoji({ t0: tClosed - 0.1, t1: tArea - 0.1, xy: [cx - 40, cy - 175], char: '🚫', size: 110, bob: false });

    // ---- the number
    A.headline({ t0: tArea - 0.05, t1: tPitch - 0.15, text: '', count: { from: 0, to: 6820, t0: t6820, t1: atEnd('meters') + 0.2, suffix: ' m²' }, sub: 'total area of the island', size: 150, y: 150, color: YEL, subColor: '#fff' });
    A.svg({ t0: t6820, t1: tPitch, fn: (t, a) => {
      const pp = ((t - t6820) % 1.2) / 1.2;
      return `<g transform="rotate(-4 ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${228 + pp * 60}" ry="${58 + pp * 30}" fill="none" stroke="${YEL}" stroke-width="5" opacity="${a * (1 - pp)}"/></g>`;
    } });
    A.bars({ t0: tPitch - 0.05, t1: tSmallest - 0.15, y: 150, grow: [tPitch, tPitch + 1.2], rows: [
      { label: 'Pheasant Island', value: 6820, max: 7140, color: GREEN, suffix: ' m²' },
      { label: 'Football pitch (105×68 m)', value: 7140, max: 7140, color: BLUE, suffix: ' m²' },
    ] });
    A.headline({ t0: tSmallest - 0.05, t1: tWait - 0.15, text: 'Smallest condominium', sub: 'on Earth · one island, two countries', size: 96, y: 165 });

    // ---- loop: back out to the globe
    A.pin({ t0: tSchemOut + 0.2, t1: tEnd + 0.3, ll: ISL, color: RED });
    flipper(tWait + 0.2, tEnd + 0.3, [540, 600], 130, 0.9);
    A.headline({ t0: tWait - 0.05, t1: tEnd - 0.1, text: 'Every 6 months', sub: 'next swap: 1 Feb or 1 Aug', size: 130, y: 160 });
    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the island that takes turns', line2: 'Half the year Spain. Half the year France.', y: 760 });
  },
};
