// /play — the TamaPet game on the 3D device.
import { createDeviceView } from './device-view.js';
import { createLcd } from './lcd.js';
import { createGame, resetSave, SPIN_PRIZES } from './game.js';
import { ANIMALS } from './game-screens.js';
import { CATALOGUE, findItem } from './shop.js';

if (new URLSearchParams(location.search).has('reset')) resetSave();

// cloud save state (used by the game's onSave from the start; the rest is at the bottom)
const cloud = { on: false, wallet: null, timer: 0, busy: false, again: false };
const game = createGame({ onSave: () => queueCloud() });
const lcd = createLcd();
const hint = document.getElementById('hint');

const view = createDeviceView(document.getElementById('device'), {
  distance: 4.4,
  lift: 0.1,
  shell: game.look().device.rgb,
  onPress: (btn) => game.press(btn),
  onRelease: (btn) => game.release(btn),
  onReady: () => document.getElementById('loading').classList.add('is-done'),
  onFrame: () => {
    game.update();
    game.takeEvents().forEach(toast);
    game.draw(lcd);
    const h = game.hint();
    if (hint.textContent !== h) hint.textContent = h;
    const look = game.look();
    view.setShell(look.device.rgb);
    return { buf: lcd.buf, pet: look.pet };
  },
});

// Keyboard: a / s / d (or Enter, Space, Esc) = ♥ ● ★, arrow keys = directions. Holding a key holds the button.
const KEYS = {
  a: 'heart', s: 'circle', d: 'star', Enter: 'circle', ' ': 'circle', Escape: 'star', Backspace: 'star',
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
};
const DEVICE = ['heart', 'circle', 'star']; // these also push the 3D button in
const keyOf = (e) => KEYS[e.key.length === 1 ? e.key.toLowerCase() : e.key];
window.addEventListener('keydown', (e) => {
  if (e.target.closest?.('input')) return; // typing a new name in the Stats panel
  if (!$('shop').hidden) { if (e.key === 'Escape') closeShop(); return; } // the game pauses input while shopping
  if (e.key === 'Escape' && openPanel) { closePanels(); return; }
  if (!e.ctrlKey && !e.metaKey && !e.altKey && game.typeKey(e.key)) { e.preventDefault(); return; } // naming the pet
  const btn = keyOf(e);
  if (!btn) return;
  e.preventDefault();
  if (e.repeat) { if (!DEVICE.includes(btn)) game.press(btn); return; } // held arrows repeat (moving in Blocks)
  if (DEVICE.includes(btn)) view.press(btn); else game.press(btn);
});
window.addEventListener('keyup', (e) => {
  if (e.target.closest?.('input')) return;
  const btn = keyOf(e);
  if (!btn) return;
  if (DEVICE.includes(btn)) view.release(btn); else game.release(btn);
});

// On-screen buttons under the device: holding works too.
document.querySelectorAll('[data-btn]').forEach((b) => {
  const btn = b.dataset.btn;
  let down = false;
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); down = true; b.setPointerCapture(e.pointerId); view.press(btn); });
  const up = () => { if (down) { down = false; view.release(btn); } };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointercancel', up);
});

// ---- navbar: Stats + Quests panels, TamaPoints, quest-done notifications ----
const $ = (id) => document.getElementById(id);
const title = (s) => s.charAt(0) + s.slice(1).toLowerCase();
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

let openPanel = null;
let spinning = false, turned = 0; // daily spin wheel state (render() reads `spinning`)
const tabs = { stats: [$('statsTab'), $('statsPanel')], quests: [$('questsTab'), $('questsPanel')], spin: [$('spinTab'), $('spinPanel')] };
function closePanels() {
  for (const [tab, panel] of Object.values(tabs)) { panel.hidden = true; tab.setAttribute('aria-expanded', 'false'); }
  openPanel = null;
}
for (const [key, [tab, panel]] of Object.entries(tabs)) {
  tab.addEventListener('click', () => {
    const wasOpen = openPanel === key;
    closePanels();
    if (!wasOpen) { panel.hidden = false; tab.setAttribute('aria-expanded', 'true'); openPanel = key; render(true); }
  });
}
document.addEventListener('pointerdown', (e) => {
  if (openPanel && !e.target.closest('.panel, .tab')) closePanels();
});

