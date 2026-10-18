import * as THREE from 'three';

// Restyles the Tamagotchi model for TamaPet, once at load, by editing its single texture atlas in a canvas:
// pink shell → TamaPet blue, white plastic → cream, Sailor Moon emblem/ribbons + Bandai text/sticker removed
// (a TamaPet logo and label instead), a pixel-pet illustration on the screen, buttons in cream, and the
// little wings cut out of the mesh. All positions below are in the 2048×2048 atlas.
export const DEVICE_STYLE = {
  shell: [46, 98, 209],     // TamaPet blue, a touch brighter than the page so the device stands out
  cream: [239, 227, 211],
  navy: [11, 57, 134],
  lcd: [139, 146, 128],     // screen background
  lcdDark: [38, 42, 36],    // screen pixels
  lcdMid: [96, 104, 86],    // screen shading pixels
};

const ATLAS = 2048;
const AREAS = {
  emblem: { x: 925, y: 405, w: 600, h: 270 },   // heart + ribbons (front, top)
  logo: { cx: 1220, cy: 520, size: 120 },
  bandai: { x: 975, y: 1105, w: 520, h: 240 },  // embossed "©BANDAI 1997 / MADE IN CHINA" (back)
  sticker: { x: 1008, y: 1534, w: 446, h: 200 },
  screen: { x: 130, y: 1295, w: 427, h: 430, r: 32 }, // the LCD window: measured from the original texture
                                                       // (rounded corners; the cream bezel starts right outside)
  wingPaint: [{ x: 690, y: 590, w: 200, h: 290 }, { x: 1550, y: 590, w: 200, h: 280 }], // where the wings sat
};

// The pet, drawn in screen orientation ('#' dark, 'o' shading, '.' empty). 16 × 16.
const PET = [
  '................',
  '...##......##...',
  '..#oo#....#oo#..',
  '..#ooo####ooo#..',
  '.#oooooooooooo#.',
  '.#oo##oooo##oo#.',
  '.#oo##oooo##oo#.',
  '.#oooooooooooo#.',
  '.#oooo#oo#oooo#.',
  '.#ooooo##ooooo#.',
  '..#oooooooooo#..',
  '...##oooooo##...',
  '.....######.....',
  '.....#....#.....',
  '................',
  '................',
];
// Little "+" sparkles around the pet, like the original screen art (row, col of the centre).
const SPARKLES = [[1, 1], [13, 14]];

const hsv = (r, g, b) => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max ? d / max : 0, max / 255];
};
const isPink = (h, s, v) => (h < 25 || h > 335) && s > 0.18 && v > 0.3;

// The LCD sits sunk into the device: darken it toward its edges (a soft inner shadow inside the rounded window).
export function lcdShade(g, a, radius, k = 1) {
  const steps = 8;
  for (let i = 0; i < steps; i++) {
    const inset = (i + 0.5) * 2 * k;
    g.strokeStyle = `rgba(22, 28, 18, ${0.2 * (1 - i / steps)})`;
    g.lineWidth = 2 * k;
    g.beginPath();
    g.roundRect(a.x + inset, a.y + inset, a.w - inset * 2, a.h - inset * 2, Math.max(0, radius - inset));
    g.stroke();
  }
}

function canvasFrom(image) {
  const c = document.createElement('canvas');
  c.width = image.width;
  c.height = image.height;
  c.getContext('2d', { willReadFrequently: true }).drawImage(image, 0, 0);
  return c;
}

// Cover a rectangle with a soft-edged blob of `fill` (a flat colour), so it blends into the surroundings.
function softFill(g, k, a, fill, blur = 14) {
  g.save();
  g.filter = `blur(${blur * k}px)`;
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(a.x * k, a.y * k, a.w * k, a.h * k, 40 * k);
  g.fill();
  g.restore();
}

function averageColour(data, w, k, rect) {
  let r = 0, gg = 0, b = 0, n = 0;
  for (let y = rect.y; y < rect.y + rect.h; y += 4) {
    for (let x = rect.x; x < rect.x + rect.w; x += 4) {
      const i = (Math.round(y * k) * w + Math.round(x * k)) * 4;
      r += data[i]; gg += data[i + 1]; b += data[i + 2]; n++;
    }
  }
  return `rgb(${Math.round(r / n)},${Math.round(gg / n)},${Math.round(b / n)})`;
}

