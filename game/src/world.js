// Pure geometry for TALLOWLIGHT: collision, line of sight and raycasts.
// No DOM here, so Node can import this file for logic tests.

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function circleHitsRect(cx, cy, radius, r) {
  const nx = Math.max(r.x, Math.min(cx, r.x + r.w));
  const ny = Math.max(r.y, Math.min(cy, r.y + r.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < radius * radius;
}

// Slab test: does segment (x1,y1)-(x2,y2) touch rect r? A segment that runs
// parallel outside a slab never touches it; a segment starting inside the
// rect counts as a hit.
export function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tmin = 0;
  let tmax = 1;
  if (Math.abs(dx) < 1e-9) {
    if (x1 < r.x || x1 > r.x + r.w) return false;
  } else {
    let t1 = (r.x - x1) / dx;
    let t2 = (r.x + r.w - x1) / dx;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  if (Math.abs(dy) < 1e-9) {
    if (y1 < r.y || y1 > r.y + r.h) return false;
  } else {
    let t1 = (r.y - y1) / dy;
    let t2 = (r.y + r.h - y1) / dy;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    tmin = Math.max(tmin, t1);
    tmax = Math.min(tmax, t2);
    if (tmin > tmax) return false;
  }
  return true;
}

export function losClear(ax, ay, bx, by, blockers) {
  for (const r of blockers) {
    if (segmentHitsRect(ax, ay, bx, by, r)) return false;
  }
  return true;
}

// Cast one ray from (x,y) along angle; stop at the first blocker or maxDist.
// Steps in small increments and backs up one step so the endpoint sits just
// short of the wall instead of inside it.
export function raycast(x, y, angle, maxDist, blockers) {
  const step = 6;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let d = 0;
  while (d < maxDist) {
    d += step;
    const px = x + cos * d;
    const py = y + sin * d;
    for (const r of blockers) {
      if (pointInRect(px, py, r)) {
        const hit = Math.max(0, d - step);
        return { x: x + cos * hit, y: y + sin * hit, dist: hit };
      }
    }
  }
  return { x: x + cos * maxDist, y: y + sin * maxDist, dist: maxDist };
}

// Move a circle axis by axis so it slides along walls instead of sticking.
export function moveCircle(pos, dx, dy, radius, solids) {
  let nx = pos.x + dx;
  let blocked = false;
  for (const r of solids) {
    if (circleHitsRect(nx, pos.y, radius, r)) { blocked = true; break; }
  }
  if (!blocked) pos.x = nx;
  let ny = pos.y + dy;
  blocked = false;
  for (const r of solids) {
    if (circleHitsRect(pos.x, ny, radius, r)) { blocked = true; break; }
  }
  if (!blocked) pos.y = ny;
}

export function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function isLit(x, y, lamps, radius) {
  for (const lamp of lamps) {
    if (dist(x, y, lamp.x, lamp.y) < radius) return true;
  }
  return false;
}

export function inGrass(x, y, grass) {
  for (const g of grass) {
    if (pointInRect(x, y, g)) return true;
  }
  return false;
}

export function onCreaky(x, y, creaky) {
  for (const c of creaky) {
    if (pointInRect(x, y, c)) return true;
  }
  return false;
}
