// The minigames. Each runs in the 30 × 26 pixel field under the score line (game.js draws the frame, score,
// best score, READY / PAUSE / GAME OVER and turns the score into XP).
//
// A game: { name, rate (XP per point), pausable (● pauses — only where ● isn't a game control), hint,
//           create() → { score, over, press(btn), update(dt, held), draw(F, t) } }
// btn / held keys: heart, circle, star, up, down, left, right. dt in ms, t in s. F draws in field coordinates
// (F.sprite(rows, x, y, c): '#' in colour c — default dark — and 'o' in mid; 0 = unlit).

const W = 30, H = 26;
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const hit = (ax, ay, aw, ah, bx, by, bw, bh) => ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
const goLeft = (h) => h.heart || h.left;
const goRight = (h) => h.star || h.right;
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

// ---------------------------------------------------------------------------------------------- SNAKE
const snake = {
  name: 'SNAKE', rate: 2, pausable: true,
  hint: '♥ turn left · ★ turn right · ● pause · or arrow keys',
  create() {
    const GW = 15, GH = 13; // 2 × 2 pixel cells
    const g = { score: 0, over: false };
    let body = [[7, 6], [6, 6], [5, 6]], dir = [1, 0], queue = [], step = 170, acc = 0, food;
    const placeFood = () => {
      const free = [];
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (!body.some(([bx, by]) => bx === x && by === y)) free.push([x, y]);
      food = free.length ? free[rnd(0, free.length - 1)] : [-9, -9];
    };
    const steer = (d) => {
      const prev = queue.length ? queue[queue.length - 1] : dir;
      if ((d[0] === -prev[0] && d[1] === -prev[1]) || (d[0] === prev[0] && d[1] === prev[1])) return;
      if (queue.length < 2) queue.push(d);
    };
    placeFood();
    g.press = (b) => {
      if (b === 'heart' || b === 'star') {
        const [dx, dy] = queue.length ? queue[queue.length - 1] : dir;
        steer(b === 'heart' ? [dy, -dx] : [-dy, dx]);
      } else if (DIRS[b]) steer(DIRS[b]);
    };
    g.update = (dt) => {
      acc += dt;
      while (!g.over && acc >= step) {
        acc -= step;
        if (queue.length) dir = queue.shift();
        const head = [body[0][0] + dir[0], body[0][1] + dir[1]];
        const ate = head[0] === food[0] && head[1] === food[1];
        const rest = ate ? body : body.slice(0, -1);
        if (head[0] < 0 || head[1] < 0 || head[0] >= GW || head[1] >= GH || rest.some(([x, y]) => x === head[0] && y === head[1])) { g.over = true; return; }
        body = [head, ...rest];
        if (ate) { g.score++; step = Math.max(90, step - 5); placeFood(); }
      }
    };
    g.draw = (F, t) => {
      body.forEach(([x, y], i) => F.rect(x * 2, y * 2, 2, 2, i ? 1 : 2));
      if (Math.floor(t * 4) % 2 === 0) F.rect(food[0] * 2, food[1] * 2, 2, 2);
    };
    return g;
  },
};