export function restyleDevice(model, anisotropy) {
  let mat;
  const shells = [], buttons = [];
  model.traverse((o) => {
    if (!o.isMesh) return;
    if (/^Button_/.test(o.name)) buttons.push(o);
    if (/^Corps_/.test(o.name)) { shells.push(o); mat = o.material; }
  });
  if (!mat?.map?.image) return;

  // --- colour atlas -------------------------------------------------------------------------------------
  // Sorted once: pink shell pixels (kept as a list + their brightness, so the shell can be repainted in any
  // colour quickly — shop colours) and white plastic, which turns cream for good.
  const out = canvasFrom(mat.map.image);
  const W = out.width, H = out.height, k = W / ATLAS;
  const g = out.getContext('2d', { willReadFrequently: true });
  const base = g.getImageData(0, 0, W, H);
  const d = base.data;
  const S = DEVICE_STYLE, scr = AREAS.screen;
  const refPink = 0.3 * 232 + 0.59 * 128 + 0.11 * 120;
  const shellIdx = [], shellLum = [];
  const inWindow = (ax, ay) => { // inside the rounded LCD window (atlas units)
    const lx = ax - scr.x, ly = ay - scr.y;
    if (lx < 0 || ly < 0 || lx >= scr.w || ly >= scr.h) return false;
    const cx = Math.min(Math.max(lx, scr.r), scr.w - scr.r), cy = Math.min(Math.max(ly, scr.r), scr.h - scr.r);
    return (lx - cx) ** 2 + (ly - cy) ** 2 <= scr.r ** 2;
  };
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      if (inWindow(x / k, y / k)) continue; // the LCD is painted separately
      const r = d[i], gr = d[i + 1], b = d[i + 2];
      const [h, s, v] = hsv(r, gr, b);
      if (isPink(h, s, v)) {
        shellIdx.push(i);
        shellLum.push((0.3 * r + 0.59 * gr + 0.11 * b) / refPink);
      } else if (s < 0.15 && v > 0.62) {
        const f = v / 0.93;
        d[i] = Math.min(255, S.cream[0] * f); d[i + 1] = Math.min(255, S.cream[1] * f); d[i + 2] = Math.min(255, S.cream[2] * f);
      }
    }
  }
  const idx = Int32Array.from(shellIdx), lum = Float32Array.from(shellLum);
  const work = new ImageData(new Uint8ClampedArray(d.length), W, H);

  // Paints the atlas with the shell in `shell` (RGB), keeping the texture's shading.
  function paint(shell) {
    const w = work.data;
    w.set(d);
    for (let n = 0; n < idx.length; n++) {
      const i = idx[n], f = lum[n];
      w[i] = Math.min(255, shell[0] * f); w[i + 1] = Math.min(255, shell[1] * f); w[i + 2] = Math.min(255, shell[2] * f);
    }
    g.putImageData(work, 0, 0);

    // Emblem + ribbons and the Bandai text: cover with the surrounding shell colour.
    const shellAvg = averageColour(w, W, k, { x: 900, y: 290, w: 640, h: 100 });
    softFill(g, k, AREAS.emblem, shellAvg);
    AREAS.wingPaint.forEach((a) => softFill(g, k, a, shellAvg, 18));
    softFill(g, k, AREAS.bandai, averageColour(w, W, k, { x: 1000, y: 1360, w: 460, h: 120 }));

    // TamaPet logo where the heart was: cream rounded square with a navy "T" (like the nav logo).
    const L = AREAS.logo, ls = L.size * k;
    g.fillStyle = `rgb(${S.cream})`;
    g.beginPath();
    g.roundRect(L.cx * k - ls / 2, L.cy * k - ls / 2, ls, ls, ls * 0.24);
    g.fill();
    g.fillStyle = `rgb(${S.navy})`;
    g.font = `700 ${ls * 0.62}px "DM Sans", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('T', L.cx * k, L.cy * k + ls * 0.04);

    // Back sticker → a cream TamaPet label (text drawn mirrored vertically, like the atlas's back text).
    const st = AREAS.sticker;
    g.fillStyle = `rgb(${S.cream})`;
    g.beginPath();
    g.roundRect(st.x * k, st.y * k, st.w * k, st.h * k, 18 * k);
    g.fill();
    g.save();
    g.translate((st.x + st.w / 2) * k, (st.y + st.h / 2) * k);
    g.scale(1, -1);
    g.fillStyle = `rgb(${S.navy})`;
    g.font = `700 ${70 * k}px "DM Sans", sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('TamaPet', 0, 0);
    g.restore();

    // Screen: LCD background + the pixel pet, inside the rounded LCD window only (the bezel around it stays).
    // In the atlas the screen is turned 90°: screen-up = atlas-left.
    g.save();
    g.beginPath();
    g.roundRect(scr.x * k, scr.y * k, scr.w * k, scr.h * k, scr.r * k);
    g.clip();
    g.fillStyle = `rgb(${S.lcd})`;
    g.fillRect(scr.x * k, scr.y * k, scr.w * k, scr.h * k);
    const cell = (Math.min(scr.w, scr.h) / 18) * k;
    const ox = scr.x * k + (scr.w * k - cell * 16) / 2, oy = scr.y * k + (scr.h * k - cell * 16) / 2;
    const plot = (row, col, colour) => {
      g.fillStyle = `rgb(${colour})`;
      g.fillRect(ox + row * cell, oy + col * cell, cell * 0.92, cell * 0.92);
    };
    PET.forEach((line, row) => [...line].forEach((ch, col) => {
      if (ch === '#') plot(row, col, S.lcdDark);
      else if (ch === 'o') plot(row, col, S.lcdMid);
    }));
    SPARKLES.forEach(([row, col]) => {
      [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => plot(row + dr, col + dc, S.lcdDark));
    });
    lcdShade(g, { x: scr.x * k, y: scr.y * k, w: scr.w * k, h: scr.h * k }, scr.r * k, k);
    g.restore();
  }
  paint(S.shell);

  const map = new THREE.CanvasTexture(out);
  map.flipY = false;
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = mat.map.wrapS;
  map.wrapT = mat.map.wrapT;
  map.anisotropy = anisotropy;
  mat.map = map;

  // --- bump (normal) atlas: flatten the emblem and the embossed Bandai text ------------------------------
  if (mat.normalMap?.image) {
    const nc = canvasFrom(mat.normalMap.image);
    const ng = nc.getContext('2d');
    softFill(ng, k, AREAS.emblem, 'rgb(128,128,255)', 6);
    softFill(ng, k, AREAS.bandai, 'rgb(128,128,255)', 6);
    softFill(ng, k, AREAS.sticker, 'rgb(128,128,255)', 4);
    AREAS.wingPaint.forEach((a) => softFill(ng, k, a, 'rgb(128,128,255)', 10));
    const normal = new THREE.CanvasTexture(nc);
    normal.flipY = false;
    normal.colorSpace = THREE.NoColorSpace;
    normal.wrapS = mat.normalMap.wrapS;
    normal.wrapT = mat.normalMap.wrapT;
    normal.anisotropy = anisotropy;
    mat.normalMap = normal;
  }
  mat.needsUpdate = true;

  model.updateMatrixWorld(true);
  rebuildButtons(model, buttons, shells);

  // --- wings: two small separate pieces of the shell mesh, mirrored at its upper left and right ----------
  shells.forEach((mesh) => removeWings(mesh, model));

  // Handle for drawing live content on the LCD (lcd.js): the atlas texture, its canvas and where the rounded
  // LCD window sits in it; setShell(rgb) repaints the shell colour (shop).
  return {
    map, canvas: out, atlasSize: W, area: { x: scr.x * k, y: scr.y * k, w: scr.w * k, h: scr.h * k }, radius: scr.r * k,
    setShell(rgb) { paint(rgb); map.needsUpdate = true; },
  };
}

