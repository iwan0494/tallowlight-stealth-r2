# TALLOWLIGHT — Three Heists by Lamplight

[![make.fun](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/iwan0494/tallowlight-stealth-r2/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/iwan0494/tallowlight-stealth-r2/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759)

A top-down stealth heist game for the [make.fun best stealth game bounty](https://make.fun/bounty/best-stealth-game-20261121-1759). Slip through three lamplit heists — the Chandler's Shop, the Gilded Archive, and the Clockmaker's Vault — learn the wardens' patrols, keep to the shadows, and lift the Brass Moth without ever being seen.

## The game

- **3 heists, 3 different floor plans** — 17 wardens, 32 loot pieces, one prize per heist
- **Raycast vision cones** — wardens see only what their cone reaches; walls and crates block sight
- **Detection with recovery** — a suspicion meter fills when you are seen (faster in lamplight, slower sneaking) and drains when you break line of sight
- **Stealth tools** — sneak (SHIFT), throw a pebble to distract (mouse click), hide in tall grass and planters, avoid creaky boards
- **Objective** — take the Brass Moth, then reach the exit hatch unseen

## Controls

WASD / arrows move · SHIFT sneak · mouse aim, CLICK throw a pebble · E interact · H field notes · M mute · ESC pause · R restart level

## Play it

Open `game/index.html` in a desktop browser (or serve the folder with any static server). No network requests, no build step, plain Canvas 2D.

`main.ts` (Node 22, standard library only) hands the game in: it copies `game/` and `screenshots/` to the output directory and writes `dossier.json`.