// ----------------------------------------------------------------------------------------------- PONG
const pong = {
  name: 'PONG', rate: 1, pausable: true,
  hint: 'hold ♥ up · hold ★ down · ● pause · or ↑ ↓',
  create() {
    const g = { score: 0, over: false };
    const PH = 7;
    let py = (H - PH) / 2, cy = (H - PH) / 2, bx, by, vx, vy, speed;
    const serve = (toPlayer) => {
      bx = W / 2 - 1; by = rnd(6, H - 8); speed = 15;
      vx = toPlayer ? -speed : speed; vy = (Math.random() < 0.5 ? -1 : 1) * rnd(5, 9);
    };
    serve(true);
    g.press = () => {};
    g.update = (dt, h) => {
      const s = dt / 1000;
      const dir = (h.heart || h.up ? -1 : 0) + (h.star || h.down ? 1 : 0);
      py = Math.min(H - PH, Math.max(0, py + dir * 26 * s));
      // computer: follows the ball when it's coming its way, a bit slower than the ball can move
      if (vx > 0) cy += Math.sign(by + 1 - (cy + PH / 2)) * Math.min(Math.abs(by + 1 - (cy + PH / 2)), 11 * s);
      cy = Math.min(H - PH, Math.max(0, cy));
      bx += vx * s; by += vy * s;
      if (by < 0) { by = 0; vy = Math.abs(vy); }
      if (by > H - 2) { by = H - 2; vy = -Math.abs(vy); }
      if (vx < 0 && bx <= 2 && bx > 0 && by + 2 > py && by < py + PH) { // player hits
        bx = 2; speed = Math.min(34, speed * 1.06); vx = speed;
        vy += ((by + 1) - (py + PH / 2)) * 2.2;
        g.score++;
      }
      if (vx > 0 && bx >= W - 4 && bx < W - 2 && by + 2 > cy && by < cy + PH) { bx = W - 4; vx = -speed; }
      if (bx < -2) g.over = true;
      if (bx > W) { g.score += 3; serve(true); } // the computer missed
    };
    g.draw = (F) => {
      for (let y = 0; y < H; y += 3) F.px(W / 2, y, 1);
      F.rect(1, Math.round(py), 1, PH);
      F.rect(W - 2, Math.round(cy), 1, PH);
      F.rect(Math.round(bx), Math.round(by), 2, 2);
    };
    return g;
  },
};

// --------------------------------------------------------------------------------------------- BRICKS
const bricks = {
  name: 'BRICKS', rate: 1, pausable: true,
  hint: 'hold ♥ left · hold ★ right · ● pause · or ← →',
  create() {
    const g = { score: 0, over: false };
    const PW = 7, PY = 24;
    let px = (W - PW) / 2, bx, by, vx, vy, speed = 15, wall;
    const build = () => {
      wall = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) wall.push({ x: c * 5, y: 2 + r * 3, alive: true });
    };
    const launch = () => { bx = px + PW / 2; by = PY - 2; const a = (Math.random() * 0.8 - 0.4); vx = Math.sin(a) * speed; vy = -Math.cos(a) * speed; };
    build(); launch();
    const brickAt = (x, y) => wall.find((b) => b.alive && x >= b.x && x < b.x + 4 && y >= b.y && y < b.y + 2);
    g.press = () => {};
    g.update = (dt, h) => {
      const s = dt / 1000;
      px = Math.min(W - PW, Math.max(0, px + ((goRight(h) ? 1 : 0) - (goLeft(h) ? 1 : 0)) * 28 * s));
      const n = Math.ceil((speed * s) / 0.5);
      for (let i = 0; i < n && !g.over; i++) {
        const nx = bx + (vx * s) / n;
        let b = brickAt(nx, by);
        if (nx < 0 || nx >= W || b) { vx = -vx; if (b) { b.alive = false; g.score++; } } else bx = nx;
        const ny = by + (vy * s) / n;
        b = brickAt(bx, ny);
        if (ny < 0 || b) { vy = -vy; if (b) { b.alive = false; g.score++; } } else by = ny;
        if (vy > 0 && by >= PY - 1 && by < PY + 1 && bx >= px - 0.5 && bx < px + PW + 0.5) { // paddle
          const a = ((bx - (px + PW / 2)) / (PW / 2)) * 1.0;
          vx = Math.sin(a) * speed; vy = -Math.cos(a) * speed; by = PY - 1;
        }
        if (by > H) g.over = true;
      }
      if (wall.every((b) => !b.alive)) { speed *= 1.12; build(); launch(); }
    };
    g.draw = (F) => {
      wall.forEach((b, i) => b.alive && F.rect(b.x, b.y, 4, 2, i < 12 ? 2 : 1));
      F.rect(Math.round(px), PY, PW, 1);
      F.px(Math.floor(bx), Math.floor(by));
    };
    return g;
  },
};