// The model's buttons are low-poly (faceted outlines). Replace each with a clean, domed "pillow" button in cream
// plastic that fills its hole: sized and centred to the original button's flat top face (the hole was made to
// fit it — the "hole" is a narrow groove around a raised floor, so it can't be found by raycasting). All three
// share one tilt (the average of the shell's surface around them) so they read as a matching set.
// Left to right on the device (model +x is the device's left, since the model is shown turned 180°):
// heart, circle, star.
const BUTTON = {
  fill: 0.04,     // how much bigger than the original's top face (fills the groove a little more)
  raise: 0.08,    // how far the dome's top stands in front of the original's top face (fraction of half-size)
  dome: 0.32,     // height of the rounded top (fraction of half-size)
  inset: [0.16, 0.3, 0.07], // how far the rounding reaches in from the edge, per shape (bigger folds the heart's
                            // notch and the star's inner corners)
};

function rebuildButtons(model, buttons, shells) {
  if (buttons.length !== 3) return;
  const ray = new THREE.Raycaster();
  const toWorld = (p) => model.localToWorld(p.clone());
  const toModel = (p) => model.worldToLocal(p.clone());
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(`rgb(${DEVICE_STYLE.cream})`), roughness: 0.42, metalness: 0, clearcoat: 0.4, clearcoatRoughness: 0.35,
  });

  // 1. Each original button: its flat top face (biggest group of vertices with matching normals) gives the
  //    exact outline the hole was made for. Also the shell surface just around it, for the shared tilt.
  const measured = buttons.map((mesh) => {
    const pts = pointsIn(model, mesh);
    const toLocal = new THREE.Matrix4().copy(model.matrixWorld).invert().multiply(mesh.matrixWorld);
    const nrm = mesh.geometry.attributes.normal;
    const groups = [];
    pts.forEach((_, i) => {
      const n = new THREE.Vector3().fromBufferAttribute(nrm, i).transformDirection(toLocal);
      const g = groups.find((grp) => grp.dir.dot(n) > 0.97);
      if (g) g.ids.push(i); else groups.push({ dir: n, ids: [i] });
    });
    const face = groups.filter((grp) => grp.dir.z < 0).sort((a, b) => b.ids.length - a.ids.length)[0];
    const facePts = face.ids.map((i) => pts[i]);
    const centre = new THREE.Box3().setFromPoints(facePts).getCenter(new THREE.Vector3());
    const size = new THREE.Box3().setFromPoints(facePts).getSize(new THREE.Vector3());
    const reach = Math.max(size.x, size.y);
    const fwd = new THREE.Vector3(0, 0, -1);
    const rim = [[0, 1], [0, -1], [1, 0], [-1, 0]].map(([dx, dy]) => {
      const o = centre.clone().add(new THREE.Vector3(dx, dy, 0).multiplyScalar(reach * 0.9)).addScaledVector(fwd, reach * 2);
      ray.set(toWorld(o), fwd.clone().negate().transformDirection(model.matrixWorld));
      const hit = ray.intersectObjects(shells, false)[0];
      return hit ? toModel(hit.point) : null;
    });
    let normal = new THREE.Vector3(0, 0, -1), shell = centre.clone();
    if (rim.every(Boolean)) {
      normal = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(rim[2], rim[3]), new THREE.Vector3().subVectors(rim[0], rim[1]),
      ).normalize();
      if (normal.z > 0) normal.negate();
      shell = rim.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(4);
    }
    return { mesh, facePts, centre, shell, normal, x: centre.x };
  });
  measured.sort((a, b) => b.x - a.x);

  // 2. One shared facing direction for all three: straight out of the holes (they're cut front-to-back, along
  //    the model's −z). Tilting to the shell's curve slides the buttons off-centre as they sink into the holes.
  const N = new THREE.Vector3(0, 0, -1);
  const up = new THREE.Vector3(0, 1, 0).addScaledVector(N, -N.y).normalize();
  const side = new THREE.Vector3().crossVectors(up, N);
  const basis = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(side, up, N));

  const shapes = [heartShape(), circleShape(), starShape()];
  measured.forEach((b, i) => {
    // 3. The original's outline in the shared button plane: width, height and centre.
    const d = new THREE.Vector3();
    const xs = b.facePts.map((p) => d.subVectors(p, b.centre).dot(side));
    const ys = b.facePts.map((p) => d.subVectors(p, b.centre).dot(up));
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const w = maxX - minX, h = maxY - minY, half = Math.min(w, h) / 2;
    const centre = b.centre.clone().addScaledVector(side, (minX + maxX) / 2).addScaledVector(up, (minY + maxY) / 2);

    // 4. Shape scaled to the original's outline, in real units so the rounding stays even.
    const outline = shapes[i].getPoints(64);
    if (outline[0].distanceTo(outline[outline.length - 1]) < 1e-6) outline.pop(); // closed curves repeat the start
    const ob = new THREE.Box2().setFromPoints(outline), oc = ob.getCenter(new THREE.Vector2()), os = ob.getSize(new THREE.Vector2());
    const grow = 1 + BUTTON.fill;
    const shape = new THREE.Shape(outline.map((p) => new THREE.Vector2((p.x - oc.x) * (w / os.x) * grow, (p.y - oc.y) * (h / os.y) * grow)));

    // 5. Domed pillow: rounded top (the bevel, kept inside the outline), body running back into the hole.
    const inset = half * BUTTON.inset[i], dome = half * BUTTON.dome, body = half * 2;
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: body, curveSegments: 64, steps: 1, bevelEnabled: true,
      bevelThickness: dome, bevelSize: inset, bevelOffset: -inset, bevelSegments: 12,
    });
    const btn = new THREE.Mesh(geo, mat);
    btn.name = ['TP_heart', 'TP_circle', 'TP_star'][i];
    btn.quaternion.copy(basis);
    // Extrusion's front (top of the dome) is at z = body + dome; put it just in front of the original's top face
    // (which was placed to clear the hole's rim — the shell slopes back toward the bottom of the egg).
    btn.position.copy(centre).addScaledVector(N, half * BUTTON.raise - body - dome);
    model.add(btn);
    b.mesh.visible = false;
  });
}

