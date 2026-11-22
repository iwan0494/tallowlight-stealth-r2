// TALLOWLIGHT game loop and state machine: title, playing, paused, caught,
// level complete and win screens, plus the ?shot= staged scenes used for the
// screenshots. Exposes window.__TL so automated play-tests can read state.
import { LEVELS, WORLD_W, WORLD_H, LAMP_RADIUS } from './config.js';
import { makeGuard, updateGuard, hearNoise } from './guards.js';
import { makePlayer, updatePlayer, throwPebble, updatePebble } from './player.js';
import { makeInput } from './input.js';
import { makeAudio } from './audio.js';
import { makeHud } from './hud.js';
import { render } from './render.js';
import { applyShot } from './shots.js';
import { isLit, inGrass, onCreaky, dist } from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hud = makeHud();
const audio = makeAudio();

const game = {
  levelIndex: 0,
  level: LEVELS[0],
  player: null,
  guards: [],
  state: 'title', // title | playing | paused | caught | level | win
  timer: 0,
  spotted: 0,
  attempts: 1,
  unlocked: 1,
  rings: [],
  pebble: null,
  callouts: [],
  notesOpen: true,
  prompt: null,
  time: 0,
  detectionLabel: 'UNSEEN',
  visibility: 'hidden',
  visibilityLabel: 'HIDDEN',
  wasSuspicious: false,
  wasAlerted: false,
};

game.blockers = () => [...game.level.walls, ...game.level.blockers];
game.solids = () => [...game.level.walls, ...game.level.blockers, ...game.level.lowProps];

game.loadLevel = (i) => {
  game.levelIndex = i;
  game.level = LEVELS[i];
  for (const loot of game.level.loot) loot.taken = false;
  game.player = makePlayer(game.level.start);
  game.guards = game.level.guards.map(makeGuard);
  game.timer = 0;
  game.rings = [];
  game.pebble = null;
  game.callouts = [];
  game.prompt = null;
  game.wasSuspicious = false;
  game.wasAlerted = false;
  game.updateDerived();
};

game.updateDerived = () => {
  const maxSuspicion = Math.max(0, ...game.guards.map((g) => g.suspicion));
  const anyAlerted = game.guards.some((g) => g.state === 'alerted');
  const anySuspicious = game.guards.some((g) => g.state === 'suspicious' || g.state === 'search');
  game.detectionLabel = anyAlerted ? 'ALERTED !' : anySuspicious ? 'SUSPICIOUS ?' : maxSuspicion > 0.05 ? 'SUSPICIOUS ?' : 'UNSEEN';
  const p = game.player;
  if (inGrass(p.x, p.y, game.level.grass)) {
    game.visibility = 'hidden';
    game.visibilityLabel = 'HIDDEN';
  } else if (isLit(p.x, p.y, game.level.lamps, LAMP_RADIUS)) {
    game.visibility = 'lit';
    game.visibilityLabel = 'IN LAMPLIGHT';
  } else {
    game.visibility = 'shadow';
    game.visibilityLabel = 'IN SHADOW';
  }
};

function onNoise(x, y, radius) {
  game.rings.push({ x, y, radius, age: 0 });
  audio.step(radius > 100);
  for (const guard of game.guards) hearNoise(guard, x, y);
}

function tryInteract() {
  const p = game.player;
  if (p.nearLoot) {
    p.nearLoot.taken = true;
    p.loot += 1;
    audio.chime();
    p.nearLoot = null;
    return;
  }
  if (p.nearPrize) {
    p.hasPrize = true;
    audio.prize();
    p.nearPrize = false;
    return;
  }
  if (p.nearExit) {
    completeLevel();
  }
}

function completeLevel() {
  const time = game.timer;
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  const ghost = game.spotted === 0 ? ' — GHOST: never spotted!' : '';
  if (game.levelIndex >= LEVELS.length - 1) {
    hud.setWinSummary(`All three heists done in ${mins}:${String(secs).padStart(2, '0')} on the last job. Loot ${game.player.loot} of ${game.level.loot.length}.${ghost}`);
    game.state = 'win';
    hud.show('win');
  } else {
    hud.setLevelSummary(`${game.level.name} — ${mins}:${String(secs).padStart(2, '0')}, loot ${game.player.loot}/${game.level.loot.length}, spotted ${game.spotted} time(s).${ghost}`);
    game.state = 'level';
    hud.show('level');
  }
  audio.prize();
}

