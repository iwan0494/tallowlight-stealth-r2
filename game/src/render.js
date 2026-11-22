// Canvas drawing for TALLOWLIGHT: floor, lamplight, raycast vision cones,
// props, actors and the annotated callouts. Every label is clamped fully
// inside the canvas so no text is ever clipped at an edge.
import { WORLD_W, WORLD_H, CONE_RANGE, CONE_HALF_ANGLE, LAMP_RADIUS } from './config.js';
import { raycast, pointInRect } from './world.js';

const CONE_RAYS = 26;

function conePolygon(guard, blockers) {
  const pts = [{ x: guard.x, y: guard.y }];
  for (let i = 0; i <= CONE_RAYS; i++) {
    const a = guard.dir - CONE_HALF_ANGLE + (2 * CONE_HALF_ANGLE * i) / CONE_RAYS;
    const hit = raycast(guard.x, guard.y, a, CONE_RANGE, blockers);
    pts.push({ x: hit.x, y: hit.y });
  }
  return pts;
}

// Draw one text label with a leader line to (ax, ay). The box is measured
// and clamped on both axes with a margin, so it can never run off the canvas
// or overlap the top HUD area; callers keep callouts apart from each other.
export function drawLabel(ctx, text, ax, ay, bx, by) {
  ctx.font = 'bold 13px Georgia, serif';
  const pad = 6;
  const w = ctx.measureText(text).width + pad * 2;
  const h = 22;
  let x = Math.max(8, Math.min(bx - w / 2, WORLD_W - w - 8));
  let y = Math.max(8, Math.min(by - h / 2, WORLD_H - h - 8));
  ctx.strokeStyle = 'rgba(232, 221, 196, 0.85)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(x + w / 2, y + h / 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(10, 13, 28, 0.92)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#e8ddc4';
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#f2e6b8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + pad, y + h / 2 + 0.5);
}

function drawShelf(ctx, r) {
  ctx.fillStyle = '#3a2a1c';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = '#6b4f2a';
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  const colors = ['#c0392b', '#2980b9', '#27ae60', '#f2c14e', '#8e44ad', '#e67e22'];
  const n = Math.floor(r.w / 14);
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = colors[(i + Math.floor(r.x / 40)) % colors.length];
    if (r.w > r.h) ctx.fillRect(r.x + 4 + i * 14, r.y + 4, 9, r.h - 8);
    else ctx.fillRect(r.x + 4, r.y + 4 + i * 14, r.w - 8, 9);
  }
}

function drawCrate(ctx, r) {
  ctx.fillStyle = '#7a5a2e';
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = '#4a3416';
  ctx.lineWidth = 2;
  ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  ctx.beginPath();
  ctx.moveTo(r.x + 4, r.y + 4);
  ctx.lineTo(r.x + r.w - 4, r.y + r.h - 4);
  ctx.moveTo(r.x + r.w - 4, r.y + 4);
  ctx.lineTo(r.x + 4, r.y + r.h - 4);
  ctx.stroke();
}

function drawGrass(ctx, g) {
  ctx.fillStyle = 'rgba(46, 125, 50, 0.35)';
  ctx.fillRect(g.x, g.y, g.w, g.h);
  ctx.strokeStyle = '#4caf50';
  ctx.lineWidth = 2;
  for (let x = g.x + 6; x < g.x + g.w - 4; x += 10) {
    const h = 14 + ((x * 7) % 18);
    ctx.beginPath();
    ctx.moveTo(x, g.y + g.h - 4);
    ctx.lineTo(x + 2, g.y + g.h - h);
    ctx.stroke();
  }
  ctx.fillStyle = '#81c784';
  ctx.font = 'bold 11px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  // label sits at the bottom of the patch so it never collides with the
  // HIDDEN tag drawn above a thief crouching in the grass
  ctx.fillText('TALL GRASS', g.x + 5, g.y + g.h - 5);
}

