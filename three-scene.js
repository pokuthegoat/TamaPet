import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { restyleDevice } from './device-style.js';

const canvas = document.getElementById('stage');
const hero = document.querySelector('.hero');
const heroCopy = hero.querySelector('.hero__copy');
const loader = document.getElementById('loader');
const loaderPct = document.getElementById('loaderPct');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function hideLoader() {
  loader.classList.add('is-done');
  loader.addEventListener('transitionend', () => loader.remove(), { once: true });
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
} catch (err) {
  console.error('[TamaPet] WebGL unavailable', err);
  hideLoader();
  throw err;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
camera.position.set(0, 0, 6);

const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(3, 4, 5);
scene.add(key);
// Cream rim from behind-left so the silhouette separates from the navy background.
const rim = new THREE.DirectionalLight(0xefe3d3, 2.2);
rim.position.set(-4, 2, -3);
scene.add(rim);

// anchor = scroll path pose → follow = cursor tilt → idle = always-on float/sway.
const anchor = new THREE.Group();
const follow = new THREE.Group();
const idle = new THREE.Group();
anchor.add(follow);
follow.add(idle);
scene.add(anchor);

// Cursor follow: only on real mouse/trackpad devices, eased toward the target so it trails the cursor.
const FOLLOW = { yaw: 0.28, pitch: 0.16, shift: 0.06, ease: 3.2 };
const pointer = { x: 0, y: 0 };
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
}

const MODEL_HEIGHT = 1.9;

// Scroll path: a serpentine from the user's sketch (D:\Downloads\roound.png). Points are ONLY the bends
// of the wave; between bends the device follows a half-cosine, so every bend is a round U-turn and it
// never runs straight. A point is reached when `f` of its element (0 = top, 1 = bottom) is at mid-screen.
// x = fraction of the screen width from the centre. `box` bends sit exactly on that element, sized to it.
// `spin` = one full turn while rounding that bend (true), or starting at the top of the given element (selector).
// `arc` = the stretch INTO this point is drawn as two round elliptical arcs (an "S" of half-loops) and the device
// travels along it — for the tight how-it-works loops, where a scroll-driven wave can't get round enough.
const PATH = [
  { el: '.hero',                         x: 0.2,  y: -0.02, s: 1 },
  { el: '#why',               f: 0.45,   x: -0.3, spin: '.banner .eyebrow' },
  { el: '.how__row .placeholder', i: 0,  box: true },
  { el: '.how__row .placeholder', i: 1,  box: true, arc: true },
  { el: '.how__row .placeholder', i: 2,  box: true, arc: true },
  { el: '.counter',          f: 0.5,    x: -0.3 },  // live counter: the device rests on the left, number on the right
  { el: '.panel--center .h2', f: 0.5,    x: -0.29, spin: true },
  { el: '.footer',            f: 0.5,    x: -0.24, y: 0.1, s: 0.9 },
];
const BASE_SCALE = 0.85;
const BOX_FIT = 1.25;         // device height vs. image-box height when it lands on a box
const SPIN_SPAN = 0.4;        // a spin runs over this much scroll either side of its bend (fraction of screen height)
const FACE_IN = 0.8;          // turns toward the middle of the page when off to one side
const PATH_EASE = 4;          // how tightly the device trails the path (higher = tighter)
const BANK = 0.1;             // sideways tilt per unit of horizontal speed

const PATH_DEBUG = new URLSearchParams(location.search).has('pathdebug');

const view = { w: 1, h: 1, visW: 1, visH: 1, narrow: false };
let curves = {};

