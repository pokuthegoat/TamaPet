// Game design preview: the 3D device with the design screens drawn live on its LCD, plus flat previews.
import { createDeviceView } from './device-view.js';
import { createLcd, paintLcd, SW, SH } from './lcd.js';
import { SCREENS, press } from './game-screens.js';

const state = { screen: 'pick', t0: performance.now(), animal: 0, sel: 0, game: 0 };

const grid = document.getElementById('grid');
const previews = Object.entries(SCREENS).map(([key, sc]) => {
  const card = document.createElement('div');
  card.className = 'card';
  const c = document.createElement('canvas');
  c.width = SW * 6; c.height = SH * 6;
  const label = document.createElement('span');
  label.textContent = sc.label;
  card.append(c, label);
  card.addEventListener('click', () => { state.screen = key; state.t0 = performance.now(); });
  grid.append(card);
  return { key, card, ctx: c.getContext('2d'), lcd: createLcd() };
});

const main = createLcd();
const view = createDeviceView(document.getElementById('device'), {
  onPress: (btn) => press(state, btn),
  onReady: () => document.getElementById('loading').remove(),
  onFrame: (t) => {
    const st = (performance.now() - state.t0) / 1000;
    main.clear();
    SCREENS[state.screen].draw(main, st, state);
    previews.forEach((p) => {
      p.card.classList.toggle('is-on', p.key === state.screen);
      p.lcd.clear();
      SCREENS[p.key].draw(p.lcd, p.key === state.screen ? st : t, state);
      paintLcd(p.ctx, p.lcd.buf, { x: 0, y: 0, w: p.ctx.canvas.width, h: p.ctx.canvas.height });
    });
    return main.buf;
  },
});

const tap = (btn) => { view.press(btn); setTimeout(() => view.release(btn), 130); };
document.querySelectorAll('[data-btn]').forEach((b) => b.addEventListener('click', () => tap(b.dataset.btn)));
window.addEventListener('keydown', (e) => {
  const m = { ArrowRight: 'heart', ArrowLeft: 'heart', Enter: 'circle', ' ': 'circle', Escape: 'star', Backspace: 'star' }[e.key];
  if (m) { e.preventDefault(); tap(m); }
});