function pointsIn(model, mesh) {
  const pos = mesh.geometry.attributes.position, pts = [];
  for (let i = 0; i < pos.count; i++) pts.push(model.worldToLocal(mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(pos, i))));
  return pts;
}

function circleShape() {
  const s = new THREE.Shape();
  s.absarc(0, 0, 0.5, 0, Math.PI * 2, false);
  return s;
}

function heartShape() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.5);
  s.bezierCurveTo(-0.12, -0.36, -0.52, -0.12, -0.52, 0.14);
  s.bezierCurveTo(-0.52, 0.38, -0.32, 0.5, -0.17, 0.5);
  s.bezierCurveTo(-0.06, 0.5, 0, 0.42, 0, 0.32);
  s.bezierCurveTo(0, 0.42, 0.06, 0.5, 0.17, 0.5);
  s.bezierCurveTo(0.32, 0.5, 0.52, 0.38, 0.52, 0.14);
  s.bezierCurveTo(0.52, -0.12, 0.12, -0.36, 0, -0.5);
  return s;
}

function starShape() {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 0.22 : 0.52, a = Math.PI / 2 + (i * Math.PI) / 5;
    const x = Math.cos(a) * r, y = Math.sin(a) * r - 0.04;
    if (i) s.lineTo(x, y); else s.moveTo(x, y);
  }
  s.closePath();
  return s;
}