// ----------------------------------------------------------------------------------------------- FLAP
const flap = {
  name: 'FLAP', rate: 3, pausable: false,
  hint: 'any button to flap',
  create() {
    const g = { score: 0, over: false };
    const BX = 6, GAP = 10;
    let y = 10, vy = 0, speed = 11, pipes = [{ x: W + 4, gy: rnd(3, H - GAP - 3), passed: false }];
    g.press = () => { vy = -20; };
    g.update = (dt) => {
      const s = dt / 1000;
      vy = Math.min(30, vy + 70 * s);
      y += vy * s;
      pipes.forEach((p) => { p.x -= speed * s; });
      if (pipes[pipes.length - 1].x < W - 15) pipes.push({ x: W + 1, gy: rnd(3, H - GAP - 3), passed: false });
      if (pipes[0].x < -4) pipes.shift();
      for (const p of pipes) {
        if (!p.passed && p.x + 3 < BX) { p.passed = true; g.score++; speed = Math.min(20, speed + 0.4); }
        const by = Math.round(y), px = Math.round(p.x); // test what's drawn
        if (hit(BX, by, 3, 3, px, 0, 3, p.gy) || hit(BX, by, 3, 3, px, p.gy + GAP, 3, H)) g.over = true;
      }
      if (Math.round(y) < -1 || Math.round(y) > H - 3) g.over = true;
    };
    g.draw = (F) => {
      pipes.forEach((p) => {
        const x = Math.round(p.x);
        F.rect(x, 0, 3, p.gy, 1); F.rect(x, p.gy + GAP, 3, H - p.gy - GAP, 1);
        F.rect(x - 1, p.gy - 1, 5, 1); F.rect(x - 1, p.gy + GAP, 5, 1);
      });
      F.sprite(vy < 0 ? ['.#.', '###', '#.#'] : ['#.#', '###', '.#.'], BX, Math.round(y));
    };
    return g;
  },
};

// ----------------------------------------------------------------------------------------------- JUMP
const jump = {
  name: 'JUMP', rate: 2, pausable: false,
  hint: 'any button to jump',
  create() {
    const g = { score: 0, over: false };
    const GROUND = 22, RX = 4;
    let y = 0, vy = 0, speed = 14, obs = [{ x: W + 2, h: 3, passed: false }], gap = rnd(16, 28);
    g.press = () => { if (y === 0) vy = 34; }; // apex ~7 px: clears the tall (4 px) obstacles with room to spare
    g.update = (dt) => {
      const s = dt / 1000;
      if (y > 0 || vy > 0) { y += vy * s; vy -= 80 * s; if (y <= 0) { y = 0; vy = 0; } }
      obs.forEach((o) => { o.x -= speed * s; });
      const last = obs[obs.length - 1];
      if (last.x < W - gap) { obs.push({ x: W + 1, h: Math.random() < 0.35 ? 4 : 3, passed: false }); gap = rnd(14, 28); }
      if (obs[0].x < -3) obs.shift();
      for (const o of obs) {
        if (!o.passed && o.x + 2 < RX) { o.passed = true; g.score++; speed = Math.min(26, speed + 0.5); }
        if (hit(RX, Math.round(GROUND - 5 - y), 3, 5, Math.round(o.x), GROUND - o.h, 2, o.h)) g.over = true; // as drawn
      }
    };
    g.draw = (F, t) => {
      F.rect(0, GROUND, W, 1, 1);
      for (let x = Math.floor(-((t * speed) % 6)); x < W; x += 6) F.px(x + 3, GROUND + 2, 1);
      const legs = y > 0 ? '#.#' : Math.floor(t * 8) % 2 ? '#..' : '..#';
      F.sprite(['.##', '###', '.#.', '###', legs], RX, Math.round(GROUND - 5 - y));
      obs.forEach((o) => { F.rect(Math.round(o.x), GROUND - o.h, 2, o.h); F.px(Math.round(o.x) - 1, GROUND - o.h + 1); });
    };
    return g;
  },
};