$('renameBtn').addEventListener('click', () => {
  const form = $('renameForm');
  form.hidden = !form.hidden;
  if (!form.hidden) { $('renameInput').value = game.info().name; $('renameInput').focus(); $('renameInput').select(); }
});
$('renameInput').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
$('renameForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (game.rename($('renameInput').value)) { $('renameForm').hidden = true; render(true); }
});

function untilMidnight(what = 'New quests') {
  const n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
  const mins = Math.ceil((m - n) / 60000);
  return `${what} in ${Math.floor(mins / 60)}h ${mins % 60}m`;
}

let last = '';
function render(force = false) {
  const i = game.info();
  const key = JSON.stringify(i);
  if (!force && key === last) return;
  last = key;
  const done = i.quests.filter((q) => q.done).length;
  $('tpNav').textContent = i.tp;
  $('questBadge').textContent = `${done}/${i.quests.length}`;

  $('petName').textContent = i.name || '—';
  $('petLine').textContent = i.animal ? `${title(i.animal)} · Level ${i.level}` : 'No pet yet';
  $('lvLabel').textContent = `Level ${i.level}`;
  $('xpLabel').textContent = `${i.xp} / ${i.xpNext} XP`;
  $('xpBar').style.width = `${Math.min(100, (i.xp / i.xpNext) * 100)}%`;
  $('savedVal').textContent = i.saved;
  $('tpVal').textContent = i.tp;
  $('scores').replaceChildren(...i.best.flatMap((b) => [el('span', '', title(b.name)), el('span', '', b.best)]));

  $('questsReset').textContent = untilMidnight();
  $('spinDot').hidden = !game.spinAvailable();
  if (!spinning) {
    $('spinBtn').disabled = !game.spinAvailable();
    $('spinBtn').textContent = game.spinAvailable() ? 'Spin' : untilMidnight('Next spin');
  }
  $('questList').replaceChildren(...i.quests.map((q) => {
    const li = el('li', 'quest' + (q.done ? ' done' : ''));
    li.append(el('span', 'check', q.done ? '✓' : ''));
    const body = el('div');
    body.append(el('p', '', q.text));
    if (q.target > 1 && !q.done) {
      const bar = el('div', 'bar'), fill = el('i');
      fill.style.width = `${(q.progress / q.target) * 100}%`;
      bar.append(fill);
      body.append(bar);
    }
    const chips = el('div', 'chips');
    chips.append(el('span', '', `+${q.reward.xp} XP`), el('span', '', `+${q.reward.tp} TP`));
    body.append(chips);
    li.append(body);
    return li;
  }));
}
render(true);
setInterval(render, 300);

function toast(ev) {
  const t = el('div', 'toast');
  t.append(el('b', '', { spin: 'Daily spin! ', shop: 'Bought! ', questdone: 'Quest done! ', cloud: 'Cloud save: ' }[ev.type] || ''), document.createTextNode(ev.text));
  $('toasts').append(t);
  setTimeout(() => t.remove(), 4100);
}

