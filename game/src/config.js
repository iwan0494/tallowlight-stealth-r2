// Level data for TALLOWLIGHT: three heists, three different floor plans.
// Coordinates are canvas pixels (1280 x 628). Walls, shelves and crates block
// sight and movement; counters and tables block movement only (low cover);
// rugs, lamps, grass and creaky boards are floor features, not solid.

export const WORLD_W = 1280;
export const WORLD_H = 628;
export const CONE_RANGE = 235;
export const CONE_HALF_ANGLE = 0.55;
export const LAMP_RADIUS = 150;
export const PLAYER_RADIUS = 11;
export const GUARD_RADIUS = 12;

function borderWalls() {
  return [
    { x: 0, y: 0, w: 1280, h: 14 },
    { x: 0, y: 614, w: 1280, h: 14 },
    { x: 0, y: 0, w: 14, h: 628 },
    { x: 1266, y: 0, w: 14, h: 628 },
  ];
}

export const LEVELS = [
  {
    name: "HEIST 1 — THE CHANDLER'S SHOP",
    objective: 'STEAL THE BRASS MOTH',
    start: { x: 110, y: 580 },
    exit: { x: 40, y: 560, w: 44, h: 44 },
    prize: { x: 1150, y: 180 },
    walls: [
      ...borderWalls(),
      { x: 600, y: 14, w: 14, h: 266 },
      { x: 600, y: 360, w: 14, h: 254 },
    ],
    // sight-blocking props: shelves and crates
    blockers: [
      { x: 90, y: 120, w: 180, h: 26, kind: 'shelf' },
      { x: 320, y: 120, w: 180, h: 26, kind: 'shelf' },
      { x: 90, y: 300, w: 180, h: 26, kind: 'shelf' },
      { x: 320, y: 430, w: 180, h: 26, kind: 'shelf' },
      { x: 1000, y: 110, w: 200, h: 26, kind: 'shelf' },
      { x: 1000, y: 480, w: 200, h: 26, kind: 'shelf' },
      { x: 760, y: 110, w: 64, h: 64, kind: 'crate' },
      { x: 880, y: 110, w: 64, h: 64, kind: 'crate' },
      { x: 760, y: 430, w: 64, h: 64, kind: 'crate' },
      { x: 1040, y: 300, w: 64, h: 64, kind: 'crate' },
    ],
    // low props: block movement, not sight
    lowProps: [
      { x: 120, y: 500, w: 220, h: 34, kind: 'counter' },
    ],
    grass: [
      { x: 40, y: 180, w: 90, h: 60 },
      { x: 1140, y: 360, w: 90, h: 60 },
    ],
    creaky: [
      { x: 330, y: 540, w: 220, h: 26 },
      { x: 800, y: 300, w: 120, h: 26 },
    ],
    rugs: [
      { x: 180, y: 200, w: 200, h: 120, color: '#5b2a35' },
      { x: 850, y: 180, w: 220, h: 130, color: '#2a3a5b' },
    ],
    lamps: [
      { x: 120, y: 80 }, { x: 540, y: 90 }, { x: 700, y: 540 },
      { x: 1180, y: 90 }, { x: 1150, y: 540 },
    ],
    loot: [
      { x: 200, y: 80 }, { x: 430, y: 90 }, { x: 150, y: 250 }, { x: 480, y: 250 },
      { x: 250, y: 470 }, { x: 520, y: 560 }, { x: 820, y: 80 }, { x: 960, y: 200 },
      { x: 820, y: 560 }, { x: 1120, y: 250 },
    ],
    guards: [
      { waypoints: [[300, 200], [520, 200], [520, 380], [300, 380]] },
      { waypoints: [[150, 480], [560, 480], [560, 560], [400, 560], [400, 480]] },
      { waypoints: [[700, 200], [1180, 200], [1180, 260], [700, 260]] },
      { waypoints: [[860, 440], [1180, 440], [1180, 560], [860, 560]] },
      { waypoints: [[640, 320], [760, 320], [760, 420], [640, 420]] },
    ],
  },
  {
    name: "HEIST 2 — THE GILDED ARCHIVE",
    objective: 'STEAL THE BRASS MOTH',
    start: { x: 110, y: 580 },
    exit: { x: 40, y: 560, w: 44, h: 44 },
    prize: { x: 490, y: 162 },
    walls: [...borderWalls()],
    blockers: [
      { x: 300, y: 60, w: 26, h: 220, kind: 'shelf' },
      { x: 300, y: 340, w: 26, h: 220, kind: 'shelf' },
      { x: 620, y: 60, w: 26, h: 220, kind: 'shelf' },
      { x: 620, y: 340, w: 26, h: 220, kind: 'shelf' },
      { x: 940, y: 60, w: 26, h: 220, kind: 'shelf' },
      { x: 940, y: 340, w: 26, h: 220, kind: 'shelf' },
      { x: 60, y: 80, w: 56, h: 56, kind: 'crate' },
      { x: 60, y: 480, w: 56, h: 56, kind: 'crate' },
      { x: 1180, y: 80, w: 56, h: 56, kind: 'crate' },
      { x: 1180, y: 480, w: 56, h: 56, kind: 'crate' },
    ],
    lowProps: [
      { x: 430, y: 140, w: 120, h: 44, kind: 'table' },
      { x: 750, y: 430, w: 120, h: 44, kind: 'table' },
      { x: 1100, y: 140, w: 120, h: 44, kind: 'table' },
    ],
    grass: [
      { x: 40, y: 280, w: 80, h: 60 },
      { x: 1160, y: 280, w: 80, h: 60 },
    ],
    creaky: [
      { x: 450, y: 300, w: 160, h: 26 },
      { x: 800, y: 300, w: 160, h: 26 },
    ],
    rugs: [
      { x: 400, y: 180, w: 240, h: 120, color: '#2a3a5b' },
      { x: 760, y: 360, w: 240, h: 120, color: '#5b2a35' },
    ],
    lamps: [
      { x: 180, y: 90 }, { x: 480, y: 90 }, { x: 800, y: 90 }, { x: 1100, y: 90 },
      { x: 180, y: 540 }, { x: 800, y: 540 }, { x: 1100, y: 540 },
    ],
    loot: [
      { x: 180, y: 150 }, { x: 180, y: 450 }, { x: 480, y: 150 }, { x: 480, y: 450 },
      { x: 800, y: 150 }, { x: 800, y: 450 }, { x: 1100, y: 150 }, { x: 1100, y: 450 },
      { x: 340, y: 310 }, { x: 660, y: 310 }, { x: 980, y: 310 }, { x: 180, y: 310 },
    ],
    guards: [
      { waypoints: [[180, 120], [180, 520], [260, 520], [260, 120]] },
      { waypoints: [[480, 120], [480, 520], [560, 520], [560, 120]] },
      { waypoints: [[800, 120], [800, 400], [880, 400], [880, 120]] },
      { waypoints: [[1060, 120], [1060, 520], [1180, 520], [1180, 120]] },
      { waypoints: [[340, 310], [900, 310], [900, 360], [340, 360]] },
      { waypoints: [[180, 580], [1100, 580]] },
    ],
  },
  {
    name: "HEIST 3 — THE CLOCKMAKER'S VAULT",
    objective: 'STEAL THE BRASS MOTH',
    start: { x: 110, y: 580 },
    exit: { x: 618, y: 560, w: 44, h: 44 },
    prize: { x: 640, y: 270 },
    walls: [
      ...borderWalls(),
      { x: 440, y: 120, w: 400, h: 14 },
      { x: 440, y: 120, w: 14, h: 300 },
      { x: 826, y: 120, w: 14, h: 300 },
      { x: 440, y: 420, w: 160, h: 14 },
      { x: 640, y: 420, w: 200, h: 14 },
    ],
    blockers: [
      { x: 540, y: 220, w: 36, h: 36, kind: 'pillar' },
      { x: 700, y: 220, w: 36, h: 36, kind: 'pillar' },
      { x: 540, y: 320, w: 36, h: 36, kind: 'pillar' },
      { x: 700, y: 320, w: 36, h: 36, kind: 'pillar' },
      { x: 80, y: 80, w: 56, h: 56, kind: 'crate' },
      { x: 1140, y: 80, w: 56, h: 56, kind: 'crate' },
      { x: 80, y: 500, w: 56, h: 56, kind: 'crate' },
      { x: 1140, y: 500, w: 56, h: 56, kind: 'crate' },
    ],
    lowProps: [
      { x: 200, y: 140, w: 140, h: 44, kind: 'table' },
      { x: 940, y: 140, w: 140, h: 44, kind: 'table' },
      { x: 200, y: 440, w: 140, h: 44, kind: 'table' },
      { x: 940, y: 440, w: 140, h: 44, kind: 'table' },
    ],
    grass: [
      { x: 40, y: 280, w: 80, h: 60 },
      { x: 1160, y: 280, w: 80, h: 60 },
    ],
    creaky: [
      { x: 300, y: 300, w: 140, h: 26 },
      { x: 860, y: 300, w: 140, h: 26 },
    ],
    rugs: [
      { x: 520, y: 180, w: 240, h: 120, color: '#5b2a35' },
      { x: 120, y: 280, w: 160, h: 100, color: '#2a3a5b' },
    ],
    lamps: [
      { x: 640, y: 270 }, { x: 200, y: 90 }, { x: 1080, y: 90 },
      { x: 200, y: 540 }, { x: 1080, y: 540 }, { x: 640, y: 560 },
    ],
    loot: [
      { x: 200, y: 220 }, { x: 200, y: 360 }, { x: 1080, y: 220 }, { x: 1080, y: 360 },
      { x: 480, y: 80 }, { x: 800, y: 80 }, { x: 480, y: 560 }, { x: 800, y: 560 },
      { x: 640, y: 180 }, { x: 640, y: 360 },
    ],
    guards: [
      { waypoints: [[500, 180], [780, 180], [780, 380], [500, 380]] },
      { waypoints: [[600, 470], [680, 470], [680, 540], [600, 540]] },
      { waypoints: [[180, 120], [180, 520], [380, 520], [380, 120]] },
      { waypoints: [[900, 120], [900, 520], [1100, 520], [1100, 120]] },
      { waypoints: [[420, 70], [860, 70]] },
      { waypoints: [[480, 90], [800, 90], [800, 470], [480, 470]] },
    ],
  },
];

export const TOTAL_GUARDS = LEVELS.reduce((n, l) => n + l.guards.length, 0);
export const TOTAL_LOOT = LEVELS.reduce((n, l) => n + l.loot.length, 0);