// ---------------------------------------------------------------------------------------------- SPACE
const space = {
  name: 'SPACE', rate: 1, pausable: false,
  hint: 'hold ♥ left · hold ★ right · ● fire · or ← → ↑',
  create() {
    const g = { score: 0, over: false };
    const SY = 24;
    let sx = 12, shot = null, bombs = [], aliens, dirX = 1, stepMs = 520, acc = 0, bombAcc = 0, wave = 0, frame = 0;
    const newWave = () => {
      aliens = [];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) aliens.push({ x: 2 + c * 5, y: 1 + r * 4 + Math.min(wave, 3) });
      stepMs = Math.max(220, 520 - wave * 60);
      wave++;
    };
    newWave();
    g.press = (b) => { if ((b === 'circle' || b === 'up') && !shot) shot = { x: Math.round(sx) + 2, y: SY - 2 }; };
    g.update = (dt, h) => {
      const s = dt / 1000;
      sx = Math.min(W - 5, Math.max(0, sx + ((goRight(h) ? 1 : 0) - (goLeft(h) ? 1 : 0)) * 22 * s));
      if (shot) {
        shot.y -= 34 * s;
        const a = aliens.find((al) => hit(shot.x, Math.round(shot.y), 1, 2, al.x, al.y, 3, 2));
        if (a) { aliens.splice(aliens.indexOf(a), 1); shot = null; g.score++; }
        else if (shot.y < -2) shot = null;
      }
      acc += dt;
      const interval = Math.max(90, stepMs * (aliens.length / 15));
      if (acc >= interval) {
        acc = 0; frame ^= 1;
        const edge = aliens.some((a) => (dirX > 0 ? a.x + 3 >= W : a.x <= 0));
        if (edge) { dirX = -dirX; aliens.forEach((a) => { a.y += 1; }); } else aliens.forEach((a) => { a.x += dirX; });
      }
      bombAcc += dt;
      if (bombAcc > 1100 && aliens.length) {
        bombAcc = 0;
        const a = aliens[rnd(0, aliens.length - 1)];
        bombs.push({ x: a.x + 1, y: a.y + 2 });
      }
      bombs.forEach((b) => { b.y += 15 * s; });
      bombs = bombs.filter((b) => b.y < H);
      if (bombs.some((b) => hit(b.x, Math.round(b.y), 1, 2, Math.round(sx), SY, 5, 2))) g.over = true; // as drawn
      if (aliens.some((a) => a.y + 2 >= SY)) g.over = true;
      if (!aliens.length) { newWave(); bombs = []; }
    };
    g.draw = (F) => {
      aliens.forEach((a) => F.sprite(frame ? ['#.#', '###'] : ['###', '#.#'], a.x, a.y));
      F.sprite(['..#..', '#####'], Math.round(sx), SY);
      if (shot) F.rect(shot.x, Math.round(shot.y), 1, 2);
      bombs.forEach((b) => F.rect(b.x, Math.round(b.y), 1, 2, 1));
    };
    return g;
  },
};