// ---- daily spin wheel ----
const prizeText = (p) => (p.xp ? `+${p.xp} XP` : `+${p.tp} TamaPoints`);
const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs) => { const n = document.createElementNS(SVG, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };
(function drawWheel() {
  const wheel = $('wheel'), n = SPIN_PRIZES.length, step = 360 / n, R = 96;
  const pt = (deg, r) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r];
  SPIN_PRIZES.forEach((p, i) => {
    const a0 = i * step - step / 2, a1 = a0 + step, [x0, y0] = pt(a0, R), [x1, y1] = pt(a1, R);
    const rare = p.w <= 5;
    const fill = rare ? '#ffd36b' : i % 2 ? '#2e62d1' : '#EFE3D3';
    const ink = i % 2 && !rare ? '#EFE3D3' : '#0B3986';
    wheel.append(svg('path', { d: `M0 0 L${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1} Z`, fill, stroke: '#0B3986', 'stroke-width': 1.5 }));
    const g = svg('g', { transform: `rotate(${i * step})` });
    const big = svg('text', { x: 0, y: -66, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: ink, 'font-family': 'DM Sans, sans-serif' });
    big.textContent = '+' + (p.xp || p.tp);
    const small = svg('text', { x: 0, y: -50, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 500, fill: ink, 'font-family': 'DM Sans, sans-serif' });
    small.textContent = p.xp ? 'XP' : 'TP';
    g.append(big, small);
    wheel.append(g);
  });
  wheel.append(svg('circle', { r: 14, fill: '#0B3986', stroke: '#EFE3D3', 'stroke-width': 3 }));
})();

$('spinBtn').addEventListener('click', () => {
  if (spinning) return;
  const res = game.spin();
  if (!res) return;
  spinning = true;
  $('spinBtn').disabled = true;
  $('spinResult').textContent = '';
  // Land prize `index` under the pointer at the top: whole turns + the remainder, with a little random offset
  // inside the slice so it doesn't always stop dead centre.
  const step = 360 / SPIN_PRIZES.length;
  const target = -res.index * step + (Math.random() - 0.5) * step * 0.7;
  turned += 360 * 5 + ((((target - turned) % 360) + 360) % 360);
  const wheel = $('wheel');
  wheel.style.transform = `rotate(${turned}deg)`;
  wheel.addEventListener('transitionend', () => {
    game.claimSpin();
    spinning = false;
    $('spinResult').textContent = `You won ${prizeText(res.prize)}!`;
    toast({ type: 'spin', text: `You won ${prizeText(res.prize)}` });
    render(true);
  }, { once: true });
});

// ---- shop: buy on the left, preview + equip on the right ----
const shopSel = { device: null, pet: null, focus: 'device' }; // what the preview shows; `focus` = item the button acts on
let preview = null;
const previewLcd = createLcd();

function swatchStyle(kind, item) {
  if (kind === 'device') return `background: rgb(${item.rgb})`;
  if (item.rainbow) return 'background: conic-gradient(#e0413e, #f0a23b, #e8d84a, #54c25a, #3f8fe0, #8a5ad6, #e0413e)';
  return `background: linear-gradient(135deg, rgb(${item.dark}) 0 50%, rgb(${item.mid}) 50% 100%)`;
}

function renderShop() {
  const i = game.info();
  $('tpShop').textContent = i.tp;
  for (const kind of ['device', 'pet']) {
    $(kind + 'Swatches').replaceChildren(...CATALOGUE[kind].map((item) => {
      const b = el('button', 'swatch' + (shopSel[kind] === item.id ? ' is-sel' : ''));
      const dot = el('i');
      dot.style.cssText = swatchStyle(kind, item);
      const owned = i.owned[kind].includes(item.id), on = i.equipped[kind] === item.id;
      b.append(dot, el('span', '', item.name),
        el('small', owned ? 'own' : '', on ? 'Equipped' : owned ? 'Owned' : `${item.price} TP`));
      b.addEventListener('click', () => { shopSel[kind] = item.id; shopSel.focus = kind; renderShop(); });
      return b;
    }));
  }
  // the item the button acts on
  const kind = shopSel.focus, item = findItem(kind, shopSel[kind]);
  const owned = i.owned[kind].includes(item.id), on = i.equipped[kind] === item.id;
  $('pickName').textContent = `${item.name}${kind === 'pet' ? ' pet' : ' device'}`;
  $('pickInfo').textContent = item.rare ? 'Rare' : item.price ? '' : 'Free';
  const btn = $('shopBtn');
  btn.disabled = on || (!owned && i.tp < item.price);
  btn.textContent = on ? 'Equipped' : owned ? 'Equip' : i.tp >= item.price ? `Buy · ${item.price} TP` : `Need ${item.price - i.tp} more TP`;
  preview?.setShell(findItem('device', shopSel.device).rgb);
}