export function render(ctx, game) {
  const level = game.level;
  const W = WORLD_W;
  const H = WORLD_H;

  // floor: dark tiles with a faint checker
  ctx.fillStyle = '#171a2e';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#1b1f38';
  const tile = 64;
  for (let y = 0; y < H; y += tile) {
    for (let x = 0; x < W; x += tile) {
      if (((x + y) / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += tile) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += tile) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  for (const rug of level.rugs) {
    ctx.fillStyle = rug.color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(242, 193, 78, 0.35)';
    ctx.strokeRect(rug.x + 5, rug.y + 5, rug.w - 10, rug.h - 10);
  }

  for (const c of level.creaky) {
    ctx.fillStyle = 'rgba(160, 120, 60, 0.18)';
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.strokeStyle = 'rgba(200, 160, 90, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(c.x + 1, c.y + 1, c.w - 2, c.h - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(220, 190, 130, 0.85)';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CREAKY BOARDS', c.x + c.w / 2, c.y + c.h / 2);
  }

  for (const g of level.grass) drawGrass(ctx, g);

  // walls: dark navy brick with a lit top edge
  for (const r of level.walls) {
    ctx.fillStyle = '#232a4a';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = '#39406e';
    if (r.w >= r.h) ctx.fillRect(r.x, r.y, r.w, 3);
    else ctx.fillRect(r.x, r.y, 3, r.h);
  }

  for (const p of level.lowProps) {
    ctx.fillStyle = p.kind === 'counter' ? '#5a4632' : '#4a3826';
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.strokeStyle = '#8a6f45';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2);
  }

  for (const b of level.blockers) {
    if (b.kind === 'shelf') drawShelf(ctx, b);
    else if (b.kind === 'crate') drawCrate(ctx, b);
    else {
      ctx.fillStyle = '#3a3f5e';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = '#5a6196';
      ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
    }
  }

  // lamplight pools
  for (const lamp of level.lamps) {
    const grad = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, LAMP_RADIUS);
    grad.addColorStop(0, 'rgba(242, 193, 78, 0.30)');
    grad.addColorStop(0.6, 'rgba(242, 193, 78, 0.12)');
    grad.addColorStop(1, 'rgba(242, 193, 78, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, LAMP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7d774';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(247, 215, 116, 0.6)';
    ctx.beginPath();
    ctx.arc(lamp.x, lamp.y, 10, 0, Math.PI * 2);
    ctx.stroke();
  }

  // loot diamonds
  for (const loot of level.loot) {
    if (loot.taken) continue;
    ctx.fillStyle = '#ffd94d';
    ctx.beginPath();
    ctx.moveTo(loot.x, loot.y - 8);
    ctx.lineTo(loot.x + 7, loot.y);
    ctx.lineTo(loot.x, loot.y + 8);
    ctx.lineTo(loot.x - 7, loot.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff3b0';
    ctx.stroke();
  }

  // prize: the Brass Moth on its pedestal
  if (!game.player.hasPrize) {
    const p = level.prize;
    ctx.fillStyle = '#8a6f45';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(p.x - 8, p.y - 4, 8, 5, -0.5, 0, Math.PI * 2);
    ctx.ellipse(p.x + 8, p.y - 4, 8, 5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5a1e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('M', p.x, p.y - 24);
  }

  // exit hatch
  const ex = level.exit;
  const open = game.player.hasPrize;
  ctx.fillStyle = open ? '#14532d' : '#1f2a1f';
  ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
  ctx.strokeStyle = open ? '#4ade80' : '#4a5a4a';
  ctx.lineWidth = 2;
  ctx.strokeRect(ex.x + 1, ex.y + 1, ex.w - 2, ex.h - 2);
  ctx.fillStyle = open ? '#86efac' : '#7a8a7a';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('EXIT', ex.x + ex.w / 2, ex.y + ex.h / 2);
  if (open) {
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
    ctx.beginPath();
    ctx.arc(ex.x + ex.w / 2, ex.y + ex.h / 2, 30 + Math.sin(game.time * 3) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }

  // pebble in flight / landed noise rings
  for (const ring of game.rings) {
    ctx.strokeStyle = `rgba(232, 221, 196, ${Math.max(0, 0.9 - ring.age)})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * (0.3 + ring.age * 0.7), 0, Math.PI * 2);
    ctx.stroke();
  }
  if (game.pebble && !game.pebble.landed) {
    ctx.fillStyle = '#d8cfae';
    ctx.beginPath();
    ctx.arc(game.pebble.x, game.pebble.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // vision cones (raycast, blocked by walls and crates)
  for (const guard of game.guards) {
    const poly = conePolygon(guard, game.blockers());
    const alerted = guard.state === 'alerted';
    ctx.fillStyle = alerted ? 'rgba(239, 68, 68, 0.30)' : 'rgba(242, 193, 78, 0.22)';
    ctx.beginPath();
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].x, poly[i].y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = alerted ? 'rgba(239, 68, 68, 0.55)' : 'rgba(242, 193, 78, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // wardens
  for (const guard of game.guards) {
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(guard.x, guard.y);
    ctx.lineTo(guard.x + Math.cos(guard.dir) * 12, guard.y + Math.sin(guard.dir) * 12);
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.dir) * 5, guard.y + Math.sin(guard.dir) * 5, 3, 0, Math.PI * 2);
    ctx.fill();
    if (guard.state === 'suspicious' || guard.state === 'search') {
      ctx.fillStyle = '#fcd34d';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('?', guard.x, guard.y - 16);
    } else if (guard.state === 'alerted') {
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 18px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('!', guard.x, guard.y - 16);
    }
    if (guard.suspicion > 0.05 && guard.state !== 'calm') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(guard.x - 14, guard.y + 16, 28, 5);
      ctx.fillStyle = guard.suspicion >= 1 ? '#ef4444' : '#fcd34d';
      ctx.fillRect(guard.x - 14, guard.y + 16, 28 * guard.suspicion, 5);
    }
  }

  // the thief
  const p = game.player;
  const hidden = game.visibility === 'hidden';
  ctx.fillStyle = '#2dd4bf';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + Math.cos(p.dir) * 11, p.y + Math.sin(p.dir) * 11);
  ctx.stroke();
  if (hidden) {
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('HIDDEN', p.x, p.y - 16);
  }

  // interaction prompt
  if (game.prompt) {
    ctx.fillStyle = '#f2e6b8';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(game.prompt, p.x, p.y - 20);
  }

  // staged callouts (screenshots): clamped labels, leader lines
  if (game.callouts) {
    for (const c of game.callouts) {
      drawLabel(ctx, c.text, c.ax, c.ay, c.bx, c.by);
    }
  }

  // soft vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
}