// --------------------------------------------------------------------------------------------- BLOCKS
const PIECES = [
  [[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]], [[2, 0], [0, 1], [1, 1], [2, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]],
];
const blocks = {
  name: 'BLOCKS', rate: 5, pausable: false,
  hint: '♥ left · ★ right · ● turn · ↓ drop · or arrow keys',
  create() {
    const g = { score: 0, over: false };
    const BW = 10, BH = 13, OX = 5; // 2 × 2 pixel cells, board centred in the field
    const board = Array.from({ length: BH }, () => Array(BW).fill(0));
    let cells, px, py, acc = 0, fall = 650;
    const fits = (cs, x, y) => cs.every(([cx, cy]) => {
      const bx = x + cx, by = y + cy;
      return bx >= 0 && bx < BW && by < BH && (by < 0 || !board[by][bx]);
    });
    const spawn = () => {
      cells = PIECES[rnd(0, PIECES.length - 1)].map((c) => [...c]);
      px = 3; py = 0;
      if (!fits(cells, px, py)) g.over = true;
    };
    const lock = () => {
      cells.forEach(([cx, cy]) => { if (py + cy >= 0) board[py + cy][px + cx] = 1; });
      let lines = 0;
      for (let y = BH - 1; y >= 0; y--) {
        if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(BW).fill(0)); lines++; y++; }
      }
      if (lines) { g.score += lines; fall = Math.max(160, 650 - g.score * 25); }
      spawn();
    };
    const move = (dx, dy) => { if (fits(cells, px + dx, py + dy)) { px += dx; py += dy; return true; } return false; };
    const rotate = () => {
      const maxY = Math.max(...cells.map((c) => c[1]));
      const r = cells.map(([x, y]) => [maxY - y, x]);
      for (const k of [0, -1, 1, -2, 2]) if (fits(r, px + k, py)) { cells = r; px += k; return; }
    };
    spawn();
    g.press = (b) => {
      if (b === 'heart' || b === 'left') move(-1, 0);
      else if (b === 'star' || b === 'right') move(1, 0);
      else if (b === 'circle' || b === 'up') rotate();
      else if (b === 'down' && !move(0, 1)) lock();
    };
    g.update = (dt, h) => {
      acc += dt;
      const speed = h.down ? 50 : fall;
      while (!g.over && acc >= speed) { acc -= speed; if (!move(0, 1)) lock(); }
    };
    g.draw = (F) => {
      F.rect(OX - 1, 0, 1, H, 1); F.rect(OX + BW * 2, 0, 1, H, 1);
      board.forEach((row, y) => row.forEach((v, x) => v && F.rect(OX + x * 2, y * 2, 2, 2, 1)));
      cells.forEach(([cx, cy]) => F.rect(OX + (px + cx) * 2, (py + cy) * 2, 2, 2));
    };
    return g;
  },
};

// --------------------------------------------------------------------------------------------- MEMORY
const SYMBOLS = {
  heart: ['.##..##.', '########', '########', '########', '.######.', '..####..', '...##...', '........'],
  circle: ['..####..', '.######.', '########', '########', '########', '########', '.######.', '..####..'],
  star: ['...##...', '...##...', '########', '.######.', '..####..', '.##..##.', '##....##', '........'],
};
const memory = {
  name: 'MEMORY', rate: 3, pausable: false,
  hint: 'watch, then repeat with ♥ ● ★',
  create() {
    const g = { score: 0, over: false };
    const KEYS = ['heart', 'circle', 'star'];
    const seq = [KEYS[rnd(0, 2)]];
    let phase = 'show', i = 0, clock = -400, lit = null, litUntil = 0, now = 0;
    g.press = (b) => {
      const k = { left: 'heart', up: 'circle', down: 'circle', right: 'star' }[b] || b;
      if (phase !== 'input' || !KEYS.includes(k)) return;
      lit = k; litUntil = now + 220;
      if (k !== seq[i]) { g.over = true; return; }
      i++;
      if (i === seq.length) { g.score++; seq.push(KEYS[rnd(0, 2)]); phase = 'pause'; clock = now; }
    };
    g.update = (dt) => {
      now += dt;
      const step = Math.max(380, 650 - seq.length * 20);
      if (phase === 'show') {
        clock += dt;
        const n = Math.floor(clock / step);
        if (clock < 0) lit = null;
        else if (n >= seq.length) { phase = 'input'; i = 0; lit = null; }
        else lit = clock % step < step * 0.7 ? seq[n] : null;
      } else if (phase === 'pause' && now - clock > 700) { phase = 'show'; clock = -300; }
      if (phase !== 'show' && now > litUntil) lit = null;
    };
    g.draw = (F) => {
      KEYS.forEach((k, n) => {
        const x = 1 + n * 10;
        if (lit === k) { F.rect(x - 1, 4, 10, 10); F.sprite(SYMBOLS[k], x, 5, 0); } // lit: inverted
        else F.sprite(SYMBOLS[k], x, 5, 1);
      });
      F.textC(phase === 'input' ? 'YOU' : 'WATCH', 18);
    };
    return g;
  },
};

