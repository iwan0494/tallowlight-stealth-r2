// DOM HUD: top bar stats, field-notes panel and the overlay screens.
import { LEVELS } from './config.js';

function fmtTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export function makeHud() {
  const $ = (id) => document.getElementById(id);
  const hud = {
    heist: $('hud-heist'),
    objective: $('hud-objective'),
    detection: $('hud-detection'),
    visibility: $('hud-visibility'),
    pebbles: $('hud-pebbles'),
    loot: $('hud-loot'),
    prize: $('hud-prize'),
    exit: $('hud-exit'),
    spotted: $('hud-spotted'),
    timer: $('hud-timer'),
    notes: $('notes'),
    status: $('status'),
    screens: {
      title: $('screen-title'),
      paused: $('screen-paused'),
      caught: $('screen-caught'),
      level: $('screen-level'),
      win: $('screen-win'),
    },
  };
  hud.show = (name) => {
    for (const key of Object.keys(hud.screens)) {
      hud.screens[key].classList.toggle('hidden', key !== name);
    }
  };
  hud.showNone = () => {
    for (const key of Object.keys(hud.screens)) hud.screens[key].classList.add('hidden');
  };
  hud.update = (game) => {
    const level = game.level;
    hud.heist.textContent = level.name;
    hud.objective.textContent = level.objective;
    const det = hud.detection;
    det.textContent = game.detectionLabel;
    det.className = 'pill ' + (game.detectionLabel === 'UNSEEN' ? 'good' : game.detectionLabel.startsWith('SUSPICIOUS') ? 'warn' : 'bad');
    const vis = hud.visibility;
    vis.textContent = game.visibilityLabel;
    vis.className = 'pill ' + (game.visibility === 'hidden' ? 'good' : game.visibility === 'shadow' ? '' : 'warn');
    hud.pebbles.textContent = '●'.repeat(game.player.pebbles) + '○'.repeat(Math.max(0, 5 - game.player.pebbles));
    hud.loot.textContent = game.player.loot + '/' + level.loot.length;
    hud.prize.textContent = game.player.hasPrize ? 'BRASS MOTH ✓' : 'BRASS MOTH —';
    hud.exit.textContent = game.player.hasPrize ? 'EXIT OPEN' : 'EXIT LOCKED';
    hud.spotted.textContent = String(game.spotted);
    hud.timer.textContent = fmtTime(game.timer);
    hud.status.textContent = level.name + '. ' + game.detectionLabel + '. Loot ' + game.player.loot + ' of ' + level.loot.length + '.';
  };
  hud.setLevelSummary = (text) => {
    document.getElementById('level-summary').textContent = text;
  };
  hud.setWinSummary = (text) => {
    document.getElementById('win-summary').textContent = text;
  };
  return hud;
}

export { LEVELS, fmtTime };
