import * as THREE from 'three';
import { DEVICE_STYLE, lcdShade } from './device-style.js';

// The Tamagotchi's LCD: a small pixel buffer (0 = off, 1 = mid, 2 = dark; 3 / 4 = the pet's own dark / mid, which
// take the pet's shop colour), painted as square LCD cells with thin gaps — onto the device's texture atlas (live,
// on the 3D model) or onto any 2D canvas (previews).
export const SW = 32, SH = 35; // screen size in LCD pixels (the screen is slightly taller than wide)

const COL = [DEVICE_STYLE.lcd, DEVICE_STYLE.lcdMid, DEVICE_STYLE.lcdDark].map((c) => `rgb(${c})`);
const GHOST = `rgb(${DEVICE_STYLE.lcd.map((v) => Math.round(v * 0.955))})`; // unlit cells, faintly visible

// 3×5 pixel font (5 rows of 3, joined).
const FONT = {
  A: '.#.#.#####.##.#', B: '##.#.###.#.###.', C: '.###..#..#...##', D: '##.#.##.##.###.', E: '####..##.#..###', F: '####..##.#..#..',
  G: '.###..#.##.#.##', H: '#.##.#####.##.#', I: '###.#..#..#.###', J: '..#..#..##.#.#.', K: '#.##.###.#.##.#', L: '#..#..#..#..###',
  M: '#.########.##.#', N: '##.#.##.##.##.#', O: '.#.#.##.##.#.#.', P: '##.#.###.#..#..', Q: '.#.#.##.###..##', R: '##.#.###.#.##.#',
  S: '.###...#...###.', T: '###.#..#..#..#.', U: '#.##.##.##.####', V: '#.##.##.##.#.#.', W: '#.##.########.#', X: '#.##.#.#.#.##.#',
  Y: '#.##.#.#..#..#.', Z: '###..#.#.#..###', '0': '####.##.##.####', '1': '.#.##..#..#.###', '2': '##...#.#.#..###', '3': '##...#.#...###.',
  '4': '#.##.####..#..#', '5': '####..##...###.', '6': '.###..####.####', '7': '###..#.#..#..#.', '8': '####.#####.####', '9': '####.####..###.',
  '+': '....#.###.#....', '!': '.#..#..#.....#.', '<': '..#.#.#...#...#', '>': '#...#...#.#.#..', '/': '..#..#.#.#..#..', ':': '....#.....#....',
  ' ': '...............',
};

export function createLcd() {
  const buf = new Uint8Array(SW * SH);
  const px = (x, y, c = 2) => { if (x >= 0 && y >= 0 && x < SW && y < SH) buf[y * SW + x] = c; };
  const lcd = {
    buf,
    clear() { buf.fill(0); },
    px,
    rect(x, y, w, h, c = 2) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); },
    box(x, y, w, h, c = 2) {
      for (let i = 0; i < w; i++) { px(x + i, y, c); px(x + i, y + h - 1, c); }
      for (let j = 0; j < h; j++) { px(x, y + j, c); px(x + w - 1, y + j, c); }
    },
    // Sprite rows: '#' dark, 'o' mid, anything else transparent. invert: '#' → off, 'o' → mid on a dark block.
    // pet: drawn in the pet's colour (values 3 / 4).
    sprite(rows, x, y, { invert = false, pet = false } = {}) {
      const dk = pet ? 3 : 2, md = pet ? 4 : 1;
      rows.forEach((line, j) => [...line].forEach((ch, i) => {
        if (invert) px(x + i, y + j, ch === '#' ? 0 : ch === 'o' ? 1 : 2);
        else if (ch === '#') px(x + i, y + j, dk);
        else if (ch === 'o') px(x + i, y + j, md);
      }));
    },
    textWidth: (s) => s.length * 4 - 1,
    text(s, x, y, c = 2) {
      [...s.toUpperCase()].forEach((ch, n) => {
        const g = FONT[ch] || FONT[' '];
        for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '#') px(x + n * 4 + i, y + j, c);
      });
    },
    textC(s, y, c = 2) { lcd.text(s, Math.floor((SW - lcd.textWidth(s)) / 2), y, c); },
  };
  return lcd;
}

// The pet's two shades for a shop colour (see shop.js); rainbow shifts hue across the screen columns.
const rgb = (c) => `rgb(${c})`;
function petShades(pet, x) {
  if (!pet) return [COL[2], COL[1]];
  if (pet.rainbow) { const h = (x * 23) % 360; return [`hsl(${h} 72% 36%)`, `hsl(${h} 70% 58%)`]; }
  return [rgb(pet.dark), rgb(pet.mid)];
}

// Paint the buffer into ctx inside rect r. transpose: the device atlas holds the screen turned (screen-up =
// atlas-left), so screen x runs down the atlas and screen y runs across it. pet: the pet's shop colour.
export function paintLcd(ctx, buf, r, { transpose = false, gap = 0.1, pet = null } = {}) {
  const cols = transpose ? SH : SW, rows = transpose ? SW : SH;
  const cell = Math.min(r.w / cols, r.h / rows);
  const ox = r.x + (r.w - cell * cols) / 2, oy = r.y + (r.h - cell * rows) / 2;
  const s = cell * (1 - gap);
  ctx.fillStyle = COL[0];
  ctx.fillRect(r.x, r.y, r.w, r.h);
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      const v = buf[y * SW + x];
      ctx.fillStyle = v >= 3 ? petShades(pet, x)[v - 3] : v ? COL[v] : GHOST;
      const cx = transpose ? y : x, cy = transpose ? x : y;
      ctx.fillRect(ox + cx * cell, oy + cy * cell, s, s);
    }
  }
}

// Live LCD on the 3D device: draws into a small canvas the size of the screen's patch of the atlas, then copies
// just that patch into the atlas texture on the GPU (no full 2048² re-upload).
const MARGIN = 0.05; // keep the pixels this far in from the rounded window's edge

// Live LCD on the 3D device: draws into a small canvas the size of the LCD window's patch of the atlas, then
// copies just that patch into the atlas texture on the GPU (no full 2048² re-upload). Only the rounded window is
// drawn; the bezel in its corners is kept from the atlas, and the window gets the same sunken edge as at load.
export function attachLcd(renderer, handle) {
  const a = handle.area, r = handle.radius;
  const c = document.createElement('canvas');
  c.width = Math.round(a.w);
  c.height = Math.round(a.h);
  const ctx = c.getContext('2d');
  const bezel = document.createElement('canvas'); // the patch as painted at load: bezel in the corners
  bezel.width = c.width; bezel.height = c.height;
  bezel.getContext('2d').drawImage(handle.canvas, Math.round(a.x), Math.round(a.y), c.width, c.height, 0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  const pos = new THREE.Vector2(Math.round(a.x), Math.round(a.y));
  const k = handle.atlasSize / 2048;
  return (buf, pet = null) => {
    const win = { x: 0, y: 0, w: c.width, h: c.height };
    ctx.drawImage(bezel, 0, 0);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(0, 0, c.width, c.height, r);
    ctx.clip();
    ctx.fillStyle = COL[0];
    ctx.fillRect(0, 0, c.width, c.height);
    const ix = c.width * MARGIN, iy = c.height * MARGIN;
    paintLcd(ctx, buf, { x: ix, y: iy, w: c.width - ix * 2, h: c.height - iy * 2 }, { transpose: true, pet });
    lcdShade(ctx, win, r, k);
    ctx.restore();
    renderer.copyTextureToTexture(tex, handle.map, null, pos);
  };
}