// ---------------------------------------------------------------------------------------------- RACER
const racer = {
  name: 'RACER', rate: 1, pausable: true,
  hint: '♥ left lane · ★ right lane · ● pause · or ← →',
  create() {
    const g = { score: 0, over: false };
    const LANES = [3, 13, 23], CY = 20, CAR = ['.#.#.', '#####', '.###.', '#####', '.#.#.'];
    let lane = 1, cars = [], speed = 12, dist = 0, gap = 0;
    g.press = (b) => {
      if (b === 'heart' || b === 'left') lane = Math.max(0, lane - 1);
      if (b === 'star' || b === 'right') lane = Math.min(2, lane + 1);
    };
    g.update = (dt) => {
      const s = dt / 1000;
      dist += speed * s;
      cars.forEach((c) => { c.y += speed * s; });
      gap -= speed * s;
      if (gap <= 0) {
        const n = Math.random() < 0.3 ? 2 : 1; // never all three lanes
        const free = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, n);
        free.forEach((l) => cars.push({ lane: l, y: -6, passed: false }));
        gap = rnd(11, 17);
      }
      for (const c of cars) {
        if (!c.passed && c.y > CY + 5) { c.passed = true; g.score++; speed = Math.min(30, speed + 0.35); }
        if (c.lane === lane && hit(0, Math.round(c.y), 1, 5, 0, CY, 1, 5)) g.over = true; // as drawn
      }
      cars = cars.filter((c) => c.y < H + 2);
    };
    g.draw = (F) => {
      for (let y = Math.floor(dist % 4) - 4; y < H; y += 4) { F.rect(9, y, 1, 2, 1); F.rect(19, y, 1, 2, 1); }
      cars.forEach((c) => F.sprite(CAR, LANES[c.lane], Math.round(c.y)));
      F.sprite(CAR, LANES[lane], CY);
    };
    return g;
  },
};

// ---------------------------------------------------------------------------------------------- CATCH
const catchGame = {
  name: 'CATCH', rate: 1, pausable: true,
  hint: 'hold ♥ left · hold ★ right · ● pause · or ← →',
  create() {
    const g = { score: 0, over: false };
    const BY = 22, BW = 7, FOOD = ['.#.', '###', '.#.'];
    let bx = 11, items = [], spawn = 600, lives = 3, fallSpeed = 9;
    g.press = () => {};
    g.update = (dt, h) => {
      const s = dt / 1000;
      bx = Math.min(W - BW, Math.max(0, bx + ((goRight(h) ? 1 : 0) - (goLeft(h) ? 1 : 0)) * 26 * s));
      spawn -= dt;
      if (spawn <= 0) { items.push({ x: rnd(0, W - 3), y: -3 }); spawn = Math.max(450, 1300 - g.score * 30); }
      items.forEach((it) => { it.y += fallSpeed * s; });
      items = items.filter((it) => {
        if (Math.round(it.y) + 3 >= BY && Math.round(it.y) < BY + 1 && hit(it.x, 0, 3, 1, Math.round(bx), 0, BW, 1)) { g.score++; fallSpeed = Math.min(22, fallSpeed + 0.4); return false; }
        if (it.y > H) { lives--; if (lives <= 0) g.over = true; return false; }
        return true;
      });
    };
    g.draw = (F) => {
      for (let i = 0; i < lives; i++) F.sprite(['#.#', '###', '.#.'], W - 4 - i * 4, 0, 1);
      items.forEach((it) => F.sprite(FOOD, it.x, Math.round(it.y)));
      F.sprite(['#.....#', '#.....#', '.#####.'], Math.round(bx), BY);
    };
    return g;
  },
};

export const GAMES = [snake, pong, bricks, flap, jump, space, blocks, memory, racer, catchGame];