// Between consecutive points: zero sideways speed at each point (the bend), fastest mid-crossing.
// Power in-out ease; the power is picked per stretch from its shape. Tight stretches (short scroll, wide swing,
// e.g. the how-it-works loops) get a higher power → round U-bends instead of pointy tips. Long stretches get ~2
// → a gentle flowing curve (a high power there flattens the bends into near-vertical runs).
const ROUND = { min: 2, max: 2.7, slope: 0.35 };
function bend(t, p) {
  return t < 0.5 ? 2 ** (p - 1) * t ** p : 1 - (2 - 2 * t) ** p / 2;
}
function stretchPowers(ats, xs, screenW) {
  return ats.slice(1).map((at, i) => {
    const swing = Math.abs(xs[i + 1] - xs[i]) * screenW;
    const ratio = swing > 0 ? (at - ats[i]) / swing : Infinity;
    return Math.min(ROUND.max, Math.max(ROUND.min, ROUND.max + 0.2 - ROUND.slope * ratio));
  });
}
function waveCurve(ats, vals, pows) {
  const n = ats.length;
  return (s) => {
    if (s <= ats[0]) return vals[0];
    if (s >= ats[n - 1]) return vals[n - 1];
    let i = 0;
    while (s > ats[i + 1]) i++;
    const t = (s - ats[i]) / (ats[i + 1] - ats[i]);
    return vals[i] + (vals[i + 1] - vals[i]) * bend(t, pows ? pows[i] : 2);
  };
}

