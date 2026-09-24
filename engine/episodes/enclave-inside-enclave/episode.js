// Dahala Khagrabari (#51): a piece of India inside Upanchowki Bhajni (Bangladesh, #110) inside Balapara
// Khagrabari (India) inside Bangladesh (Debiganj, Panchagarh). The world's only third-order enclave until the
// 1974 Land Boundary Agreement was implemented at midnight 31 July / 1 August 2015.
// Enclave outlines are not in any global dataset we ship, so the nesting is a labelled schematic.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp, E } = A;
    const IN = '#ffa94d', BD = '#3ee08f', YEL = '#ffd23f', RED = '#ff3b4e', BLUE = '#5ab8ff';
    const DK = [88.762, 26.15];            // Dahala Khagrabari
    const ZONE = [89.1, 26.25];            // centre of the Cooch Behar enclave cluster

    // ---- cues
    const tHere = at('here'), tStart = at('Start'), tL1 = at('Inside it'), tL2 = at('Inside that'), tL3 = at('one');
    const tName = at('Dahala'), tOnly = at('only'), tJute = at('jute'), tFarmer = at('farmer');
    const tAlone = at('wasnt'), t200 = at('200'), t50k = at('More'), t1974 = at('1974'), t41 = at('took');
    const tMid = at('midnight'), t162 = at('162'), tChanged = at('changed'), tIndianField = at('Indian'), tToday = at('Today'), tNothing = at('nothing');
    const tEnd = A.sentence(13).t1 + 1.2;
    const tPanelIn = tStart - 0.2, tPanelOut = tAlone - 0.1, tPanel2In = tMid - 0.2, tPanel2Out = tToday - 0.1;

    // ---- camera
    cam.init({ lon: 80, lat: 14, r: 540, cy: 1000 });
    cam.move(0.3, { lon: DK[0], lat: DK[1] - 4, r: 1300 }, 4.0, 'inOut');
    cam.move(tHere - 0.3, { lon: DK[0] + 0.1, lat: DK[1] - 0.9, r: 9000 }, 1.6);
    cam.move(tPanelIn, { lon: DK[0], lat: DK[1], r: 30000 }, 1.4, 'in');
    cam.move(tPanelOut, { lon: ZONE[0], lat: ZONE[1], r: 11000, cy: 1170 }, 1.6);
    cam.move(t1974 - 0.2, { lon: ZONE[0] - 0.3, lat: ZONE[1] - 0.2, r: 9000, cy: 1150 }, 1.6, 'inOut', false);
    cam.move(tPanel2In, { lon: DK[0], lat: DK[1], r: 30000, cy: 1000 }, 1.4, 'in');
    cam.move(tPanel2Out, { lon: DK[0] + 0.1, lat: DK[1] - 0.9, r: 9000 }, 1.6, 'out');
    cam.move(tEnd, { lon: 84, lat: 18, r: 560, cy: 1060 }, 2.6, 'out', false);

    // ---- hook: four flags, each inside the next
    const chain = [['in', at('India', 1)], ['bd', at('Bangladesh', 1)], ['in', at('India', 2)], ['bd', at('Bangladesh', 2)]];
    chain.forEach(([code, t]) => A.sfx(t, 'pop', 0.45));
    A.html({ t0: 0.9, t1: tHere - 0.1, fn: (t, a) => {
      let h = '';
      chain.forEach(([code, t0], i) => {
        if (t < t0 - 0.05) return;
        const sc = E.outBack(clamp((t - t0 + 0.05) / 0.4)), x = 150 + i * 260;
        h += `<img src="flags/${code}.svg" style="position:absolute;left:${x}px;top:230px;width:150px;height:112px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.7);transform:translate(-50%,-50%) scale(${sc})">`;
        h += `<div style="position:absolute;left:${x}px;top:318px;transform:translate(-50%,0);font-family:Anton;font-size:34px;color:${code === 'in' ? IN : BD};text-shadow:0 2px 8px #000;opacity:${sc}">${code === 'in' ? 'INDIA' : 'BANGLADESH'}</div>`;
        if (i < 3 && t > chain[i + 1][1] - 0.4) h += `<div style="position:absolute;left:${x + 130}px;top:230px;transform:translate(-50%,-50%);font-family:'Space Mono';font-size:22px;letter-spacing:3px;color:#fff;text-shadow:0 2px 8px #000">IN</div>`;
      });
      return `<div style="position:absolute;left:0;top:0;width:1080px;opacity:${a}">${h}</div>`;
    } });

    // ---- where
    A.country({ t0: tHere - 0.4, t1: tPanelIn + 0.6, key: 'India', res: '10m', fill: IN, fillOpacity: 0.14, stroke: IN, width: 3 });
    A.country({ t0: tHere - 0.4, t1: tPanelIn + 0.6, key: 'Bangladesh', res: '10m', fill: BD, fillOpacity: 0.14, stroke: BD, width: 3 });
    A.pin({ t0: 1.9, t1: tPanelIn + 0.5, ll: DK, color: RED });
    A.label({ t0: tHere, t1: tPanelIn + 0.4, ll: DK, dy: -95, text: 'Dahala Khagrabari', sub: '26.15°N · 88.76°E', size: 54 });
    A.label({ t0: tHere + 0.2, t1: tPanelIn + 0.3, ll: [87.3, 25.7], text: 'India', size: 72, color: IN });
    A.label({ t0: at('north') - 0.1, t1: tPanelIn + 0.3, ll: [89.4, 25.2], text: 'Bangladesh', size: 72, color: BD });
    A.headline({ t0: tHere - 0.05, t1: tStart - 0.15, text: 'Here', sub: 'Panchagarh district · Bangladesh', size: 140, y: 160 });

    // ---- the Russian dolls (schematic, screen space)
    const blob = (cx, cy, r, seed, amp = 0.1) => {
      const pts = []; const n = 72;
      for (let i = 0; i < n; i++) {
        const th = i / n * Math.PI * 2;
        const k = 1 + amp * (0.55 * Math.sin(3 * th + seed) + 0.3 * Math.sin(5 * th + 2.3 * seed) + 0.15 * Math.sin(9 * th + seed * 0.7));
        pts.push([cx + Math.cos(th) * r * k, cy + Math.sin(th) * r * k * 0.95]);
      }
      return 'M' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
    };
    const LV = [
      { d: blob(545, 905, 390, 1.3), c: [545, 905], color: IN, name: 'INDIA', sub: 'BALAPARA KHAGRABARI', lx: 545, ly: 590, t: tL1 },
      { d: blob(590, 975, 225, 4.1, 0.13), c: [590, 975], color: BD, name: 'BANGLADESH', sub: 'UPANCHOWKI BHAJNI', lx: 590, ly: 835, t: tL2 },
      { d: blob(630, 1010, 62, 2.2, 0.16), c: [630, 1010], color: IN, name: 'INDIA', sub: 'DAHALA KHAGRABARI', lx: 630, ly: 1122, t: tL3 },
    ];
    const Z = { x: 630, y: 1010 };
    const zoomAt = t => {
      const zin = prog(t, tOnly - 0.1, tOnly + 1.2, 'inOut'), zout = prog(t, tAlone - 0.6, tAlone + 0.2, 'inOut');
      return lerp(1, 2.7, zin * (1 - zout));
    };
    const panel = (t0, t1, second) => A.svg({ t0, t1, fi: 0.5, fo: 0.5, fn: (t, a) => {
      const s0 = second ? 1 : E.outBack(clamp((t - t0) / 0.8)) * 0.1 + 0.9;
      const z = second ? 1 : zoomAt(t);
      // map Z to the panel centre as we zoom
      const zx = lerp(Z.x, 540, (z - 1) / 1.7), zy = lerp(Z.y, 900, (z - 1) / 1.7);
      const inner = `translate(${zx - Z.x * z},${zy - Z.y * z}) scale(${z})`;
      const outer = `translate(${540 * (1 - s0)},${890 * (1 - s0)}) scale(${s0})`;
      const dis = second ? prog(t, tChanged - 0.1, tChanged + 1.3) : 0;          // borders dissolve
      const last = second ? prog(t, tIndianField, tIndianField + 0.9) : 0;       // the field goes last
      let lv = '';
      LV.forEach((L, i) => {
        const on = second ? 1 : E.outBack(clamp((t - L.t + 0.05) / 0.5));
        if (on <= 0) return;
        const k = i === 2 ? last : dis;
        const col = L.color === IN ? d3.interpolateRgb(IN, BD)(k) : BD;
        const fo = (L.color === IN ? 0.55 : 0.5) * (1 - 0.85 * k);
        const so = 1 - k;
        const glow = (i === 2) ? `<path d="${L.d}" fill="none" stroke="${YEL}" stroke-width="${10 / z}" opacity="${0.35 * (1 - k)}" />` : '';
        lv += `<g transform="translate(${L.c[0] * (1 - on)},${L.c[1] * (1 - on)}) scale(${on})">${glow}<path d="${L.d}" fill="${col}" fill-opacity="${fo}" stroke="#fff" stroke-opacity="${so}" stroke-width="${4 / z}" stroke-linejoin="round"/></g>`;
        const la = clamp((t - L.t - 0.1) / 0.4) * (1 - k) * (i < 2 ? clamp(1 - (z - 1) * 1.5) : 1);
        const fs = i === 2 ? 30 / Math.sqrt(z) : 46;
        if (la > 0) lv += `<g opacity="${la}"><text x="${L.lx}" y="${L.ly}" text-anchor="middle" font-family="Anton" font-size="${fs}" fill="${L.color}" stroke="#000" stroke-opacity="0.35" stroke-width="${1.5 / z}">${L.name}</text>
          <text x="${L.lx}" y="${L.ly + (i === 2 ? 26 / Math.sqrt(z) : 32)}" text-anchor="middle" font-family="Space Mono" font-size="${i === 2 ? 15 / Math.sqrt(z) : 19}" fill="#fff" letter-spacing="${3 / z}">${L.sub}</text></g>`;
      });
      return `<defs><clipPath id="eclip${second ? 2 : 1}"><rect x="40" y="400" width="1000" height="980" rx="28"/></clipPath></defs>
        <g opacity="${a}" transform="${outer}">
          <rect x="40" y="400" width="1000" height="980" rx="28" fill="rgba(6,14,12,0.9)" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
          <g clip-path="url(#eclip${second ? 2 : 1})">
            <rect x="40" y="400" width="1000" height="980" fill="${BD}" opacity="0.2"/>
            <g transform="${inner}">${lv}</g>
          </g>
          <text x="80" y="472" font-family="Anton" font-size="52" fill="${BD}" opacity="${second ? 1 : clamp(1 - (z - 1) * 1.5)}">BANGLADESH</text>
          <text x="1010" y="1356" text-anchor="end" font-family="Space Mono" font-size="19" fill="#fff" opacity="0.6" letter-spacing="4">SCHEMATIC · NOT TO SCALE</text>
        </g>`;
    } });
    A.dim(tPanelIn + 0.4, tPanelOut + 0.5, 0.72);
    panel(tPanelIn + 0.3, tPanelOut + 0.3, false);
    A.headline({ t0: tStart - 0.05, t1: tL1 - 0.1, text: 'Bangladesh', sub: 'level 0 · the country', size: 130, y: 160, color: BD, subColor: '#fff' });
    A.headline({ t0: tL1 - 0.05, t1: tL2 - 0.1, text: '⊃ India', sub: 'level 1 · an enclave', size: 130, y: 160, color: IN, subColor: '#fff' });
    A.headline({ t0: tL2 - 0.05, t1: at('And') - 0.1, text: '⊃ Bangladesh', sub: 'level 2 · a counter-enclave', size: 130, y: 160, color: BD, subColor: '#fff' });
    A.headline({ t0: at('And') - 0.05, t1: tOnly - 0.1, text: '⊃ India', sub: 'level 3 · Dahala Khagrabari', size: 130, y: 160, color: IN, subColor: '#fff' });
    A.headline({ t0: tOnly - 0.05, t1: tJute - 0.4, text: 'Third-order enclave', sub: 'the only one in the world', size: 110, y: 165, color: YEL, subColor: '#fff' });
    A.headline({ t0: tJute - 0.35, t1: tAlone - 0.15, text: 'One jute field', sub: 'about 1.7 acres · ~7,000 m²', size: 120, y: 160 });
    A.emoji({ t0: tJute - 0.1, t1: tAlone - 0.2, xy: [540, 895], char: '🌾', size: 120 });
    A.emoji({ t0: tFarmer - 0.1, t1: tAlone - 0.2, xy: [860, 1230], char: '🧑‍🌾', size: 100 });
    A.svg({ t0: tFarmer + 0.2, t1: tAlone - 0.2, fn: (t, a) => {
      const p = prog(t, tFarmer + 0.3, tFarmer + 1.3);
      const x1 = 820, y1 = 1180, x2 = lerp(x1, 640, p), y2 = lerp(y1, 980, p);
      return `<path d="M${x1},${y1} L${x2},${y2}" stroke="${YEL}" stroke-width="6" stroke-dasharray="4 14" stroke-linecap="round" opacity="${a}"/>`;
    } });

    // ---- the bigger picture: nearly 200 enclaves, 50,000+ people
    A.circle({ t0: tPanelOut + 0.8, t1: tPanel2In + 0.2, center: ZONE, radiusKm: 85, color: '#fff', width: 4, dash: '14 10', draw: [tPanelOut + 0.9, tPanelOut + 2.0] });
    A.label({ t0: tPanelOut + 1.4, t1: tPanel2In, ll: ZONE, dy: 200, text: 'Cooch Behar enclaves', sub: 'most sat around here', size: 46 });
    A.pin({ t0: tPanelOut + 0.8, t1: tPanel2In + 0.2, ll: DK, color: RED, size: 8 });
    A.country({ t0: tPanelOut + 0.5, t1: tPanel2In + 0.4, key: 'India', res: '10m', fill: IN, fillOpacity: 0.12, stroke: IN, width: 3 });
    A.country({ t0: tPanelOut + 0.5, t1: tPanel2In + 0.4, key: 'Bangladesh', res: '10m', fill: BD, fillOpacity: 0.12, stroke: BD, width: 3 });
    A.headline({ t0: t200 - 0.1, t1: t50k - 0.15, text: 'Nearly 200', sub: '106 Indian · 92 Bangladeshi enclaves', size: 140, y: 150, color: YEL, subColor: '#fff' });
    A.html({ t0: t200 - 0.1, t1: t1974 - 0.2, fn: (t, a) => {
      let h = '';
      for (let i = 0; i < 198; i++) {
        const c = i < 106 ? IN : BD, ti = lerp(t200, t200 + 1.6, i / 197), on = clamp((t - ti) / 0.2);
        const x = 106 + (i % 18) * 48, y = 420 + Math.floor(i / 18) * 48;
        h += `<div style="position:absolute;left:${x}px;top:${y}px;width:38px;height:38px;border-radius:7px;background:${c};opacity:${0.9 * on};transform:scale(${0.6 + 0.4 * on})"></div>`;
      }
      return `<div style="position:absolute;left:0;top:0;width:1080px;opacity:${a}">${h}<div style="position:absolute;left:0;right:0;top:960px;text-align:center;font-family:'Space Mono';font-size:20px;letter-spacing:4px;color:#fff;text-shadow:0 2px 8px #000">■ = ONE ENCLAVE · INCL. COUNTER-ENCLAVES</div></div>`;
    } });
    A.sfx(t200, 'tick', 0.5);
    A.headline({ t0: t50k - 0.05, t1: t1974 - 0.15, text: '', count: { from: 0, to: 51549, t0: at('50,000'), t1: at('people') + 0.8 }, sub: 'residents · 2010 joint census', size: 150, y: 150, color: YEL, subColor: '#fff' });

    A.dim(tPanelOut + 0.5, tPanel2In + 0.4, 0.3);
    A.dim(tToday - 0.2, tEnd + 0.2, 0.25);

    // ---- 1974 -> 2015
    A.headline({ t0: t1974 - 0.05, t1: t41 - 0.15, text: '1974', sub: 'Land Boundary Agreement', size: 150, y: 150 });
    A.card({ t0: at('agreed') - 0.1, t1: t41 - 0.1, xy: [540, 520], k: 'Indira Gandhi · Sheikh Mujibur Rahman', v: 'Signed', rot: -2 });
    A.headline({ t0: t41 - 0.05, t1: tMid - 0.15, text: '', count: { from: 0, to: 41, t0: at('41'), t1: at('years') + 0.4, suffix: ' years' }, sub: '1974 → 2015', size: 150, y: 150, color: YEL, subColor: '#fff' });
    A.html({ t0: t41 - 0.05, t1: tMid - 0.15, fn: (t, a) => {
      const p = prog(t, at('41') - 0.1, at('years') + 0.4, 'inOut');
      return `<div style="position:absolute;left:110px;right:110px;top:470px;opacity:${a}">
        <div style="height:22px;border-radius:11px;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.4);overflow:hidden"><div style="height:100%;width:${p * 100}%;background:${YEL};box-shadow:0 0 18px ${YEL}"></div></div>
        <div style="display:flex;justify-content:space-between;margin-top:10px;font-family:Anton;font-size:44px;color:#fff;text-shadow:0 2px 10px #000"><span>1974</span><span style="opacity:${prog(t, at('years'), at('years') + 0.4)}">2015</span></div></div>`;
    } });

    // ---- midnight, 31 July 2015: the borders dissolve
    A.dim(tPanel2In + 0.4, tPanel2Out + 0.5, 0.72);
    panel(tPanel2In + 0.3, tPanel2Out + 0.2, true);
    A.headline({ t0: tMid - 0.05, t1: t162 - 0.15, text: 'Midnight', sub: '31 July 2015 → 1 August', size: 140, y: 150 });
    A.clock({ t0: tMid, t1: t162 - 0.15, xy: [150, 225], r: 58, fn: t => { const m = lerp(58, 60, prog(t, tMid + 0.3, tMid + 1.6)); return [11 + Math.floor(m / 60), m % 60]; } });
    A.headline({ t0: t162 - 0.05, t1: tIndianField - 0.15, text: '', count: { from: 0, to: 162, t0: t162, t1: t162 + 1.3, suffix: ' enclaves' }, sub: '111 → Bangladesh · 51 → India', size: 130, y: 150, color: YEL, subColor: '#fff' });
    A.sfx(tChanged, 'whoosh', 0.6);
    A.headline({ t0: tIndianField - 0.05, t1: tToday - 0.15, text: 'Plain Bangladesh', sub: 'Dahala Khagrabari · since 1 August 2015', size: 120, y: 160, color: BD, subColor: '#fff' });
    A.emoji({ t0: tIndianField + 0.4, t1: tToday - 0.1, xy: [630, 1010], char: '🌾', size: 90 });

    // ---- today: just a field
    A.country({ t0: tToday - 0.2, t1: tEnd + 0.4, key: 'Bangladesh', res: '10m', fill: BD, fillOpacity: 0.14, stroke: BD, width: 3 });
    A.country({ t0: tToday - 0.2, t1: tEnd + 0.4, key: 'India', res: '10m', fill: 'none', stroke: IN, width: 3 });
    A.pin({ t0: tToday, t1: tEnd + 0.4, ll: DK, color: BD });
    A.label({ t0: tToday + 0.2, t1: tEnd + 0.2, ll: DK, dy: -95, text: 'Just a field', sub: 'Debiganj · Panchagarh · Bangladesh', size: 56 });
    A.headline({ t0: tNothing - 0.3, t1: tEnd - 0.1, text: 'Inside nothing', sub: 'four borders → none', size: 140, y: 160 });
    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the enclave inside an enclave', line2: 'India, in Bangladesh, in India, in Bangladesh.', y: 760 });
  },
};