// Split the mesh into connected pieces (vertices at the same position count as connected, since UV seams
// duplicate them) and drop the wing pieces: small (under 150 triangles), well off-centre sideways, mid-height.
function removeWings(mesh, model) {
  const geo = mesh.geometry, pos = geo.attributes.position;
  if (!geo.index) return;
  const idx = geo.index.array, n = pos.count;
  const parent = Array.from({ length: n }, (_, i) => i);
  const find = (a) => { while (parent[a] !== a) a = parent[a] = parent[parent[a]]; return a; };
  const unite = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  for (let t = 0; t < idx.length; t += 3) { unite(idx[t], idx[t + 1]); unite(idx[t], idx[t + 2]); }
  const seen = new Map(), v = new THREE.Vector3();
  const local = [];
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(pos, i);
    local.push(model.worldToLocal(mesh.localToWorld(v.clone())));
    const key = `${v.x.toFixed(6)},${v.y.toFixed(6)},${v.z.toFixed(6)}`;
    if (seen.has(key)) unite(i, seen.get(key)); else seen.set(key, i);
  }
  const pieces = new Map();
  for (let t = 0; t < idx.length; t += 3) {
    const r = find(idx[t]);
    if (!pieces.has(r)) pieces.set(r, { tris: 0, box: new THREE.Box3() });
    const p = pieces.get(r);
    p.tris++;
    for (let j = 0; j < 3; j++) p.box.expandByPoint(local[idx[t + j]]);
  }
  const wings = new Set();
  pieces.forEach((p, r) => {
    const c = p.box.getCenter(new THREE.Vector3());
    if (p.tris < 150 && Math.abs(c.x) > 0.012 && c.y > 0.03 && c.y < 0.06) wings.add(r);
  });
  if (!wings.size) return;
  const keep = [];
  for (let t = 0; t < idx.length; t += 3) if (!wings.has(find(idx[t]))) keep.push(idx[t], idx[t + 1], idx[t + 2]);
  geo.setIndex(keep);
}
