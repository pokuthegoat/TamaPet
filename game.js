// TamaPet game logic: runs on the device's LCD (lcd.js), driven by its 3 buttons (heart, circle, star) — plus
// arrow keys. Menus: heart = next, circle = select, star = back. Minigames (games.js) use them their own way.
// Progress is saved in the browser (localStorage).
import { SW } from './lcd.js';
import { ANIMALS, ICONS, BOWL, BUBBLE, MENU, menuX, nameLines } from './game-screens.js';
import { GAMES } from './games.js';
import { makeDay, today, text as questText, REWARD } from './quests.js';
import { CATALOGUE, DEFAULTS, findItem } from './shop.js';
import { xpToNext, stageOf } from './evolution.js';

export const CONFIG = {
  xpFeed: 10,
  xpBath: 10,
  xpToNext,                        // XP needed to go from level lv to lv + 1 (evolution.js)
  feedEvery: 20 * 60e3,            // ms before feeding gives XP again ("FULL" until then)
  bathEvery: 30 * 60e3,            // ms before a bath gives XP again ("CLEAN" until then)
  ready: 1500,                     // ms of "READY" before a minigame starts
  // XP per point in each minigame: `rate` in games.js
};

// Daily spin (navbar): one spin per day. `w` = chance weight (they add up to 100); bigger prizes are rarer.
export const SPIN_PRIZES = [
  { xp: 10, w: 20 }, { tp: 5, w: 20 }, { xp: 20, w: 15 }, { tp: 10, w: 15 },
  { xp: 40, w: 10 }, { tp: 20, w: 10 }, { xp: 75, w: 5 }, { tp: 50, w: 5 },
];

const KEY = 'tamapad.save.v1'; // the site's old name — kept so existing saves still load
export const NAME_MAX = 8; // the screen fits 8 letters
const NAME_KEYS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'DEL', 'OK'];
const fresh = () => ({ animal: null, name: '', level: 1, xp: 0, saved: 0, tp: 0, lastFeed: 0, lastBath: 0, best: {}, quests: null,
  spinDay: '', spinPending: null,
  owned: { device: [DEFAULTS.device], pet: [DEFAULTS.pet] }, equipped: { ...DEFAULTS } });
// A save object with every field present (older saves / cloud saves get the missing ones filled in).
function normalise(raw) {
  const d = { ...fresh(), ...(raw || {}) };
  if (typeof d.best === 'number') d.best = { SNAKE: d.best }; // older saves: one Snake best score
  if (!d.owned) d.owned = { device: [DEFAULTS.device], pet: [DEFAULTS.pet] };
  if (!d.equipped) d.equipped = { ...DEFAULTS };
  return d;
}
function load() {
  try { return normalise(JSON.parse(localStorage.getItem(KEY))); } catch { return fresh(); }
}
function store(d) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode etc.: play on unsaved */ }
}

export function resetSave() {
  try { localStorage.removeItem(KEY); } catch { /* nothing saved */ }
}

