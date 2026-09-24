// Closest to Space: Everest (highest above sea level) vs Chimborazo (farthest from Earth's centre)
// vs Mauna Kea (tallest base to peak). The bulge diagram is drawn over the globe and follows the camera.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, lerp, clamp, E } = A;

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

    const EV = [86.925, 27.988], CH = [-78.817, -1.469], MK = [-155.468, 19.821];

    // ---- cues
    const tIsnt = at("isn't", 1), tVolc = at('volcano'), tEv = at('Everest', 2), t8849 = at('8,849');
    const tCh = at('Chimborazo', 1), t6263 = at('6,263'), tLower = at("That's"), tBall = at('But');
    const tSpin = at('spins'), tBulge = at('bulge', 1), tRad = at('radius'), t21 = at('21');
    const tEv28 = at('Everest', 3), tCh1 = at('Chimborazo', 2), tTop = at('Right'), tMeas = at('Now');
    const tSum = at("Chimborazo's"), t6384 = at('6,384'), tCloser = at("Everest's"), tTall = at('tallest');
    const tMK = at('Mauna'), t10k = at('10,000'), tThree = at('Three'), tOnly = at('Only');
    const tEnd = A.sentence(16).t1 + 1.2;

    // ---- camera
    cam.init({ lon: 80, lat: 22, r: 560, cy: 1000 });
    cam.drift(0);
    go(0.1, { lon: 84, lat: 24, r: 620 }, 2.2);
    go(tVolc - 0.3, { lon: -76, lat: 2, r: 620 }, 1.5);
    go(tEv - 0.2, { lon: EV[0] + 0.1, lat: EV[1] - 0.8, r: 5200 }, 1.6);
    go(tCh - 0.3, { lon: CH[0], lat: CH[1] - 0.8, r: 5200 }, 1.7);
    go(tBall - 0.2, { lon: -150, lat: 0, r: 470, cy: 1000 }, 1.6);
    shots.push({ t: tSpin, to: { lon: -60, lat: 0, r: 400, cx: 500, cy: 990 }, dur: 2.2, still: true });
    go(tMK - 0.6, { lon: MK[0] + 1.2, lat: MK[1] - 1.5, r: 2600, cx: 540, cy: 1000 }, 1.5);
    go(tThree - 0.3, { lon: -120, lat: 12, r: 560, cx: 540, cy: 1000 }, 1.6);
    rollShots();
    cam.move(tEnd, { r: 520, cy: 1060 }, 2.5, 'out', false);

    // ---- hook
    A.pin({ t0: 0.4, t1: tVolc, ll: EV, color: '#ffd23f' });
    A.label({ t0: 0.4, t1: tVolc, ll: EV, dy: -85, text: 'Everest', size: 56 });
    A.headline({ t0: 0.3, t1: tIsnt - 0.05, text: 'Closest to space?', sub: 'the highest point on Earth', size: 130, y: 165 });
    A.headline({ t0: tIsnt, t1: tVolc - 0.1, text: 'Not Everest', size: 140, y: 165, color: '#ff3b4e', pop: false });
    A.emoji({ t0: at('space', 1), t1: tVolc - 0.1, xy: [540, 420], char: '🚀', size: 90 });
    A.pin({ t0: tVolc + 0.6, t1: tEv, ll: CH, color: '#3ee08f' });
    A.label({ t0: tVolc + 0.6, t1: tEv, ll: CH, dy: -85, text: 'Chimborazo', sub: 'Ecuador · a volcano', size: 56 });
    A.headline({ t0: at('Ecuador', 1) - 0.1, t1: tEv - 0.1, text: 'A volcano in Ecuador', size: 110, y: 170, color: '#3ee08f' });
    A.flag({ t0: at('Ecuador', 1), t1: tEv - 0.1, xy: [540, 340], code: 'ec', w: 100 });

    // ---- Everest above sea level
    A.pin({ t0: tEv + 1.0, t1: tCh, ll: EV, color: '#ffd23f' });
    A.label({ t0: tEv + 1.0, t1: tCh, ll: EV, dy: -95, text: 'Mount Everest', sub: 'Nepal · China', size: 60 });
    A.headline({ t0: tEv - 0.05, t1: t8849 - 0.1, text: 'Highest above sea', sub: 'the classic record', size: 120, y: 170 });
    A.headline({ t0: t8849 - 0.05, t1: tCh - 0.2, text: '', count: { from: 0, to: 8849, t0: t8849, t1: t8849 + 1.6, suffix: ' m' }, sub: '8,848.86 m · China–Nepal survey, 2020', size: 160, y: 150, pop: false });
    A.flag({ t0: tEv + 1.1, t1: tCh - 0.2, xy: [460, 420], code: 'np', w: 90 });
    A.flag({ t0: tEv + 1.2, t1: tCh - 0.2, xy: [620, 420], code: 'cn', w: 90 });

    // ---- Chimborazo above sea level
    A.pin({ t0: tCh + 1.0, t1: tBall, ll: CH, color: '#3ee08f' });
    A.label({ t0: tCh + 1.0, t1: tBall, ll: CH, dy: -95, text: 'Chimborazo', sub: 'Ecuador · 1.5°S', size: 60 });
    A.headline({ t0: tCh - 0.05, t1: t6263 - 0.1, text: 'Chimborazo', sub: "Ecuador's highest peak", size: 130, y: 170, color: '#3ee08f', subColor: '#fff' });
    A.headline({ t0: t6263 - 0.05, t1: tLower - 0.1, text: '', count: { from: 0, to: 6263, t0: t6263, t1: t6263 + 1.4, suffix: ' m' }, sub: 'above sea level · GNSS survey', size: 160, y: 150, color: '#3ee08f', subColor: '#fff', pop: false });
    A.bars({ t0: tLower - 0.05, t1: tBall - 0.1, y: 150, grow: [tLower, tLower + 1.3], rows: [
      { label: 'Everest', value: 8849, max: 8849, color: '#ffd23f', suffix: ' m' },
      { label: 'Chimborazo', value: 6263, max: 8849, color: '#3ee08f', suffix: ' m' },
    ] });

    // ---- the bulge diagram (exaggerated), centred on the globe, scaled by the camera radius
    const AX = 1.12, BY = 0.9;                     // exaggerated semi-axes relative to the globe radius
    const ellR = (R, th) => { const a = R * AX, b = R * BY; return a * b / Math.hypot(b * Math.cos(th), a * Math.sin(th)); };
    const D = Math.PI / 180;
    const tB0 = tSpin + 0.6, tB1 = tBulge + 0.9;       // ellipse morphs from circle to bulge
    A.dim(tBall + 0.4, tMK - 0.5, 0.45);
    A.svg({ t0: tBall + 0.3, t1: tMK - 0.5, fn(t, a, proj) {
      const [cx, cy] = proj.translate(); const R = proj.scale();
      const m = prog(t, tB0, tB1, 'inOut');
      const ax = lerp(1, AX, m), by = lerp(1, BY, m);
      let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="10 10" opacity="${0.8 * a}"/>`;
      s += `<ellipse cx="${cx}" cy="${cy}" rx="${R * ax}" ry="${R * by}" fill="#5ab8ff" fill-opacity="${0.12 * a * m}" stroke="#5ab8ff" stroke-width="5" opacity="${a * m}"/>`;
      // equator line through the middle
      const eq = prog(t, at('equator', 1), at('equator', 1) + 0.8);
      if (eq > 0) s += `<line x1="${cx - R * ax * eq}" y1="${cy}" x2="${cx + R * ax * eq}" y2="${cy}" stroke="#ffd23f" stroke-width="3" stroke-dasharray="12 8" opacity="${0.9 * a}"/>`;
      // radii: equatorial vs polar
      const rr = prog(t, tRad, tRad + 1.0);
      if (rr > 0 && t < tEv28 - 0.2) {
        const fa = a * clamp((tEv28 - 0.2 - t) / 0.4);
        s += `<line x1="${cx}" y1="${cy}" x2="${cx + R * ax * rr}" y2="${cy}" stroke="#ffd23f" stroke-width="7" stroke-linecap="round" opacity="${fa}"/>`;
        s += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - R * by * rr}" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="${fa}"/>`;
        s += `<circle cx="${cx}" cy="${cy}" r="9" fill="#fff" opacity="${fa}"/>`;
      }
      // mountains on the bulge (heights exaggerated too)
      const mtn = (latDeg, h, col, tIn) => {
        const p = prog(t, tIn, tIn + 0.6, 'out'); if (p <= 0) return '';
        const th = latDeg * D, re = ellR(R, th);
        const bx = cx + Math.cos(th) * re, byy = cy - Math.sin(th) * re;
        const tx = cx + Math.cos(th) * (re + h * p), ty = cy - Math.sin(th) * (re + h * p);
        const nx = -Math.sin(th) * 16, ny = -Math.cos(th) * 16;
        return `<path d="M${bx + nx},${byy + ny} L${tx},${ty} L${bx - nx},${byy - ny} Z" fill="${col}" stroke="#fff" stroke-width="2" opacity="${a}"/>`;
      };
      s += mtn(28, 44, '#ffd23f', tEv28);
      s += mtn(-1.5, 30, '#3ee08f', tCh1);
      // distance-from-centre spokes and rings
      const sp = prog(t, tMeas + 0.2, tMeas + 1.4);
      if (sp > 0) {
        const eR = ellR(R, 28 * D) + 44, cR = ellR(R, -1.5 * D) + 30;
        const eth = 28 * D, cth = -1.5 * D;
        s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(eth) * eR * sp}" y2="${cy - Math.sin(eth) * eR * sp}" stroke="#ffd23f" stroke-width="5" stroke-linecap="round" opacity="${a}"/>`;
        s += `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(cth) * cR * sp}" y2="${cy - Math.sin(cth) * cR * sp}" stroke="#3ee08f" stroke-width="5" stroke-linecap="round" opacity="${a}"/>`;
        s += `<circle cx="${cx}" cy="${cy}" r="10" fill="#fff" opacity="${a}"/>`;
        const rg = prog(t, t6384, t6384 + 1.2);
        if (rg > 0) s += `<circle cx="${cx}" cy="${cy}" r="${cR}" fill="none" stroke="#3ee08f" stroke-width="3" stroke-dasharray="${2 * Math.PI * cR * rg} 9999" transform="rotate(1.5 ${cx} ${cy})" opacity="${0.9 * a}"/>`;
        const rg2 = prog(t, tCloser, tCloser + 1.2);
        if (rg2 > 0) s += `<circle cx="${cx}" cy="${cy}" r="${eR}" fill="none" stroke="#ffd23f" stroke-width="3" stroke-dasharray="${2 * Math.PI * eR * rg2} 9999" transform="rotate(-28 ${cx} ${cy})" opacity="${0.9 * a}"/>`;
      }
      return s;
    } });
    // diagram labels (screen space, placed from the same geometry)
    const lab = (t0, t1, fnXY, text, sub, color, size = 40) => A.html({ t0, t1, fn(t, a, proj) {
      const [x, y] = fnXY(proj);
      return `<div class="label" style="left:${x}px;top:${y}px;opacity:${a};font-size:${size}px;color:${color || '#fff'}">${text}${sub ? `<span class="sub">${sub}</span>` : ''}</div>`;
    } });
    const P = (proj, latDeg, extra, dx = 0, dy = 0) => { const [cx, cy] = proj.translate(); const R = proj.scale(); const th = latDeg * D; const re = ellR(R, th) + extra; return [cx + Math.cos(th) * re + dx, cy - Math.sin(th) * re + dy]; };
    lab(tBall + 0.5, tSpin + 0.5, p => { const [cx, cy] = p.translate(); return [cx + 90, cy - p.scale() - 40]; }, 'A perfect ball?', '', '#fff', 46);
    lab(tBulge, tRad - 0.2, p => { const [cx, cy] = p.translate(); return [cx + 60, cy + p.scale() * BY + 60]; }, 'The real shape', 'bulge exaggerated · not to scale', '#5ab8ff', 44);
    lab(at('equator', 1) + 0.3, tRad - 0.2, p => { const [cx, cy] = p.translate(); return [cx - p.scale() * 0.55, cy - 34]; }, 'Equator', '', '#ffd23f', 36);
    lab(tRad + 0.8, tEv28 - 0.3, p => { const [cx, cy] = p.translate(); return [cx + p.scale() * 0.55, cy + 40]; }, '6,378 km', 'to the equator', '#ffd23f', 44);
    lab(tRad + 0.8, tEv28 - 0.3, p => { const [cx, cy] = p.translate(); return [cx - 120, cy - p.scale() * 0.55]; }, '6,357 km', 'to the pole', '#fff', 44);
    A.headline({ t0: t21 - 0.1, t1: tEv28 - 0.2, text: '+21 km', sub: 'fatter at the equator than pole to pole', size: 150, y: 150 });
    A.headline({ t0: tSpin - 0.05, t1: t21 - 0.2, text: 'It bulges', sub: 'spin flings the middle outward', size: 140, y: 160, color: '#5ab8ff', subColor: '#fff' });
    A.headline({ t0: tBall - 0.05, t1: tSpin - 0.15, text: 'Not a ball', size: 150, y: 160 });
    lab(tEv28 + 0.3, tSum - 0.2, p => P(p, 28, 44, -150, -30), 'Everest', '28°N', '#ffd23f', 44);
    lab(tCh1 + 0.5, tSum - 0.2, p => P(p, -1.5, 30, -170, 60), 'Chimborazo', '1.5°S', '#3ee08f', 44);
    A.headline({ t0: tEv28 - 0.05, t1: tCh1 - 0.1, text: '28° north', sub: 'Everest · Himalayas', size: 140, y: 160, color: '#ffd23f', subColor: '#fff' });
    A.headline({ t0: tCh1 - 0.05, t1: tMeas - 0.15, text: '1° from the equator', sub: 'Chimborazo rides the bulge', size: 110, y: 170, color: '#3ee08f', subColor: '#fff' });
    A.headline({ t0: tMeas - 0.05, t1: t6384 - 0.1, text: 'From the centre', sub: "measure from Earth's core instead of the sea", size: 120, y: 165 });
    A.headline({ t0: t6384 - 0.05, t1: tCloser - 0.1, text: '', count: { from: 6000, to: 6384.4, dec: 1, t0: t6384, t1: t6384 + 1.6, suffix: ' km' }, sub: "Chimborazo's summit → Earth's centre", size: 140, y: 155, color: '#3ee08f', subColor: '#fff', pop: false });
    A.headline({ t0: tCloser - 0.05, t1: tTall - 0.15, text: 'Everest: 2 km closer', sub: '6,382.3 km vs 6,384.4 km from the centre', size: 110, y: 170, color: '#ffd23f', subColor: '#fff' });
    lab(tSum + 0.4, tMK - 0.5, p => P(p, -1.5, 30, -210, 70), '6,384.4 km', 'Chimborazo', '#3ee08f', 44);
    lab(tCloser + 0.4, tMK - 0.5, p => P(p, 28, 44, -250, -40), '6,382.3 km', 'Everest', '#ffd23f', 44);

    // ---- Mauna Kea: base to peak
    A.pin({ t0: tMK, t1: tThree, ll: MK, color: '#5ab8ff' });
    A.label({ t0: tMK, t1: tThree, ll: MK, dy: -90, text: 'Mauna Kea', sub: 'Hawaii · 4,207 m above sea', size: 56 });
    A.headline({ t0: tTall - 0.05, t1: t10k - 0.1, text: 'Tallest?', sub: 'measured base to peak', size: 150, y: 160 });
    A.headline({ t0: t10k - 0.05, t1: tThree - 0.2, text: '10,000+ m', sub: 'about 10,200 m from the sea floor', size: 150, y: 150, color: '#5ab8ff', subColor: '#fff' });
    // side profile: most of the mountain is below the waterline
    A.svg({ t0: t10k - 0.1, t1: tThree - 0.2, fn(t, a) {
      const x0 = 150, x1 = 930, base = 1330, top = 900, H = base - top;
      const k = prog(t, t10k, t10k + 1.4, 'out');
      const sea = base - H * (5998 / 10205);               // 4,207 m of 10,205 m above water
      const pk = base - H * k;
      const mtn = `M${x0},${base} C${x0 + 180},${base - 40} ${440},${pk + 40} 540,${pk} C${640},${pk + 40} ${x1 - 180},${base - 40} ${x1},${base} Z`;
      return `<g opacity="${a}"><rect x="90" y="${sea}" width="900" height="${base - sea}" fill="#1b5fa8" fill-opacity="0.55"/>` +
        `<path d="${mtn}" fill="#6b5a44" stroke="#fff" stroke-width="3"/>` +
        `<rect x="90" y="${sea}" width="900" height="${base - sea}" fill="#2a7fd6" fill-opacity="0.35"/>` +
        `<line x1="90" y1="${sea}" x2="990" y2="${sea}" stroke="#5ab8ff" stroke-width="4"/>` +
        `<line x1="90" y1="${base}" x2="990" y2="${base}" stroke="#fff" stroke-width="3" stroke-dasharray="8 8"/></g>`;
    } });
    A.label({ t0: t10k + 0.6, t1: tThree - 0.2, xy: [880, 1330 - 440 * 5998 / 10205 - 30], text: 'sea level', size: 30, color: '#5ab8ff' });
    A.label({ t0: t10k + 0.6, t1: tThree - 0.2, xy: [250, 1300], text: 'sea floor', size: 30 });
    A.label({ t0: at('underwater') - 0.1, t1: tThree - 0.2, xy: [540, 1200], text: '~6,000 m underwater', size: 40 });
    A.dim(t10k - 0.1, tThree, 0.55);

    // ---- three records
    A.dim(tThree - 0.1, tEnd, 0.5);
    const rec = [
      { k: 'highest above sea', v: 'Everest', t: tThree, y: 520, rot: -2 },
      { k: 'farthest from the centre', v: 'Chimborazo', t: at('records') + 0.1, y: 760, rot: 2 },
      { k: 'tallest base to peak', v: 'Mauna Kea', t: at('Three', 2), y: 1000, rot: -1.5 },
    ];
    rec.forEach((r, i) => A.html({ t0: r.t, t1: tEnd - 0.1, fn(t, a) {
      const dimOthers = i === 0 ? 1 : 1 - 0.65 * prog(t, tOnly + 0.3, tOnly + 0.9);
      const sc = E.outBack(clamp((t - r.t) / 0.45)) * (i === 0 ? 1 + 0.12 * prog(t, tOnly + 0.3, tOnly + 0.9) : 1);
      return `<div class="card" style="left:540px;top:${r.y}px;opacity:${a * dimOthers};transform:translate(-50%,-50%) scale(${sc}) rotate(${r.rot}deg)"><div class="k">${r.k}</div><div class="v">${r.v}</div></div>`;
    } }));
    rec.forEach(r => A.sfx(r.t, 'pop', 0.5));
    A.headline({ t0: tThree - 0.05, t1: tEnd - 0.1, text: 'Three records', sub: 'three different mountains', size: 130, y: 165 });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the closest point to space', line2: 'Chimborazo, Ecuador.', y: 760 });
  },
};