// Round S between two bends a → b, in page pixels: a quarter-ellipse from a (heading straight down) to the
// midpoint (heading sideways), then a quarter-ellipse from the midpoint into b (heading straight down again).
// The device moves along it by arc length with an ease-in-out, so it slows onto each box and moves with the
// page there (reads as landing on it), then sweeps round the loop.
function arcStretch(a, b) {
  const ax = (0.5 + a.x) * view.w, ay = a.at + view.h / 2 - a.y * view.h;
  const bx = (0.5 + b.x) * view.w, by = b.at + view.h / 2 - b.y * view.h;
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const N = 64, pts = [];
  for (let j = 0; j <= N; j++) {
    const th = (j / N) * (Math.PI / 2);
    pts.push([mx - (mx - ax) * Math.cos(th), ay + (my - ay) * Math.sin(th)]);
  }
  for (let j = 1; j <= N; j++) {
    const th = (j / N) * (Math.PI / 2);
    pts.push([mx + (bx - mx) * Math.sin(th), by - (by - my) * Math.cos(th)]);
  }
  const len = [0];
  for (let j = 1; j < pts.length; j++) len.push(len[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
  const total = len[len.length - 1];
  return (t, scroll) => {
    const d = ((1 - Math.cos(Math.PI * t)) / 2) * total;
    let j = 1;
    while (j < len.length - 1 && len[j] < d) j++;
    const f = len[j] > len[j - 1] ? (d - len[j - 1]) / (len[j] - len[j - 1]) : 0;
    const px = pts[j - 1][0] + (pts[j][0] - pts[j - 1][0]) * f;
    const py = pts[j - 1][1] + (pts[j][1] - pts[j - 1][1]) * f;
    return { x: px / view.w - 0.5, y: (scroll + view.h / 2 - py) / view.h };
  };
}

function heroPose() {
  if (!view.narrow) return {};
  // Mobile: fit the device into the empty band above the hero text (reserved by the mobile hero padding-top).
  const heroTop = hero.getBoundingClientRect().top + window.scrollY;
  const freePx = heroCopy.offsetTop;
  const s = Math.min(1, (freePx * 0.85 * (view.visH / view.h)) / MODEL_HEIGHT);
  return { x: 0, y: 0.5 - (heroTop + freePx / 2) / view.h, s };
}

function measure() {
  view.w = window.innerWidth;
  view.h = window.innerHeight;
  renderer.setSize(view.w, view.h, false);
  camera.aspect = view.w / view.h;
  camera.updateProjectionMatrix();
  view.visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  view.visW = view.visH * camera.aspect;
  view.narrow = camera.aspect < 0.9;

  const narrowScale = Math.min(1, (view.visW * 0.8) / (MODEL_HEIGHT * 0.85));
  const pxPerWorld = view.h / view.visH;
  const maxScroll = document.documentElement.scrollHeight - view.h;
  const knots = PATH.map((p, i) => {
    if (i === 0) return { at: 0, x: p.x, y: p.y, s: p.s, ...heroPose() };
    const r = document.querySelectorAll(p.el)[p.i || 0].getBoundingClientRect();
    const top = r.top + window.scrollY;
    if (p.box) {
      return {
        at: top + r.height / 2 - view.h / 2,
        x: (r.left + r.width / 2) / view.w - 0.5,
        y: 0,
        s: THREE.MathUtils.clamp((r.height * BOX_FIT) / (MODEL_HEIGHT * pxPerWorld), 0.4, 1),
        box: true,
      };
    }
    let x = p.x, s = p.s ?? BASE_SCALE;
    if (view.narrow) { x *= 0.4; s *= narrowScale; }
    return { at: top + (p.f ?? 0.5) * r.height - view.h / 2, x, y: p.y ?? 0, s };
  });

  // Points near the bottom can't reach mid-screen (the page ends first): spread them over the remaining scroll.
  const over = knots.findIndex((k) => k.at > maxScroll);
  if (over > 0) {
    const from = knots[over - 1].at, n = knots.length - over;
    for (let j = 0; j < n; j++) knots[over + j].at = from + ((maxScroll - from) * (j + 1)) / n;
  }
  for (let i = 1; i < knots.length; i++) knots[i].at = Math.max(knots[i].at, knots[i - 1].at + 1);

  // Spins: one full turn over 2 × SPIN_SPAN of scroll, centred on the bend — or, if `spin` is a selector,
  // starting just as the device reaches the top of that element.
  const span = view.h * SPIN_SPAN;
  const spinAts = [0], spinVals = [0];
  PATH.forEach((p, i) => {
    if (!p.spin) return;
    const start = typeof p.spin === 'string'
      ? document.querySelector(p.spin).getBoundingClientRect().top + window.scrollY - view.h * 0.54
      : knots[i].at - span;
    const n = spinVals[spinVals.length - 1];
    spinAts.push(start, start + span * 2);
    spinVals.push(n, n + 1);
  });

  const ats = knots.map((k) => k.at);
  const xs = knots.map((k) => k.x);
  const pows = stretchPowers(ats, xs, view.w);
  const arcs = [];
  PATH.forEach((p, i) => {
    if (p.arc) arcs.push({ from: ats[i - 1], to: ats[i], at: arcStretch(knots[i - 1], knots[i]) });
  });
  const onArc = (s) => {
    for (const a of arcs) if (s > a.from && s < a.to) return a.at((s - a.from) / (a.to - a.from), s);
    return null;
  };
  const wx = waveCurve(ats, xs, pows);
  const wy = waveCurve(ats, knots.map((k) => k.y), pows);
  curves = {
    x: (s) => onArc(s)?.x ?? wx(s),
    y: (s) => onArc(s)?.y ?? wy(s),
    s: waveCurve(ats, knots.map((k) => k.s), pows),
    turns: waveCurve(spinAts, spinVals),
  };
  // `?pathdebug` exposes the live path so a script can draw it onto a full-page screenshot.
  if (PATH_DEBUG) window.__tamaPath = { curves, knots, maxScroll, vw: view.w, vh: view.h, pxPerWorld, MODEL_HEIGHT };
}

const cur = { x: 0, y: 0, s: 1, ry: 0, bank: 0 };
let snapped = false;

function updatePath(dt) {
  const k = snapped ? 1 - Math.exp(-PATH_EASE * dt) : 1;
  snapped = true;
  const prevX = cur.x;
  const s = window.scrollY;
  const target = {
    x: curves.x(s),
    y: curves.y(s),
    s: curves.s(s),
    ry: curves.turns(s) * Math.PI * 2 - curves.x(s) * FACE_IN,
  };
  for (const c in target) cur[c] += (target[c] - cur[c]) * k;
  // Bank into horizontal moves, like the drone leaning as it flies sideways.
  const vx = dt > 0 ? ((cur.x - prevX) * view.visW) / dt : 0;
  const bankTarget = THREE.MathUtils.clamp(-vx * BANK, -0.35, 0.35);
  cur.bank += (bankTarget - cur.bank) * (1 - Math.exp(-4 * dt));

  anchor.position.set(cur.x * view.visW, cur.y * view.visH, 0);
  anchor.scale.setScalar(cur.s);
  anchor.rotation.set(0, cur.ry, cur.bank);
}

// Keychain: the model's own ball chain is low-poly (faceted beads, texture cracks, a crumpled clasp), so it's
// hidden and replaced by a clean one — chrome beads, a thin wire, a cylinder clasp — rising from the ring as a
// narrow loop, hooked through the ring. Its shape is one smooth constant-curvature bend (straight at the ring,
// most bent at the top), computed each frame — no per-bead simulation, so beads can't stretch or fly apart.
// ZERO GRAVITY: nothing pulls the chain back to a rest pose. It loads already leaning a little to the right
// (no entrance motion); it has no favourite side — while the device moves, the chain swings toward
// the trailing side of the movement (equally strong left and right); when the device stops, it drifts a little
// on its momentum and then STAYS in whatever pose it ended up in. A soft boundary keeps it out of the device.
const BALL_CHAIN = {
  beadRadius: 0.00145,   // model units (original beads are ~0.003 across)
  spacing: 0.0037,       // centre-to-centre distance between beads
  wireRadius: 0.00032,
  ringWire: 0.00055,     // thickness (tube radius) of the replacement ring
  height: 0.032,         // upright loop: ring → top
  width: 0.013,          // upright loop: widest point
};
const CHAIN_BEND = {
  start: 0.6,       // resting lean the chain loads with (radians, ~35°)…
  startDir: [1, -0.3], // …toward screen-right (x) and slightly back (z, away from the viewer)
  trail: 1.2,       // while moving, the chain swings toward the trailing side of the movement, this far (radians)…
  reach: 1.5,       // …getting ~63% of the way there per this many chain-heights travelled (faster = gets there sooner)
  momentum: 5,      // how quickly it picks up / loses the push (lower = drifts longer after the device stops)
  limit: 2,         // soft boundary on the bend (radians, ~115°) so it can't swing down into the device…
  wall: 40,         // …and how firmly that boundary pushes back (it bounces off gently)
  follow: 10,       // how quickly the chain turns with the ring when the device turns (lower = more lag)
  ringBlend: 0.35,  // lowest share of the chain that follows the ring's exact angle before the bend takes over
};

function createChain(model) {
  let ring, clasp;
  model.traverse((o) => {
    if (!o.isMesh) return;
    if (/^Sphere_\d+/.test(o.name) || /^Metal.?thread/.test(o.name)) o.visible = false;
    else if (/^Element_01/.test(o.name)) { clasp = o; o.visible = false; }
    else if (/^Circle_02/.test(o.name)) ring = o;
  });
  if (!ring) return null;

  // Measure the model's ring (a low-poly flat band through the pink loop on top): centre, facing and radius,
  // all in model space, so a clean round ring can replace it in exactly the same spot.
  model.updateMatrixWorld(true);
  const rp = ring.geometry.attributes.position;
  const ringPts = [];
  for (let i = 0; i < rp.count; i++) ringPts.push(model.worldToLocal(ring.localToWorld(new THREE.Vector3().fromBufferAttribute(rp, i))));
  const ringC = ringPts.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(ringPts.length);
  const farPt = ringPts.reduce((b, p) => (p.distanceTo(ringC) > b.distanceTo(ringC) ? p : b));
  const radial = farPt.clone().sub(ringC);
  const crossLen = (p) => new THREE.Vector3().crossVectors(radial, p.clone().sub(ringC)).length();
  const sidePt = ringPts.reduce((b, p) => (crossLen(p) > crossLen(b) ? p : b));
  const ringN = new THREE.Vector3().crossVectors(radial, sidePt.clone().sub(ringC)).normalize();
  const ringR = ringPts.reduce((s, p) => {
    const d = p.clone().sub(ringC);
    return s + d.addScaledVector(ringN, -d.dot(ringN)).length();
  }, 0) / ringPts.length;
  // The ring's "top": the in-plane direction closest to the model's up — where the chain hooks over.
  const ringUp = new THREE.Vector3(0, 1, 0).addScaledVector(ringN, -ringN.y).normalize();
  const ringT = new THREE.Vector3().crossVectors(ringN, ringUp);
  ring.visible = false;

  const chrome = new THREE.MeshStandardMaterial({ color: 0xdedede, metalness: 1, roughness: 0.22 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x9a9a9a, metalness: 1, roughness: 0.4 });
  const newRing = new THREE.Mesh(new THREE.TorusGeometry(ringR, BALL_CHAIN.ringWire, 16, 64), chrome);
  newRing.position.copy(ringC);
  newRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), ringN);
  model.add(newRing);
  // The chain hooks over the ring's top wire (the "bar", running along ringT). Like a hinge, it can swing
  // freely AROUND that bar — so it doesn't inherit the ring's tilt (~34° on this model) and has no built-in lean.
  const barLocal = ringC.clone().addScaledVector(ringUp, ringR);

  // Rest shape of the upright loop (base at the ring, top at `height`), slightly tilted in depth.
  const { height: H, width: W } = BALL_CHAIN;
  const loopAt = (u) => new THREE.Vector3(
    (W / 2) * Math.sin(2 * Math.PI * u),
    H * Math.sin(Math.PI * u) ** 2,
    0.003 * Math.sin(2 * Math.PI * u),
  );
  const DENSE = 240;
  const dense = [], len = [0];
  for (let i = 0; i <= DENSE; i++) dense.push(loopAt(i / DENSE));
  for (let i = 1; i <= DENSE; i++) len.push(len[i - 1] + dense[i].distanceTo(dense[i - 1]));
  const total = len[DENSE];
  const atLength = (d) => {
    let i = 1;
    while (i < DENSE && len[i] < d) i++;
    const f = (d - len[i - 1]) / (len[i] - len[i - 1] || 1);
    return dense[i - 1].clone().lerp(dense[i], f);
  };

  const count = Math.max(6, Math.round(total / BALL_CHAIN.spacing));
  const claspLen = BALL_CHAIN.spacing * 1.6;
  const claspAt = total * 0.62;
  const restBeads = [];
  for (let k = 0; k < count; k++) {
    const d = (k / count) * total;
    if (clasp && Math.abs(d - claspAt) < claspLen / 2 + BALL_CHAIN.beadRadius * 0.6) continue;
    restBeads.push(atLength(d));
  }
  const restWire = Array.from({ length: 80 }, (_, i) => atLength((i / 80) * total));
  const restClaspA = atLength(claspAt - claspLen / 2), restClaspB = atLength(claspAt + claspLen / 2);

  const root = new THREE.Group();
  scene.add(root);
  const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(BALL_CHAIN.beadRadius, 24, 16), chrome, restBeads.length);
  root.add(balls);
  const wire = new THREE.Mesh(new THREE.BufferGeometry(), steel);
  root.add(wire);
  const claspR = BALL_CHAIN.beadRadius * 0.85;
  const claspMesh = clasp ? new THREE.Mesh(new THREE.CylinderGeometry(claspR, claspR, claspLen, 20), chrome) : null;
  if (claspMesh) root.add(claspMesh);

  const UP = new THREE.Vector3(0, 1, 0);
  const base = new THREE.Vector3(), prevBase = new THREE.Vector3(), scale = new THREE.Vector3();
  const bend = new THREE.Vector2(), bendVel = new THREE.Vector2(), target = new THREE.Vector2();
  const dir = new THREE.Vector3(), axis = new THREE.Vector3(), q = new THREE.Quaternion(), twistQ = new THREE.Quaternion();
  const nW = new THREE.Vector3(), upW = new THREE.Vector3(), tW = new THREE.Vector3(), atRing = new THREE.Vector3();
  const m = new THREE.Matrix4(), tmp = new THREE.Vector3(), out = new THREE.Vector3();
  let started = false, twist = 0;
  const startBend = new THREE.Vector2(...CHAIN_BEND.startDir).normalize().multiplyScalar(CHAIN_BEND.start);
  if (PATH_DEBUG) window.__tamaChain = bend;

  // Place a rest point. Higher up: walk a circular-arc spine (curvature = angle / H) toward `dir` and carry the
  // point's sideways offset along, rotated with the spine (length-preserving). Near the bottom: lie exactly in
  // the hinge frame, so the bottom of the loop passes through the ring's hole whichever way the device faces.
  // The two blend smoothly over the lowest ringBlend of the chain.
  const shape = (p, angle) => {
    const lateral = tmp.set(p.x, 0, p.z).applyQuaternion(twistQ);
    if (angle < 1e-4) out.set(lateral.x, p.y, lateral.z);
    else {
      const k = angle / H, phi = k * p.y;
      out.copy(dir).multiplyScalar((1 - Math.cos(phi)) / k).addScaledVector(UP, Math.sin(phi) / k);
      q.setFromAxisAngle(axis, phi);
      out.add(lateral.applyQuaternion(q));
    }
    atRing.copy(nW).multiplyScalar(p.x).addScaledVector(upW, p.y).addScaledVector(tW, p.z);
    const w = THREE.MathUtils.smoothstep(p.y, 0, H * CHAIN_BEND.ringBlend);
    return out.lerp(atRing, 1 - w);
  };

  return {
    update(dt) {
      if (dt <= 0) return;
      model.getWorldScale(scale);
      // Hinge frame (world directions; root has no rotation, so these are root-local too): z = the bar's
      // direction, y = straight up as far as the hinge allows (screen-up with the bar component removed),
      // x = through the ring's hole. The lowest bead sits right under the bar along that up direction.
      tW.copy(ringT).transformDirection(model.matrixWorld);
      upW.copy(UP).addScaledVector(tW, -tW.y).normalize();
      nW.crossVectors(upW, tW);
      model.localToWorld(base.copy(barLocal));
      base.addScaledVector(upW, -(BALL_CHAIN.ringWire + BALL_CHAIN.beadRadius) * scale.x);
      root.position.copy(base);
      root.scale.setScalar(scale.x);

      // The chain turns with the ring (it's hooked through it), following its heading with a slight lag.
      const heading = Math.atan2(-nW.z, nW.x);
      let dh = heading - twist;
      dh -= Math.round(dh / (2 * Math.PI)) * 2 * Math.PI;

      if (!started || reduceMotion) {
        bend.copy(startBend);
        bendVel.set(0, 0);
        twist += dh;
      } else {
        // Sideways (screen x) and depth (z) speed, in chain-heights per second (ignore jumps from resizes).
        let vx = (base.x - prevBase.x) / (dt * scale.x * H);
        let vz = (base.z - prevBase.z) / (dt * scale.x * H);
        if (Math.hypot(vx, vz) > 60) { vx = 0; vz = 0; }
        // While moving, swing toward the trailing side of the movement (same rule left and right, wherever the
        // chain currently is) — the more distance covered, the further it gets. When the device stops, the
        // swing fades out (a little drift on momentum) and the bend simply stays where it is.
        const speed = Math.hypot(vx, vz);
        if (speed > 1e-4) {
          const k = 1 - Math.exp(-(speed * dt) / CHAIN_BEND.reach);
          target.set(-vx / speed, -vz / speed).multiplyScalar(CHAIN_BEND.trail).sub(bend).multiplyScalar(k / dt);
        } else {
          target.set(0, 0);
        }
        bendVel.lerp(target, 1 - Math.exp(-CHAIN_BEND.momentum * dt));
        // Soft boundary: past `limit`, push back and kill the outward speed, so it bounces off gently.
        const len = bend.length();
        if (len > CHAIN_BEND.limit) {
          const nx = bend.x / len, ny = bend.y / len;
          const outward = bendVel.x * nx + bendVel.y * ny;
          if (outward > 0) { bendVel.x -= nx * outward; bendVel.y -= ny * outward; }
          const back = (len - CHAIN_BEND.limit) * CHAIN_BEND.wall * dt;
          bendVel.x -= nx * back; bendVel.y -= ny * back;
        }
        bend.addScaledVector(bendVel, dt);
        twist += dh * (1 - Math.exp(-CHAIN_BEND.follow * dt));
      }
      prevBase.copy(base);
      started = true;

      const angle = Math.min(bend.length(), CHAIN_BEND.limit * 1.15);
      if (angle > 1e-4) {
        dir.set(bend.x, 0, bend.y).normalize();
        axis.crossVectors(UP, dir).normalize();
      }
      twistQ.setFromAxisAngle(UP, twist);

      restBeads.forEach((p, i) => {
        const s = shape(p, angle);
        balls.setMatrixAt(i, m.makeTranslation(s.x, s.y, s.z));
      });
      balls.instanceMatrix.needsUpdate = true;

      const pts = restWire.map((p) => shape(p, angle).clone());
      wire.geometry.dispose();
      wire.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 160, BALL_CHAIN.wireRadius, 6, true);

      if (claspMesh) {
        const a = shape(restClaspA, angle).clone(), b = shape(restClaspB, angle);
        claspMesh.position.copy(a).add(b).multiplyScalar(0.5);
        claspMesh.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
      }
    },
  };
}
let chain = null;