export function createGame({ onSave } = {}) {
  const d = load();
  const g = { screen: d.animal == null ? 'pick' : !d.name ? 'name' : 'home', t0: performance.now(), sel: 0, pick: 0, game: 0, gain: 0, up: false,
    nameBuf: '', nameIdx: 0, queue: [], events: [],
    wallet: null, pending: null }; // wallet: null = not known yet, true / false; pending = animal picked before connecting
  const held = { heart: false, circle: false, star: false, up: false, down: false, left: false, right: false };
  let mg = null; // running minigame: { def, inst, startAt, paused, last, done }
  const now = () => performance.now();
  const t = () => (now() - g.t0) / 1000;
  const go = (screen) => { g.screen = screen; g.t0 = now(); };
  const pet = () => ANIMALS[d.animal ?? g.pick].rows;
  // Every change: saved in the browser, and handed to the page (cloud save when a wallet is connected).
  const save = () => { store(d); onSave?.(d); };

  // Adds XP; a new level (each level = one real animal saved) queues the level-up screen. `counts`: whether it
  // counts toward today's "earn N XP" quest (quest rewards don't).
  function addXp(n, counts = true) {
    const stage = stageOf(d.level, d.xp);
    d.xp += n;
    let up = false;
    while (d.xp >= CONFIG.xpToNext(d.level)) {
      d.xp -= CONFIG.xpToNext(d.level);
      d.level++;
      d.saved++;
      up = true;
    }
    if (up && !g.queue.some((q) => q.type === 'levelup')) g.queue.push({ type: 'levelup' });
    const grown = stageOf(d.level, d.xp);
    if (grown !== stage) g.events.push({ type: 'evolve', text: `${d.name || 'your pet'} is now ${grown === 'Adult' ? 'an' : 'a'} ${grown}!` }); // shown by the page
    if (counts && n > 0) { quests().xpToday += n; questEvent('xp'); }
    save();
  }

  // After feeding, bathing or a game: show what's queued (level up), then home.
  function next() {
    const item = g.queue.shift();
    go(item ? item.type : 'home');
  }

  // ---- daily quests ----
  function quests() {
    if (!d.quests || d.quests.day !== today()) { d.quests = makeDay(today()); save(); }
    return d.quests;
  }
  function questEvent(kind, info = {}) {
    const day = quests();
    for (const q of day.list) {
      if (q.done) continue;
      if (kind === 'care' && q.type === 'care' && q.what === info.what) q.progress = 1;
      if (kind === 'xp' && q.type === 'xp') q.progress = day.xpToday;
      if (kind === 'game') {
        if (q.type === 'hi' && q.game === info.name && info.score > info.prevBest) q.progress = 1;
        if (q.type === 'score' && q.game === info.name) q.progress = Math.max(q.progress, info.score);
        if (q.type === 'play') q.progress = day.played.length;
      }
      if (q.progress >= q.target) {
        q.done = true;
        const r = REWARD[q.type];
        d.tp += r.tp;
        g.events.push({ type: 'questdone', text: questText(q).replace(' · done ✓', '') }); // shown by the page
        addXp(r.xp, false);
      }
    }
    save();
  }

  function startGame() {
    const def = GAMES[g.game];
    for (const k in held) held[k] = false; // a button held in the menu doesn't carry into the game
    mg = { def, inst: def.create(), startAt: now() + CONFIG.ready, paused: false, last: now(), done: false };
    go('game');
  }
  function endGame() {
    const { def, inst } = mg;
    mg.done = true;
    g.gain = Math.round(inst.score * def.rate);
    const prevBest = d.best[def.name] || 0;
    if (inst.score > prevBest) d.best[def.name] = inst.score;
    const day = quests();
    if (!day.played.includes(def.name)) day.played.push(def.name);
    addXp(g.gain);
    questEvent('game', { name: def.name, score: inst.score, prevBest });
    g.t0 = now();
  }

  // ---- input ----
  const NEXT = { heart: 1, right: 1, down: 1, left: -1, up: -1 };
  function press(btn) {
    if (btn in held) held[btn] = true;
    switch (g.screen) {
      case 'connect':
        if (btn === 'circle') g.events.push({ type: 'login' }); // the page opens the wallet login
        if (btn === 'star' && !hasPet()) go('pick');
        break;
      case 'pick':
        if (NEXT[btn]) g.pick = (g.pick + NEXT[btn] + ANIMALS.length) % ANIMALS.length;
        if (btn === 'circle') {
          if (g.wallet !== true) { g.pending = g.pick; go('connect'); break; } // playing needs a connected wallet
          d.animal = g.pick; save(); startNaming();
        }
        break;
      case 'home':
        if (NEXT[btn]) g.sel = (g.sel + NEXT[btn] + MENU.length) % MENU.length;
        if (btn === 'circle') open(MENU[g.sel]);
        break;
      case 'play':
        if (NEXT[btn]) g.game = (g.game + NEXT[btn] + GAMES.length) % GAMES.length;
        if (btn === 'circle') startGame();
        if (btn === 'star') go('home');
        break;
      case 'game':
        if (mg.done) { if (btn === 'circle' || btn === 'star') next(); break; }
        if (now() < mg.startAt) break;
        if (btn === 'circle' && mg.def.pausable) { mg.paused = !mg.paused; mg.last = now(); break; }
        if (!mg.paused) mg.inst.press(btn);
        break;
      case 'name':
        if (NEXT[btn]) g.nameIdx = (g.nameIdx + NEXT[btn] + NAME_KEYS.length) % NAME_KEYS.length;
        if (btn === 'star') g.nameIdx = (g.nameIdx - 1 + NAME_KEYS.length) % NAME_KEYS.length;
        if (btn === 'circle') nameKey(NAME_KEYS[g.nameIdx]);
        break;
      case 'levelup':
        if (btn === 'circle' || btn === 'star') next();
        break;
      default: break; // feed / bath / full / clean play out on their own
    }
  }
  function release(btn) { if (btn in held) held[btn] = false; }

  // ---- naming (first time, on the device): pick letters with the buttons (or type them) ----
  function startNaming() { g.nameBuf = d.name || ''; g.nameIdx = 0; go('name'); }
  function nameKey(k) {
    if (k === 'DEL') g.nameBuf = g.nameBuf.slice(0, -1);
    else if (k === 'OK') { if (g.nameBuf) { d.name = g.nameBuf; save(); go('home'); } }
    else if (g.nameBuf.length < NAME_MAX) { g.nameBuf += k; if (g.nameBuf.length === NAME_MAX) g.nameIdx = NAME_KEYS.indexOf('OK'); }
  }
  // Keyboard while naming: letters / digits, Backspace, Enter. Returns true if it used the key.
  function typeKey(key) {
    if (g.screen !== 'name') return false;
    if (key === 'Backspace') nameKey('DEL');
    else if (key === 'Enter') nameKey('OK');
    else if (/^[a-z0-9]$/i.test(key)) nameKey(key.toUpperCase());
    else return false;
    return true;
  }
  function open(item) {
    const n = Date.now();
    if (item === 'feed') {
      if (n - d.lastFeed < CONFIG.feedEvery) return go('full');
      d.lastFeed = n; g.gain = CONFIG.xpFeed; go('feed'); addXp(g.gain); questEvent('care', { what: 'feed' });
    } else if (item === 'bath') {
      if (n - d.lastBath < CONFIG.bathEvery) return go('clean');
      d.lastBath = n; g.gain = CONFIG.xpBath; go('bath'); addXp(g.gain); questEvent('care', { what: 'bath' });
    } else {
      go(item);
    }
  }

  // ---- time ----
  function update() {
    // No wallet, no playing: only choosing an animal works without one.
    if (g.wallet === false && g.screen !== 'pick' && g.screen !== 'connect') { mg = null; go('connect'); }
    const s = t();
    if ((g.screen === 'feed' || g.screen === 'bath') && s > 3.2) next();
    if ((g.screen === 'full' || g.screen === 'clean') && s > 1.8) go('home');
    if (g.screen === 'levelup' && s > 4) next();
    if (g.screen === 'game' && !mg.done) {
      const n = now();
      if (n < mg.startAt || mg.paused) { mg.last = n; return; }
      let dt = Math.min(n - mg.last, 250); // a hidden tab or a hitch shouldn't teleport things
      mg.last = n;
      while (dt > 0 && !mg.inst.over) { const step = Math.min(dt, 20); mg.inst.update(step, held); dt -= step; }
      if (mg.inst.over) endGame();
    }
  }

  // ---- drawing ----
  const bob = (s) => Math.floor(s * 2) % 2;
  function header(lcd) {
    lcd.text('LV' + d.level, 1, 1);
    lcd.box(14, 1, 17, 5);
    lcd.rect(15, 2, Math.round(15 * Math.min(1, d.xp / CONFIG.xpToNext(d.level))), 3, 1);
  }
  // Drawing inside the minigame field (30 × 26 at 1, 8), clipped to it.
  const field = (lcd) => {
    const px = (x, y, c = 2) => { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && y >= 0 && x < 30 && y < 26) lcd.px(x + 1, y + 8, c); };
    return {
      px,
      rect(x, y, w, h, c = 2) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(x + i, y + j, c); },
      sprite(rows, x, y, c = 2) {
        rows.forEach((line, j) => [...line].forEach((ch, i) => { if (ch === '#') px(x + i, y + j, c); else if (ch === 'o') px(x + i, y + j, 1); }));
      },
      textC(str, y, c = 2) { lcd.text(str, Math.floor((SW - lcd.textWidth(str)) / 2), y + 8, c); },
    };
  };
  // A text line over the game with a clear band behind it, so it reads on top of anything.
  const banner = (lcd, str, y) => { lcd.rect(2, y - 1, SW - 4, 7, 0); lcd.textC(str, y); };

  function draw(lcd) {
    lcd.clear();
    const s = t();
    switch (g.screen) {
      case 'connect': {
        lcd.sprite(ANIMALS[d.animal ?? g.pending ?? g.pick].rows, 8, 2 + bob(s), { pet: true });
        if (Math.floor(s * 2) % 3 !== 2) { lcd.textC('CONNECT', 22); lcd.textC('WALLET', 28); }
        break;
      }
      case 'pick': {
        lcd.textC('PICK', 1);
        lcd.sprite(ANIMALS[g.pick].rows, 8, 8 + bob(s), { pet: true });
        if (bob(s) === 0) { lcd.text('<', 1, 14); lcd.text('>', 28, 14); }
        nameLines(lcd, ANIMALS[g.pick].name);
        break;
      }
      case 'home': {
        header(lcd);
        const x = 8 + Math.round(Math.sin(s * 0.7) * 5); // wanders left and right
        lcd.sprite(pet(), x, 9 + bob(s), { pet: true });
        MENU.forEach((m, i) => lcd.sprite(ICONS[m], menuX(i), 27, { invert: i === g.sel }));
        break;
      }
      case 'feed': {
        header(lcd);
        lcd.sprite(pet(), 2, 11 + bob(s * 2), { pet: true });
        const left = Math.max(0, 3 - Math.floor(s));
        lcd.sprite(BOWL.map((r, j) => (j >= 4 && j < 7 - left ? r.replace(/o/g, '.') : r)), 22, 18);
        if (s > 1) lcd.textC(`+${g.gain} XP`, 29);
        break;
      }
      case 'bath': {
        header(lcd);
        lcd.sprite(pet(), 8, 11, { pet: true });
        for (let i = 0; i < 5; i++) lcd.sprite(BUBBLE, 3 + ((i * 7) % 26), 26 - Math.floor((s * 6 + i * 5) % 18));
        if (s > 1) lcd.textC(`+${g.gain} XP`, 29);
        break;
      }
      case 'full':
      case 'clean': {
        header(lcd);
        lcd.sprite(pet(), 8 + (Math.floor(s * 8) % 2 ? 1 : -1), 10, { pet: true }); // shakes its head
        lcd.textC(g.screen === 'full' ? 'FULL' : 'CLEAN', 29);
        break;
      }
      case 'play': {
        // 10 games, 3 rows visible: the list scrolls with the cursor; scroll bar on the right.
        lcd.textC('PLAY', 1);
        lcd.rect(0, 7, SW, 1);
        const top = Math.min(Math.max(0, g.game - 1), GAMES.length - 3);
        for (let r = 0; r < 3; r++) {
          const i = top + r;
          lcd.text(GAMES[i].name, 6, 11 + r * 8);
          if (i === g.game && Math.floor(s * 3) % 3 !== 2) lcd.text('>', 1, 11 + r * 8);
        }
        const barH = 24, knob = Math.max(3, Math.round((barH * 3) / GAMES.length));
        lcd.rect(SW - 1, 10 + Math.round((barH - knob) * (top / (GAMES.length - 3))), 1, knob, 1);
        break;
      }
      case 'game': {
        const { def, inst } = mg;
        lcd.text(String(inst.score), 1, 1);
        const hi = 'HI' + Math.max(d.best[def.name] || 0, mg.done ? 0 : inst.score);
        lcd.text(hi, SW - lcd.textWidth(hi) - 1, 1);
        lcd.box(0, 7, SW, 28);
        inst.draw(field(lcd), s);
        if (mg.done) {
          lcd.rect(2, 10, SW - 4, 22, 0);
          lcd.textC('GAME', 12); lcd.textC('OVER', 18); lcd.textC(`+${g.gain} XP`, 25);
        } else if (mg.paused) banner(lcd, 'PAUSE', 18);
        else if (now() < mg.startAt) { banner(lcd, def.name, 13); banner(lcd, 'READY', 21); }
        break;
      }
      case 'name': {
        lcd.textC('NAME', 1);
        lcd.rect(0, 7, SW, 1);
        // the name so far, with slots, and the letter being picked blinking in the next slot
        const k = NAME_KEYS[g.nameIdx];
        for (let i = 0; i < NAME_MAX; i++) lcd.rect(i * 4, 19, 3, 1, 1);
        lcd.text(g.nameBuf, 0, 13);
        if (k.length === 1 && g.nameBuf.length < NAME_MAX && Math.floor(s * 3) % 3 !== 2) lcd.text(k, g.nameBuf.length * 4, 13);
        // what ● does right now
        if (k.length === 1) { lcd.text('<', 8, 26); lcd.text(k, 14, 26); lcd.text('>', 20, 26); } else lcd.textC(k, 26);
        break;
      }
      case 'levelup': {
        if (Math.floor(s * 3) % 4 !== 3) { lcd.textC('LEVEL', 1); lcd.textC('UP!', 7); }
        lcd.sprite(pet(), 8, 14 + [0, -2, -3, -2][Math.floor(s * 6) % 4], { pet: true });
        lcd.textC('+1 SAVED', 30);
        break;
      }
    }
  }

  // Which buttons do what right now (for the hint under the device).
  function hint() {
    switch (g.screen) {
      case 'pick': return '♥ next animal · ● choose';
      case 'connect': return 'Connect your wallet to play · ● connect' + (hasPet() ? '' : ' · ★ back');
      case 'home': return '♥ next · ● open';
      case 'play': return '♥ next game · ● start · ★ back';
      case 'game': return mg.done ? '● continue' : mg.def.hint;
      case 'name': return '♥ next letter · ★ previous · ● pick (DEL / OK at the end) · or just type';
      case 'levelup': return '● continue';
      default: return '';
    }
  }

  // ---- for the page's navbar (Stats / Quests panels) ----
  function info() {
    const day = quests();
    return {
      name: d.name, animalId: d.animal, animal: d.animal == null ? '' : ANIMALS[d.animal].name, level: d.level, xp: d.xp,
      xpNext: CONFIG.xpToNext(d.level), saved: d.saved, tp: d.tp, status: stageOf(d.level, d.xp),
      best: GAMES.map((gm) => ({ name: gm.name, best: d.best[gm.name] || 0 })),
      owned: { device: [...d.owned.device], pet: [...d.owned.pet] }, equipped: { ...d.equipped },
      quests: day.list.map((q) => ({ text: questText(q).split(' — ')[0], reward: REWARD[q.type], done: q.done,
        progress: Math.min(q.progress, q.target), target: q.target })),
    };
  }
  // Rename from the Stats panel: letters and digits, up to NAME_MAX. Returns the name it saved ('' if none).
  function rename(raw) {
    const name = String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, NAME_MAX);
    if (name && d.animal != null) { d.name = name; save(); if (g.screen === 'name') go('home'); }
    return name;
  }
  const takeEvents = () => g.events.splice(0);

  // ---- shop: colours bought with TamaPoints ----
  function buy(kind, id) {
    const item = CATALOGUE[kind]?.find((c) => c.id === id);
    if (!item || d.owned[kind].includes(id) || d.tp < item.price) return false;
    d.tp -= item.price;
    d.owned[kind].push(id);
    save();
    return true;
  }
  function equip(kind, id) {
    if (!d.owned[kind]?.includes(id)) return false;
    d.equipped[kind] = id;
    save();
    return true;
  }
  const look = () => ({ device: findItem('device', d.equipped.device), pet: findItem('pet', d.equipped.pet) });

  // ---- daily spin ----
  const spinAvailable = () => d.animal != null && d.spinDay !== today();
  // Picks the prize and uses up today's spin right away (so a reload can't re-spin); the prize itself is paid out
  // by claimSpin() when the wheel stops — or on the next load if the page was closed mid-spin.
  function spin() {
    if (!spinAvailable()) return null;
    let r = Math.random() * SPIN_PRIZES.reduce((a, p) => a + p.w, 0), index = 0;
    while (r >= SPIN_PRIZES[index].w) { r -= SPIN_PRIZES[index].w; index++; }
    d.spinDay = today();
    d.spinPending = index;
    save();
    return { index, prize: SPIN_PRIZES[index] };
  }
  function claimSpin() {
    if (d.spinPending == null) return;
    const p = SPIN_PRIZES[d.spinPending];
    d.spinPending = null;
    d.tp += p.tp || 0;
    addXp(p.xp || 0, false); // like quest rewards, doesn't count toward the "earn XP" quest
    if (g.queue.length && g.screen === 'home') next(); // a level up from the spin shows straight away
  }
  if (d.spinPending != null) claimSpin();

  // ---- wallet gate: the page reports whether a wallet is connected (after any cloud save has loaded) ----
  function setWallet(on) {
    g.wallet = on;
    if (on && g.screen === 'connect') {
      if (hasPet()) go(d.name ? 'home' : 'name');
      else if (g.pending != null) { d.animal = g.pending; g.pending = null; save(); startNaming(); }
      else go('pick');
    }
  }

  // ---- cloud save: swap in a save loaded from the player's wallet ----
  const data = () => JSON.parse(JSON.stringify(d));
  const hasPet = () => d.animal != null;
  function setData(raw) {
    const nd = normalise(raw);
    for (const k of Object.keys(d)) delete d[k];
    Object.assign(d, nd);
    store(d);
    mg = null;
    g.queue.length = 0;
    go(d.animal == null ? 'pick' : !d.name ? 'name' : 'home');
  }

  return { press, release, typeKey, update, draw, hint, info, rename, takeEvents, spinAvailable, spin, claimSpin,
    data, hasPet, setData, setWallet,
    buy, equip, look,
    get screen() { return g.screen; } };
}
