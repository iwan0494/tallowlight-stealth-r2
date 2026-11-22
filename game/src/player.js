// The thief: movement, sneaking, pebble throws and footstep noise.
import { PLAYER_RADIUS } from './config.js';
import { moveCircle, onCreaky } from './world.js';

export function makePlayer(start) {
  return {
    x: start.x, y: start.y, dir: -Math.PI / 2,
    sneaking: false, running: false,
    pebbles: 5, loot: 0, hasPrize: false,
    stepTimer: 0, pebbleCooldown: 0,
    nearLoot: null, nearPrize: false, nearExit: false,
  };
}

export function updatePlayer(player, dt, input, solids, creaky, onNoise) {
  let mx = 0;
  let my = 0;
  if (input.left) mx -= 1;
  if (input.right) mx += 1;
  if (input.up) my -= 1;
  if (input.down) my += 1;
  const moving = mx !== 0 || my !== 0;
  player.sneaking = !!input.sneak && moving;
  player.running = moving && !player.sneaking;
  const speed = player.sneaking ? 85 : 150;
  if (moving) {
    const len = Math.hypot(mx, my);
    const dx = (mx / len) * speed * dt;
    const dy = (my / len) * speed * dt;
    player.dir = Math.atan2(dy, dx);
    moveCircle(player, dx, dy, PLAYER_RADIUS, solids);
    player.stepTimer -= dt;
    if (player.stepTimer <= 0) {
      const loud = onCreaky(player.x, player.y, creaky);
      if (loud) {
        onNoise(player.x, player.y, 130);
      } else if (!player.sneaking) {
        onNoise(player.x, player.y, 45);
      }
      player.stepTimer = player.sneaking ? 0.55 : 0.4;
    }
  }
  if (player.pebbleCooldown > 0) player.pebbleCooldown -= dt;
  return moving;
}

// Returns a pebble flight object, or null when no pebble is left / on cooldown.
export function throwPebble(player, tx, ty) {
  if (player.pebbles <= 0 || player.pebbleCooldown > 0) return null;
  player.pebbles -= 1;
  player.pebbleCooldown = 0.4;
  const dx = tx - player.x;
  const dy = ty - player.y;
  const d = Math.hypot(dx, dy);
  const range = Math.min(d, 260);
  const nx = d > 0 ? dx / d : 0;
  const ny = d > 0 ? dy / d : 0;
  return {
    x: player.x, y: player.y,
    lx: player.x + nx * range, ly: player.y + ny * range,
    t: 0, flight: 0.35, landed: false, ring: 0,
  };
}

export function updatePebble(pebble, dt, onLand) {
  if (!pebble || pebble.landed) return;
  pebble.t += dt;
  const k = Math.min(1, pebble.t / pebble.flight);
  pebble.x = pebble.x + (pebble.lx - pebble.x) * k;
  pebble.y = pebble.y + (pebble.ly - pebble.y) * k;
  if (k >= 1) {
    pebble.landed = true;
    pebble.ring = 0;
    onLand(pebble.lx, pebble.ly);
  }
}