new GLTFLoader().load(
  'assets/tamagotchi.glb',
  (gltf) => {
    const model = gltf.scene;
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    model.traverse((o) => {
      if (!o.isMesh) return;
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap']) {
        if (o.material[k]) o.material[k].anisotropy = maxAniso;
      }
    });
    restyleDevice(model, maxAniso);

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    chain = createChain(model);
    model.position.sub(center);
    const wrap = new THREE.Group();
    wrap.add(model);
    wrap.scale.setScalar(MODEL_HEIGHT / size.y);
    wrap.rotation.y = Math.PI; // model's front faces -Z
    idle.add(wrap);

    measure();
    hideLoader();
    start();
  },
  (e) => {
    if (e.total) loaderPct.textContent = Math.round((e.loaded / e.total) * 100) + '%';
  },
  (err) => {
    console.error('[TamaPet] model failed to load', err);
    hideLoader();
  }
);

// Re-measure stop positions whenever the page layout or window size changes.
new ResizeObserver(() => measure()).observe(document.body);
window.addEventListener('resize', measure);
document.fonts.ready.then(measure);

const clock = new THREE.Clock();
function start() {
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    const t = clock.elapsedTime;
    updatePath(dt);
    const k = 1 - Math.exp(-FOLLOW.ease * dt);
    follow.rotation.y += (pointer.x * FOLLOW.yaw - follow.rotation.y) * k;
    follow.rotation.x += (pointer.y * FOLLOW.pitch - follow.rotation.x) * k;
    follow.position.x += (pointer.x * FOLLOW.shift - follow.position.x) * k;
    follow.position.y += (-pointer.y * FOLLOW.shift - follow.position.y) * k;
    if (!reduceMotion) {
      idle.position.y = Math.sin(t * 0.9) * 0.06;
      idle.rotation.y = Math.sin(t * 0.45) * 0.18;
      idle.rotation.z = Math.sin(t * 0.7) * 0.035;
      idle.rotation.x = Math.sin(t * 0.6) * 0.04;
    }
    if (chain) {
      scene.updateMatrixWorld();
      chain.update(dt);
    }
    renderer.render(scene, camera);
  });
}
