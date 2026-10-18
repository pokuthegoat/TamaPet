// The restyled 3D device on its own (game page + debug page): drag to turn it, click its buttons, live LCD.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { restyleDevice } from './device-style.js';
import { attachLcd } from './lcd.js';

export function createDeviceView(canvas, { onPress, onRelease, onReady, onFrame, distance = 4.6, lift = 0, spin = 0, shell = null }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, -lift, distance); // lift > 0 puts the device higher on screen
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0xefe3d3, 2.2);
  rim.position.set(-4, 2, -3);
  scene.add(key, rim);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0, -lift, 0);

  const idle = new THREE.Group();
  scene.add(idle);
  const buttons = {};
  let drawLcd = null, handle = null, wantShell = shell;

  new GLTFLoader().load('assets/tamagotchi.glb', (gltf) => {
    const model = gltf.scene;
    handle = restyleDevice(model, renderer.capabilities.getMaxAnisotropy());
    if (wantShell) handle.setShell(wantShell);
    // The model's original chain is low-poly; the landing page rebuilds it, here the ring is enough.
    model.traverse((o) => { if (/^(Sphere|Metal|Element)/.test(o.name)) o.visible = false; });
    model.traverse((o) => { if (/^TP_(heart|circle|star)$/.test(o.name)) buttons[o.name.slice(3)] = o; });

    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const wrap = new THREE.Group();
    wrap.add(model);
    wrap.scale.setScalar(1.9 / size.y);
    wrap.rotation.y = Math.PI; // model's front faces -Z
    idle.add(wrap);

    renderer.render(scene, camera); // upload the atlas once before copying into it
    drawLcd = attachLcd(renderer, handle);
    onReady?.();
  });

  // The device's own buttons respond on pointer DOWN (and report release, so games can use holding them).
  // Capture phase: runs before OrbitControls, so pressing a button never starts turning the device.
  const ray = new THREE.Raycaster();
  let holding = null;
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
    const hit = ray.intersectObjects(Object.values(buttons), false)[0];
    if (!hit) return;
    holding = hit.object.name.slice(3);
    controls.enabled = false;
    press(holding);
  }, { capture: true });
  const letGo = () => {
    if (!holding) return;
    release(holding);
    holding = null;
    controls.enabled = true;
  };
  window.addEventListener('pointerup', letGo);
  window.addEventListener('pointercancel', letGo);

  // Pushed into the shell while held (model space: front is −z).
  const rest = {};
  function press(btn) {
    onPress(btn);
    const b = buttons[btn];
    if (b && rest[btn] === undefined) { rest[btn] = b.position.z; b.position.z += 0.0012; }
  }
  function release(btn) {
    onRelease?.(btn);
    const b = buttons[btn];
    if (b && rest[btn] !== undefined) { b.position.z = rest[btn]; delete rest[btn]; }
  }

  new ResizeObserver(() => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }).observe(canvas);

  const clock = new THREE.Clock();
  let lastLcd = 0;
  function frame(now) {
    const t = clock.getElapsedTime();
    idle.position.y = Math.sin(t * 0.9) * 0.04;
    idle.rotation.z = Math.sin(t * 0.7) * 0.02;
    if (spin) idle.rotation.y += spin * 0.016; // slow turntable (shop preview)
    controls.update();
    if (now - lastLcd > 50) { // LCD refresh ~20×/s
      lastLcd = now;
      const out = onFrame?.(t); // the LCD buffer, or { buf, pet } with the pet's shop colour
      if (out && drawLcd) out.buf ? drawLcd(out.buf, out.pet) : drawLcd(out);
    }
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(frame);
  // Pause / resume drawing (the shop preview only runs while the shop is open).
  const setActive = (on) => renderer.setAnimationLoop(on ? frame : null);

  // Shell colour (shop): applied now, or as soon as the model has loaded.
  function setShell(rgb) {
    if (String(rgb) === String(wantShell) && handle) return;
    wantShell = rgb;
    handle?.setShell(rgb);
  }

  return { press, release, setShell, setActive };
}
