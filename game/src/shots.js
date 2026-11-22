// Deterministic staged scenes for the four screenshots. Each shot loads a
// different heist, places the thief and the wardens by hand, sets a realistic
// (non-zero, varied) timer and loot count, and adds callouts whose boxes the
// renderer clamps inside the canvas. Callout rows are spaced apart so no two
// labels overlap.

function setGuard(game, i, x, y, dir, state, suspicion) {
  const g = game.guards[i];
  if (!g) return;
  g.x = x; g.y = y; g.dir = dir; g.state = state; g.suspicion = suspicion;
  g.see = 0; g.investigate = null; g.lookTimer = 0; g.blindTimer = 0;
}

function takeLoot(game, n) {
  game.level.loot.forEach((loot, i) => { loot.taken = i < n; });
  game.player.loot = n;
}

const SHOTS = {
  // Heist 1: the thief hidden in a planter while cones cross the shop.
  cover(game) {
    game.loadLevel(0);
    game.timer = 83;
    takeLoot(game, 3);
    // the thief hides in the right-hand planter: the left one sits behind
    // the field-notes panel on screen, so the player would be invisible there
    game.player.x = 1185; game.player.y = 390; game.player.dir = Math.PI;
    game.player.pebbles = 5;
    setGuard(game, 0, 350, 200, 0, 'calm', 0);
    setGuard(game, 1, 500, 480, -Math.PI / 2, 'calm', 0);
    setGuard(game, 2, 900, 200, Math.PI, 'calm', 0);
    setGuard(game, 3, 1000, 500, Math.PI / 2, 'calm', 0);
    setGuard(game, 4, 700, 360, 0, 'calm', 0);
    game.notesOpen = true;
    // labels stay clear of the field-notes panel (x < 330, y < 380)
    game.callouts = [
      { ax: 200, ay: 80, bx: 560, by: 56, text: 'LOOT: gold diamonds — grab them quietly' },
      { ax: 350, ay: 200, bx: 480, by: 150, text: 'WARDEN + VISION CONE (what they see)' },
      { ax: 1150, ay: 180, bx: 1010, by: 120, text: 'PRIZE: THE BRASS MOTH' },
      { ax: 1180, ay: 90, bx: 1010, by: 200, text: 'LAMPLIGHT: seen from across the room' },
      { ax: 1185, ay: 390, bx: 900, by: 460, text: 'YOU: hidden in the planter — the cone cannot reach you here' },
      { ax: 62, ay: 582, bx: 300, by: 592, text: 'EXIT HATCH — opens once you hold the prize' },
    ];
  },
  // Heist 2: a pebble lands, a warden turns, the thief waits in lamplight.
  play(game) {
    game.loadLevel(1);
    game.timer = 147;
    takeLoot(game, 5);
    game.player.x = 760; game.player.y = 470; game.player.dir = -Math.PI / 2;
    game.player.pebbles = 4;
    setGuard(game, 0, 220, 300, 0, 'calm', 0);
    setGuard(game, 1, 560, 320, 0.6, 'suspicious', 0.55);
    setGuard(game, 2, 840, 200, Math.PI / 2, 'calm', 0);
    setGuard(game, 3, 1120, 300, Math.PI, 'calm', 0);
    setGuard(game, 4, 600, 340, -Math.PI / 2, 'calm', 0);
    setGuard(game, 5, 500, 580, 0, 'calm', 0);
    game.guards[1].investigate = { x: 620, y: 380 };
    game.pebble = { x: 620, y: 380, lx: 620, ly: 380, t: 1, flight: 0.35, landed: true, ring: 0 };
    game.rings = [{ x: 620, y: 380, radius: 90, age: 0.4 }];
    game.notesOpen = false;
    game.callouts = [
      { ax: 620, ay: 380, bx: 720, by: 300, text: 'NOISE — guards come to look' },
      { ax: 560, ay: 320, bx: 560, by: 260, text: '? HEARD THE PEBBLE — off to look' },
      { ax: 560, ay: 320, bx: 760, by: 420, text: '"What was that?"' },
      { ax: 760, ay: 470, bx: 700, by: 530, text: 'IN LAMPLIGHT — seen from afar' },
      { ax: 760, ay: 470, bx: 420, by: 580, text: 'SNEAK: slower, quieter, harder to see' },
    ];
  },
  // Heist 3: the thief holds still in tall grass as a cone sweeps past.
  hide(game) {
    game.loadLevel(2);
    game.timer = 203;
    takeLoot(game, 7);
    game.player.x = 80; game.player.y = 310; game.player.dir = 0;
    game.player.pebbles = 5;
    setGuard(game, 0, 640, 300, Math.PI / 2, 'calm', 0);
    setGuard(game, 1, 640, 500, -Math.PI / 2, 'calm', 0);
    setGuard(game, 2, 200, 180, 1.35, 'calm', 0);
    setGuard(game, 3, 1000, 200, Math.PI / 2, 'calm', 0);
    setGuard(game, 4, 640, 70, 0, 'calm', 0);
    setGuard(game, 5, 480, 200, Math.PI, 'calm', 0);
    game.notesOpen = false;
    game.callouts = [
      { ax: 200, ay: 180, bx: 420, by: 230, text: 'THE CONE SWEEPS PAST — hold still' },
      { ax: 80, ay: 310, bx: 300, by: 360, text: 'TALL GRASS — hidden unless a warden is close' },
      { ax: 640, ay: 270, bx: 640, by: 150, text: 'PRIZE: THE BRASS MOTH — inside the vault' },
      { ax: 640, ay: 582, bx: 640, by: 500, text: 'EXIT HATCH — still locked' },
    ];
  },
  // Heist 3: the prize is secured, the hatch is open, one last cone to time.
  exit(game) {
    game.loadLevel(2);
    game.timer = 241;
    takeLoot(game, 9);
    game.player.hasPrize = true;
    game.player.x = 640; game.player.y = 540; game.player.dir = Math.PI / 2;
    game.player.pebbles = 5;
    setGuard(game, 0, 700, 320, Math.PI, 'calm', 0);
    setGuard(game, 1, 680, 470, 2.6, 'suspicious', 0.5);
    setGuard(game, 2, 280, 200, 0, 'calm', 0);
    setGuard(game, 3, 1000, 400, -Math.PI / 2, 'calm', 0);
    setGuard(game, 4, 500, 70, 0, 'calm', 0);
    setGuard(game, 5, 480, 200, Math.PI / 2, 'calm', 0);
    game.notesOpen = false;
    game.callouts = [
      { ax: 640, ay: 270, bx: 640, by: 180, text: 'PRIZE SECURED: THE BRASS MOTH ✓' },
      { ax: 640, ay: 582, bx: 420, by: 520, text: 'EXIT HATCH OPEN' },
      { ax: 680, ay: 470, bx: 900, by: 420, text: 'ONE LAST CONE — time your exit' },
      { ax: 1080, ay: 90, bx: 980, by: 150, text: 'LOOT: 9 of 10 — the last diamonds can wait' },
    ];
  },
};

export function applyShot(game, name) {
  const shot = SHOTS[name];
  if (!shot) return false;
  game.rings = [];
  game.pebble = null;
  game.callouts = [];
  game.spotted = 0;
  shot(game);
  game.updateDerived();
  return true;
}

export function shotNames() {
  return Object.keys(SHOTS);
}