$('shopBtn').addEventListener('click', () => {
  const kind = shopSel.focus, id = shopSel[kind];
  const owned = game.info().owned[kind].includes(id);
  if (owned) game.equip(kind, id);
  else if (game.buy(kind, id)) toast({ type: 'shop', text: `${findItem(kind, id).name} ${kind === 'pet' ? 'pet' : 'device'} colour bought — equip it when you like` });
  renderShop();
  render(true);
});

function openShop() {
  closePanels();
  const eq = game.info().equipped;
  shopSel.device = eq.device; shopSel.pet = eq.pet; shopSel.focus = 'device';
  $('shop').hidden = false;
  if (!preview) {
    preview = createDeviceView($('shopDevice'), {
      distance: 4.1, spin: 0.35, shell: findItem('device', shopSel.device).rgb,
      onPress: () => {},
      onFrame: (t) => { // the pet on the preview's screen, in the colour being previewed
        const i = game.info();
        previewLcd.clear();
        previewLcd.sprite(ANIMALS[i.animalId ?? 0].rows, 8, 9 + (Math.floor(t * 2) % 2), { pet: true });
        previewLcd.textC(i.name || '', 28);
        return { buf: previewLcd.buf, pet: findItem('pet', shopSel.pet) };
      },
    });
  } else preview.setActive(true);
  renderShop();
}
function closeShop() {
  $('shop').hidden = true;
  preview?.setActive(false);
}
$('shopTab').addEventListener('click', openShop);
$('shopClose').addEventListener('click', closeShop);
$('shop').addEventListener('pointerdown', (e) => { if (e.target === $('shop')) closeShop(); });

// ---- cloud save: progress belongs to the connected wallet (api/save.js + Supabase) ----
// Connect → load that wallet's save (or, if it has none yet, upload the pet you have here). After that every change
// is sent up a moment later. Without a wallet (or on the local test server, which has no /api) it's browser-only.
async function cloudApi(method, body) {
  const token = await window.tamapetWallet?.getToken?.();
  if (!token) throw new Error('not logged in');
  const r = await fetch('/api/save', {
    method,
    keepalive: method === 'POST',
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const out = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(out.error || `HTTP ${r.status}`);
  return out;
}
function queueCloud(delay = 1500) {
  if (!cloud.on) return;
  clearTimeout(cloud.timer);
  cloud.timer = setTimeout(pushCloud, delay);
}
async function pushCloud() {
  if (!cloud.on) return;
  if (cloud.busy) { cloud.again = true; return; }
  cloud.busy = true;
  try { await cloudApi('POST', { data: game.data() }); } catch (e) { console.warn('[TamaPet] cloud save failed:', e.message); }
  cloud.busy = false;
  if (cloud.again) { cloud.again = false; queueCloud(); }
}
async function onWallet(address) {
  if (address === cloud.wallet) return;
  cloud.wallet = address;
  cloud.on = false;
  clearTimeout(cloud.timer);
  if (!address) return;
  try {
    const { data } = await cloudApi('GET');
    if (cloud.wallet !== address) return; // switched wallets meanwhile
    cloud.on = true;
    if (data) {
      game.setData(data);
      toast({ type: 'cloud', text: `loaded ${data.name || 'your pet'} from your wallet` });
    } else if (game.hasPet()) {
      await cloudApi('POST', { data: game.data() });
      toast({ type: 'cloud', text: 'your pet is now saved to your wallet' });
    }
    render(true);
  } catch (e) {
    console.warn('[TamaPet] cloud save unavailable:', e.message);
  }
}
window.addEventListener('tamapet:wallet', (e) => onWallet(e.detail.address));
if (window.tamapetWallet?.address) onWallet(window.tamapetWallet.address);
// Leaving / hiding the page: send anything still waiting.
document.addEventListener('visibilitychange', () => { if (document.hidden && cloud.on) { clearTimeout(cloud.timer); pushCloud(); } });
