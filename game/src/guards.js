// Warden AI for TALLOWLIGHT: patrol, suspicion, investigation, chase.
// Pure math where possible so Node logic tests can drive it without a browser.
import { CONE_RANGE, CONE_HALF_ANGLE, LAMP_RADIUS, GUARD_RADIUS } from './config.js';
import { losClear, moveCircle, isLit, inGrass, angleDiff, dist } from './world.js';

export function makeGuard(def) {
  const [sx, sy] = def.waypoints[0];
  return {
    x: sx, y: sy, dir: 0,
    waypoints: def.waypoints.map(([x, y]) => ({ x, y })),
    wpIndex: 1,
    state: 'calm', // calm | suspicious | alerted | search
    suspicion: 0,
    see: 0,
    lastSeen: null,
    investigate: null,
    lookTimer: 0,
    blindTimer: 0,
    pauseTimer: 0,
    speed: 55,
  };
}

// How clearly this warden sees the player right now, 0 (not at all) to 1
// (dead centre of the cone, lit, close). 0 when outside the cone or when a
// wall or crate blocks the line of sight.
export function computeSee(guard, player, blockers, lamps, grass) {
  const d = dist(guard.x, guard.y, player.x, player.y);
  if (d > CONE_RANGE) return 0;
  const angleTo = Math.atan2(player.y - guard.y, player.x - guard.x);
  if (Math.abs(angleDiff(angleTo, guard.dir)) > CONE_HALF_ANGLE) return 0;
  if (!losClear(guard.x, guard.y, player.x, player.y, blockers)) return 0;
  let see = 1 - d / CONE_RANGE;
  see = 0.25 + see * 0.75;
  if (!isLit(player.x, player.y, lamps, LAMP_RADIUS)) see *= 0.55;
  if (inGrass(player.x, player.y, grass) && d > 70) see *= 0.25;
  if (player.sneaking) see *= 0.7;
  if (player.running) see *= 1.25;
  return Math.min(1, see);
}

export function hearNoise(guard, x, y) {
  const d = dist(guard.x, guard.y, x, y);
  if (d > 220) return;
  guard.investigate = { x, y };
  guard.suspicion = Math.max(guard.suspicion, 0.4);
  if (guard.state === 'calm') guard.state = 'suspicious';
}

function walkToward(guard, tx, ty, speed, dt, solids) {
  const dx = tx - guard.x;
  const dy = ty - guard.y;
  const d = Math.hypot(dx, dy);
  if (d < 4) return true;
  const step = Math.min(speed * dt, d);
  const nx = (dx / d) * step;
  const ny = (dy / d) * step;
  guard.dir = Math.atan2(dy, dx);
  moveCircle(guard, nx, ny, GUARD_RADIUS, solids);
  return Math.hypot(tx - guard.x, ty - guard.y) < 6;
}

export function updateGuard(guard, dt, ctx) {
  const { player, blockers, lamps, grass, solids } = ctx;
  guard.see = computeSee(guard, player, blockers, lamps, grass);
  if (guard.see > 0.05) {
    guard.suspicion = Math.min(1, guard.suspicion + guard.see * dt * 0.75);
    guard.lastSeen = { x: player.x, y: player.y };
    guard.blindTimer = 0;
  } else {
    // Recovery is a reward for hiding well, not just for breaking line of
    // sight: suspicion drains fast in tall grass, at a middling pace in
    // shadow, and barely at all while the thief stands lit in the open.
    // Play-testing showed a flat drain left a near-miss warden camping on
    // the last-seen spot for ~5s no matter where the thief hid.
    const hidden = inGrass(player.x, player.y, grass);
    const lit = isLit(player.x, player.y, lamps, LAMP_RADIUS);
    const drain = hidden ? 0.55 : lit ? 0.12 : 0.3;
    guard.suspicion = Math.max(0, guard.suspicion - dt * drain);
    guard.blindTimer += dt;
  }

  if (guard.suspicion >= 1) {
    if (guard.state !== 'alerted') guard.state = 'alerted';
  } else if (guard.suspicion >= 0.35 && guard.state === 'calm') {
    guard.state = 'suspicious';
    guard.investigate = guard.lastSeen
      ? { ...guard.lastSeen }
      : guard.investigate;
  }

  if (guard.state === 'alerted') {
    if (guard.see > 0.05) {
      // eyes on the thief: chase the real position
      walkToward(guard, player.x, player.y, 135, dt, solids);
    } else if (guard.blindTimer > 2.5) {
      guard.state = 'search';
      guard.investigate = guard.lastSeen ? { ...guard.lastSeen } : null;
      guard.lookTimer = 0;
    } else if (guard.lastSeen) {
      // lost sight: run to where the thief was last seen, not to where
      // the thief is now — breaking line of sight must let you recover
      walkToward(guard, guard.lastSeen.x, guard.lastSeen.y, 135, dt, solids);
    }
    return;
  }

  if (guard.state === 'suspicious' || guard.state === 'search') {
    if (guard.investigate) {
      const arrived = walkToward(guard, guard.investigate.x, guard.investigate.y, 78, dt, solids);
      if (arrived) {
        guard.lookTimer += dt;
        guard.dir += dt * 1.6;
        if (guard.lookTimer > 2) {
          guard.state = 'calm';
          guard.investigate = null;
          guard.lookTimer = 0;
        }
      }
    } else {
      guard.state = 'calm';
    }
    if (guard.suspicion < 0.3 && guard.state !== 'alerted') {
      guard.state = 'calm';
      guard.investigate = null;
    }
    return;
  }

  // calm: walk the patrol loop, pausing briefly at each waypoint
  if (guard.pauseTimer > 0) {
    guard.pauseTimer -= dt;
    return;
  }
  const wp = guard.waypoints[guard.wpIndex];
  const arrived = walkToward(guard, wp.x, wp.y, 55, dt, solids);
  if (arrived) {
    guard.wpIndex = (guard.wpIndex + 1) % guard.waypoints.length;
    guard.pauseTimer = 0.6;
  }
}
