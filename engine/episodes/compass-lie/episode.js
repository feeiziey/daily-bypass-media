// The Compass Lie: the easternmost US land by longitude is Semisopochnoi Island, Alaska (179°46'E).
// Also: Reno west of LA, Santiago east of New York, Panama Canal's Pacific end east of its Atlantic end.
window.EPISODE = {
  build(A) {
    const { at, atEnd, cam, prog, clamp, lerp } = A;
    const YEL = '#ffd23f', RED = '#ff3b4e', GRN = '#3ee08f', BLU = '#5ab8ff';

    const QUODDY = [-66.95, 44.815];          // West Quoddy Head, Maine
    const SEMI = [179.77, 51.96];             // Pochnoi Point, Semisopochnoi
    const AMAT = [-179.15, 51.27];            // Amatignak Island, west point
    const BARROW = [-156.48, 71.39];          // Point Barrow
    const RENO = [-119.81, 39.53], LA = [-118.24, 34.05];
    const NY = [-74.01, 40.71], SCL = [-70.65, -33.45];
    const CANAL = [[-79.92, 9.39], [-79.92, 9.27], [-79.9, 9.21], [-79.8, 9.15], [-79.69, 9.12], [-79.65, 9.07], [-79.61, 9.02], [-79.59, 9.0], [-79.56, 8.95], [-79.54, 8.89]];
    const ATL = CANAL[0], PAC = CANAL[CANAL.length - 1];

    const tAlaska = at('Alaska'), tNot = at('Not'), tAlaska2 = at('Alaska', 2);
    const tFollow = at('Follow'), tAleut = at('Aleutian'), tCross = at('cross'), t180 = at('180°');
    const tFar = at('far'), tWest = at('west', 2), tEast = at('east', 1);
    const tSemi = at('Semisopochnoi'), tHemi = at('Eastern');
    const tMakes = at('makes'), tNorth = at('northernmost'), tWestM = at('westernmost'), tEastM = at('easternmost', 2), tAll = at('All');
    const tMental = at('mental'), tReno = at('Reno'), tWestR = at('west', 3), tSant = at('Santiago'), tEastS = at('east', 2), tNY = at('New York');
    const tSail = at('sail'), tAtl = at('Atlantic'), tPac = at('Pacific'), t40 = at('40'), tEast40 = at('east', 3);
    const tLong = at('Longitude'), tSo = at('So'), tMaine = at('Maine', 2), tPoint = at('point', 2), tVery = at('Very'), tEnd = A.sentence(13).t1 + 1.2;

    // ---- camera
    cam.init({ lon: -105, lat: 42, r: 560, cy: 1020 });
    cam.move(0.2, { r: 610 }, 3.2, 'out', false);
    cam.move(tFollow - 0.2, { lon: -168, lat: 55, r: 1150, cy: 1040 }, 1.6);
    cam.move(tCross + 0.1, { lon: 179.6, lat: 53.5, r: 2600, cy: 1040 }, 1.5, 'inOut', false);
    cam.move(tSemi + 0.1, { lon: -179.75, lat: 51.7, r: 9500, cy: 1000 }, 1.6);
    cam.move(tMakes - 0.2, { lon: -170, lat: 60, r: 1300, cy: 1000 }, 1.5);
    cam.move(tMental - 0.2, { lon: -100, lat: 20, r: 620, cy: 1020 }, 1.4);
    cam.move(tReno - 0.3, { lon: -119, lat: 36.6, r: 5200, cy: 1020 }, 1.3);
    cam.move(tSant - 0.3, { lon: -72.3, lat: 3.6, r: 640, cy: 1000 }, 1.4);
    cam.move(tSail - 0.3, { lon: -79.73, lat: 9.13, r: 20000, cy: 1000 }, 1.6);
    cam.move(tLong - 0.2, { lon: -95, lat: 25, r: 600, cy: 1020 }, 1.5);
    cam.move(tSo - 0.1, { lon: -72, lat: 45, r: 900, cy: 1040 }, 1.2);
    cam.follow(tPoint - 0.2, A.dur, t => ({ lon: -72 - 115 * prog(t, tPoint - 0.2, tVery + 1.6, 'inOut'), lat: lerp(45, 55, prog(t, tPoint, tVery + 1.6)), r: lerp(900, 700, prog(t, tPoint, tVery + 1.6)) }), 0.8);
    cam.move(tEnd, { r: 540, cy: 1060 }, 2.5, 'out', false);

    // ---- hook
    A.headline({ t0: 0.3, t1: tAlaska - 0.15, text: 'Easternmost USA', sub: 'where is it?', size: 130, y: 160 });
    A.pin({ t0: 1.2, t1: tFollow, ll: QUODDY, color: '#ffffff', size: 10 });
    A.label({ t0: 1.2, t1: tFollow, ll: QUODDY, dx: 20, dy: -70, text: 'Maine?', size: 50 });
    A.emoji({ t0: tNot - 0.05, t1: tFollow, ll: QUODDY, dx: 0, dy: 0, char: '❌', size: 90, bob: false });
    A.country({ t0: tAlaska - 0.2, t1: tMental, key: 'United States of America', fill: GRN, fillOpacity: 0.16, stroke: GRN, width: 2.5 });
    A.headline({ t0: tAlaska - 0.1, t1: tFollow - 0.2, text: 'Alaska', sub: 'not maine', size: 170, y: 150, color: GRN, subColor: '#fff' });
    A.emoji({ t0: tAlaska2 - 0.1, t1: tFollow - 0.1, xy: [540, 470], char: '🧭', size: 100 });

    // ---- the Aleutians cross 180
    A.label({ t0: tAleut, t1: tFar, ll: [-172, 51.2], dy: 70, text: 'Aleutian Islands', size: 50 });
    A.arc({ t0: tAleut, t1: tFar, pts: [[-165, 54.4], [-172, 52.2], [-178, 51.6], [178, 51.8], [173.5, 52.8]], color: YEL, width: 5, dash: '4 12', draw: [tAleut + 0.2, t180 + 0.6], head: true });
    A.meridian({ t0: tCross - 0.1, t1: tMakes, lon: 180, color: YEL, width: 5, draw: [tCross, t180 + 0.8] });
    A.label({ t0: t180 - 0.1, t1: tSemi - 0.3, ll: [180, 58.5], dx: 0, text: '180°', size: 64, color: YEL });
    A.headline({ t0: tFollow - 0.1, t1: tFar - 0.2, text: 'Go west', sub: 'along the aleutians', size: 140, y: 160, pop: false });
    A.label({ t0: tWest - 0.1, t1: tSemi + 0.9, ll: [-171.5, 57], text: 'West', sub: 'western hemisphere', size: 70, color: BLU });
    A.label({ t0: tEast - 0.1, t1: tSemi + 0.9, ll: [171.5, 57], text: 'East', sub: 'eastern hemisphere', size: 70, color: GRN });
    A.headline({ t0: tFar - 0.1, t1: tSemi - 0.1, text: 'West → East', sub: 'the 180th meridian', size: 140, y: 160 });

    // ---- Semisopochnoi + Amatignak
    A.pin({ t0: tSemi - 0.1, t1: tMental, ll: SEMI, color: RED, size: 11 });
    A.label({ t0: tSemi - 0.1, t1: tMakes, ll: SEMI, dx: -30, dy: -90, text: 'Semisopochnoi', sub: '179°46′ E', size: 54 });
    A.label({ t0: tSemi, t1: tMakes, ll: [180, 51.1], dx: 14, text: '', sub: '180°', size: 30 });
    A.headline({ t0: tSemi - 0.1, t1: tHemi - 0.15, text: 'Semisopochnoi', sub: 'rat islands · alaska · uninhabited', size: 110, y: 170 });
    A.headline({ t0: tHemi - 0.1, t1: tMakes - 0.2, text: 'Eastern Hemisphere', sub: 'still the united states', size: 104, y: 170, color: GRN, subColor: '#fff' });
    A.pin({ t0: tHemi, t1: tMental, ll: AMAT, color: BLU, size: 10 });
    A.label({ t0: tHemi, t1: tMakes, ll: AMAT, dx: 10, dy: 70, text: 'Amatignak', sub: '179°09′ W', size: 46, color: BLU });

    // ---- three superlatives
    A.pin({ t0: tNorth - 0.1, t1: tMental, ll: BARROW, color: YEL, size: 11 });
    A.label({ t0: tNorth - 0.1, t1: tMental, ll: BARROW, dy: -70, text: 'Northernmost', sub: 'point barrow · 71.4°N', size: 46, color: YEL });
    A.label({ t0: tWestM - 0.1, t1: tMental, ll: AMAT, dx: 150, dy: 60, text: 'Westernmost', sub: 'amatignak · 179.2°W', size: 46, color: BLU });
    A.label({ t0: tEastM - 0.1, t1: tMental, ll: SEMI, dx: -170, dy: -40, text: 'Easternmost', sub: 'semisopochnoi · 179.8°E', size: 46, color: GRN });
    A.headline({ t0: tMakes - 0.1, t1: tAll - 0.15, text: 'One state', sub: 'three extremes', size: 140, y: 160, pop: false });
    A.headline({ t0: tAll - 0.1, t1: tMental - 0.2, text: 'N · W · E', sub: 'all alaska', size: 160, y: 150, color: YEL, subColor: '#fff' });

    // ---- mental map
    A.headline({ t0: tMental - 0.1, t1: tReno - 0.3, text: 'Mental map', sub: 'vs the actual numbers', size: 140, y: 160 });
    for (let lon = -150; lon <= -30; lon += 30) A.meridian({ t0: tMental, t1: tReno - 0.2, lon, color: '#ffffff', width: 2, dash: '4 8', draw: [tMental, tMental + 1.2] });

    // ---- Reno vs LA
    A.meridian({ t0: tReno, t1: tSant - 0.2, lon: RENO[0], color: YEL, width: 4, draw: [tReno, tReno + 0.9] });
    A.meridian({ t0: at('Los'), t1: tSant - 0.2, lon: LA[0], color: BLU, width: 4, draw: [at('Los'), at('Los') + 0.9] });
    A.pin({ t0: tReno, t1: tSant - 0.2, ll: RENO, color: YEL, size: 11 });
    A.label({ t0: tReno, t1: tSant - 0.2, ll: RENO, dx: -40, dy: -70, text: 'Reno', sub: '119.8° W', size: 56, color: YEL });
    A.pin({ t0: at('Los'), t1: tSant - 0.2, ll: LA, color: BLU, size: 11 });
    A.label({ t0: at('Los'), t1: tSant - 0.2, ll: LA, dx: 40, dy: 70, text: 'Los Angeles', sub: '118.2° W', size: 56, color: BLU });
    A.headline({ t0: tReno - 0.1, t1: tSant - 0.2, text: 'Reno: west', sub: 'of los angeles', size: 130, y: 160 });

    // ---- Santiago vs New York
    A.meridian({ t0: tSant, t1: tSail - 0.2, lon: SCL[0], color: GRN, width: 4, draw: [tSant, tSant + 0.9] });
    A.meridian({ t0: tNY - 0.1, t1: tSail - 0.2, lon: NY[0], color: '#fff', width: 4, draw: [tNY - 0.1, tNY + 0.8] });
    A.pin({ t0: tSant, t1: tSail - 0.2, ll: SCL, color: GRN, size: 11 });
    A.label({ t0: tSant, t1: tSail - 0.2, ll: SCL, dx: 110, dy: 0, text: 'Santiago', sub: '70.6° W', size: 52, color: GRN });
    A.pin({ t0: tNY - 0.1, t1: tSail - 0.2, ll: NY, color: '#fff', size: 11 });
    A.label({ t0: tNY - 0.1, t1: tSail - 0.2, ll: NY, dx: -120, dy: 0, text: 'New York', sub: '74.0° W', size: 52 });
    A.headline({ t0: tSant - 0.1, t1: tSail - 0.2, text: 'Santiago: east', sub: 'of new york', size: 120, y: 160 });

    // ---- Panama Canal
    A.dim(tSail - 0.2, tLong - 0.2, 0.15);
    A.arc({ t0: tSail, t1: tLong - 0.2, pts: CANAL, color: YEL, width: 7, draw: [tAtl, tPac + 0.9], n: 300 });
    A.meridian({ t0: tAtl, t1: tLong - 0.2, lon: ATL[0], color: BLU, width: 3, dash: '10 10' });
    A.meridian({ t0: tPac, t1: tLong - 0.2, lon: PAC[0], color: GRN, width: 3, dash: '10 10' });
    A.pin({ t0: tAtl, t1: tLong - 0.2, ll: ATL, color: BLU, size: 11 });
    A.label({ t0: tAtl, t1: tLong - 0.2, ll: ATL, dx: -170, dy: -30, text: 'Atlantic end', sub: 'colón · 79.9° W', size: 50, color: BLU });
    A.pin({ t0: tPac, t1: tLong - 0.2, ll: PAC, color: GRN, size: 11 });
    A.label({ t0: tPac, t1: tLong - 0.2, ll: PAC, dx: 170, dy: 20, text: 'Pacific end', sub: 'balboa · 79.5° W', size: 50, color: GRN });
    A.headline({ t0: tSail - 0.1, t1: t40 - 0.2, text: 'Panama Canal', sub: 'atlantic → pacific', size: 130, y: 160 });
    A.headline({ t0: t40 - 0.1, t1: tLong - 0.2, text: '', count: { from: 0, to: 40, t0: t40, t1: t40 + 0.9, prefix: '≈ ', suffix: ' km east' }, sub: 'pacific end vs atlantic end', size: 130, y: 160, color: YEL, subColor: '#fff' });
    A.arc({ t0: tEast40 - 0.1, t1: tLong - 0.2, pts: [[ATL[0], 8.78], [PAC[0], 8.78]], color: '#fff', width: 5, draw: [tEast40 - 0.1, tEast40 + 0.6] });
    A.label({ t0: tEast40, t1: tLong - 0.2, ll: [(ATL[0] + PAC[0]) / 2, 8.78], dy: 45, text: 'east →', size: 44 });

    // ---- loop back: point them west
    A.headline({ t0: tLong - 0.1, t1: tSo - 0.2, text: 'Longitude wins', sub: 'coastlines lie', size: 130, y: 160 });
    for (let lon = -180; lon < 180; lon += 30) A.meridian({ t0: tLong, t1: tSo, lon, color: '#ffffff', width: 2, dash: '4 8', draw: [tLong, tLong + 1.0] });
    A.pin({ t0: tMaine - 0.1, t1: tEnd, ll: QUODDY, color: '#fff', size: 10 });
    A.label({ t0: tMaine - 0.1, t1: tPoint + 0.6, ll: QUODDY, dy: -70, text: 'Maine', size: 52 });
    A.arc({ t0: tPoint - 0.1, t1: A.dur + 1, pts: [QUODDY, [-110, 58], [-160, 58], SEMI], color: YEL, width: 7, draw: [tPoint, tVery + 1.4], fo: 0 });
    A.pin({ t0: tVery + 1.2, t1: A.dur + 1, ll: SEMI, color: GRN, size: 11, fo: 0 });
    A.headline({ t0: tPoint - 0.1, t1: tVery - 0.15, text: 'Point west', sub: 'to find the east', size: 140, y: 160 });
    A.headline({ t0: tVery - 0.1, t1: tEnd, text: 'Very far west', sub: 'semisopochnoi · 179°46′ e', size: 130, y: 160, color: GRN, subColor: '#fff' });

    A.dim(tEnd, A.dur + 1, 0.55);
    A.endcard({ t0: tEnd, tag: 'the easternmost point of the usa', line2: "It's in Alaska.", y: 760 });
  },
};