function update(dt) {
  if (game.state !== 'playing') return;
  // Staged screenshot scenes are frozen: the guards hold their poses, the
  // timer stays put and nobody can be caught while the shot is taken.
  if (game.frozen) return;
  game.time += dt;
  game.timer += dt;
  const input = game.input;
  updatePlayer(game.player, dt, input, game.solids(), game.level.creaky, onNoise);
  updatePebble(game.pebble, dt, (x, y) => {
    game.rings.push({ x, y, radius: 150, age: 0 });
    for (const guard of game.guards) hearNoise(guard, x, y);
  });
  for (const ring of game.rings) ring.age += dt * 1.4;
  game.rings = game.rings.filter((r) => r.age < 1);

  // proximity prompts
  const p = game.player;
  p.nearLoot = null;
  for (const loot of game.level.loot) {
    if (!loot.taken && dist(p.x, p.y, loot.x, loot.y) < 30) { p.nearLoot = loot; break; }
  }
  p.nearPrize = !p.hasPrize && dist(p.x, p.y, game.level.prize.x, game.level.prize.y) < 34;
  const ex = game.level.exit;
  p.nearExit = p.hasPrize && p.x > ex.x - 10 && p.x < ex.x + ex.w + 10 && p.y > ex.y - 10 && p.y < ex.y + ex.h + 10;
  game.prompt = p.nearLoot ? 'E — TAKE THE LOOT' : p.nearPrize ? 'E — TAKE THE BRASS MOTH' : p.nearExit ? 'E — SLIP OUT THE HATCH' : null;

  const ctxGuards = {
    player: p,
    blockers: game.blockers(),
    lamps: game.level.lamps,
    grass: game.level.grass,
    solids: game.solids(),
  };
  for (const guard of game.guards) updateGuard(guard, dt, ctxGuards);
  game.updateDerived();

  const anySuspicious = game.guards.some((g) => g.state === 'suspicious' || g.state === 'search');
  const anyAlerted = game.guards.some((g) => g.state === 'alerted');
  if (anySuspicious && !game.wasSuspicious) audio.suspicious();
  if (anyAlerted && !game.wasAlerted) {
    audio.alarm();
    game.spotted += 1;
  }
  game.wasSuspicious = anySuspicious;
  game.wasAlerted = anyAlerted;

  // caught: an alerted warden touches the thief
  for (const guard of game.guards) {
    if (guard.state === 'alerted' && dist(guard.x, guard.y, p.x, p.y) < 20) {
      game.state = 'caught';
      game.attempts += 1;
      audio.alarm();
      hud.show('caught');
      return;
    }
  }

  if (input.consume('KeyE')) tryInteract();
  if (input.consume('KeyH')) {
    game.notesOpen = !game.notesOpen;
    hud.notes.classList.toggle('hidden', !game.notesOpen);
  }
  if (input.consume('KeyM')) audio.toggleMute();
  if (input.consume('Escape')) {
    game.state = 'paused';
    hud.show('paused');
  }
  if (input.consume('KeyR')) {
    game.loadLevel(game.levelIndex);
  }
}

function handleMenus() {
  const input = game.input;
  if (game.state === 'title') {
    if (input.consume('Enter')) {
      audio.ensure();
      game.state = 'playing';
      hud.showNone();
    }
    if (input.consume('Digit1')) { game.loadLevel(0); }
    if (input.consume('Digit2') && game.unlocked >= 2) { game.loadLevel(1); }
    if (input.consume('Digit3') && game.unlocked >= 3) { game.loadLevel(2); }
    return;
  }
  if (game.state === 'paused') {
    if (input.consume('Escape') || input.consume('Enter')) {
      game.state = 'playing';
      hud.showNone();
    }
    if (input.consume('KeyR')) {
      game.loadLevel(game.levelIndex);
      game.state = 'playing';
      hud.showNone();
    }
    return;
  }
  if (game.state === 'caught') {
    if (input.consume('KeyR') || input.consume('Enter')) {
      game.loadLevel(game.levelIndex);
      game.state = 'playing';
      hud.showNone();
    }
    return;
  }
  if (game.state === 'level') {
    if (input.consume('Enter')) {
      game.unlocked = Math.max(game.unlocked, game.levelIndex + 2);
      game.loadLevel(game.levelIndex + 1);
      game.state = 'playing';
      hud.showNone();
    }
    return;
  }
  if (game.state === 'win') {
    if (input.consume('Enter')) {
      game.unlocked = 1;
      game.loadLevel(0);
      game.state = 'title';
      hud.show('title');
    }
  }
}

game.input = makeInput(canvas, (x, y) => {
  audio.ensure();
  if (game.state !== 'playing') return;
  const pebble = throwPebble(game.player, x, y);
  if (pebble) game.pebble = pebble;
});

game.loadLevel(0);
hud.show('title');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  applyShot(game, shot);
  game.frozen = true;
  game.state = 'playing';
  hud.showNone();
  hud.notes.classList.toggle('hidden', !game.notesOpen);
}
hud.notes.classList.toggle('hidden', !game.notesOpen);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  handleMenus();
  update(dt);
  render(ctx, game);
  hud.update(game);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test hook: automated play-tests read live state from here.
window.__TL = game;
