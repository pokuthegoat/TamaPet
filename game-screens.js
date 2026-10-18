// TamaPet game — screen designs for the device's LCD (DESIGN PREVIEW, not the game logic yet).
// Controls are the device's 3 buttons: heart = next, circle = select, star = back.
import { SW } from './lcd.js';

// ---- sprites ('#' dark, 'o' mid, '.' empty) ----
export const ANIMALS = [
  { name: 'CAT', rows: [
    '................', '...##......##...', '..#oo#....#oo#..', '..#ooo####ooo#..', '.#oooooooooooo#.', '.#oo##oooo##oo#.',
    '.#oo##oooo##oo#.', '.#oooooooooooo#.', '.#oooo#oo#oooo#.', '.#ooooo##ooooo#.', '..#oooooooooo#..', '...##oooooo##...',
    '.....######.....', '.....#....#.....', '................', '................'] },
  { name: 'DOG', rows: [
    '................', '....########....', '...#oooooooo#...', '.###oooooooo###.', '#oo#oooooooo#oo#', '#oo#oo#oo#oo#oo#',
    '#oo#oo#oo#oo#oo#', '#oo#oooooooo#oo#', '.##oooo##oooo##.', '...#oooooooo#...', '....#oooooo#....', '.....######.....',
    '.....#....#.....', '................', '................', '................'] },
  { name: 'POLAR BEAR', rows: [
    '................', '..##........##..', '.#oo#......#oo#.', '.#o##########o#.', '..#..........#..', '.#............#.',
    '.#...#....#...#.', '.#...#....#...#.', '.#.....##.....#.', '.#....#oo#....#.', '..#..........#..', '...##......##...',
    '.....######.....', '.....#....#.....', '................', '................'] },
];

// Home menu icons: 5 wide × 7 tall.
export const ICONS = {
  feed: ['.#.#.', '#.#..', '.....', '#####', '#ooo#', '.#o#.', '..#..'],
  bath: ['..#..', '..#..', '.#o#.', '#ooo#', '#ooo#', '#ooo#', '.###.'],
  play: ['.....', '.###.', '#o#o#', '##o##', '#o#o#', '.###.', '.....'],
  quests: ['#####', '#ooo#', '#ooo#', '.#o#.', '..#..', '..#..', '.###.'],
  stats: ['....#', '....#', '..#.#', '..#.#', '#.#.#', '#.#.#', '#####'],
};
export const MENU = ['feed', 'bath', 'play']; // stats + quests live in the /play page's navbar
export const menuX = (i) => 3 + i * 11;
export const GAMES = ['SNAKE', 'PONG', 'BRICKS'];

export const BOWL = ['..#..#..', '...#..#.', '........', '########', '#oooooo#', '#oooooo#', '.#oooo#.', '..####..'];
export const BUBBLE = ['.#.', '#.#', '.#.'];

// ---- demo state shown on the screens (preview values) ----
export const demo = { level: 3, xp: 0.6 };

const bob = (t) => (Math.floor(t * 2) % 2);

function header(lcd) {
  lcd.text('LV' + demo.level, 1, 1);
  lcd.box(14, 1, 17, 5);
  lcd.rect(15, 2, Math.round(15 * demo.xp), 3, 1);
}

// Animal name under the pet; two-word names go on two lines (the screen is only 8 letters wide).
export function nameLines(lcd, name) {
  const w = name.split(' ');
  if (w.length === 1) lcd.textC(name, 28);
  else { lcd.textC(w[0], 25); lcd.textC(w.slice(1).join(' '), 30); }
}

// Every screen: draw(lcd, t, state). t = seconds since the screen opened.
export const SCREENS = {
  pick: {
    label: 'Pick your animal',
    draw(lcd, t, s) {
      lcd.textC('PICK', 1);
      const a = ANIMALS[s.animal];
      lcd.sprite(a.rows, 8, 9 + bob(t));
      if (Math.floor(t * 2) % 2 === 0) { lcd.text('<', 1, 15); lcd.text('>', 28, 15); }
      nameLines(lcd, a.name);
    },
  },
  home: {
    label: 'Home',
    draw(lcd, t, s) {
      header(lcd);
      lcd.sprite(ANIMALS[s.animal].rows, 8, 9 + bob(t));
      MENU.forEach((m, i) => lcd.sprite(ICONS[m], menuX(i), 27, { invert: i === s.sel }));
    },
  },
  feed: {
    label: 'Feed',
    draw(lcd, t, s) {
      header(lcd);
      lcd.sprite(ANIMALS[s.animal].rows, 2, 11 + bob(t * 2));
      const left = Math.max(0, 3 - Math.floor(t)); // bowl empties over 3 s
      lcd.sprite(BOWL.map((r, j) => (j >= 4 && j < 7 - left ? r.replace(/o/g, '.') : r)), 22, 18);
      if (t > 1) lcd.textC('+XP', 29);
    },
  },
  bath: {
    label: 'Bath',
    draw(lcd, t, s) {
      header(lcd);
      lcd.sprite(ANIMALS[s.animal].rows, 8, 11);
      for (let i = 0; i < 5; i++) {
        const x = 3 + ((i * 7) % 26), y = 26 - Math.floor((t * 6 + i * 5) % 18);
        lcd.sprite(BUBBLE, x, y);
      }
      if (t > 1) lcd.textC('+XP', 29);
    },
  },
  play: {
    label: 'Pick a minigame',
    draw(lcd, t, s) {
      lcd.textC('PLAY', 1);
      lcd.rect(0, 7, SW, 1);
      GAMES.forEach((g, i) => {
        lcd.text(g, 6, 11 + i * 8);
        if (i === s.game && Math.floor(t * 3) % 3 !== 2) lcd.text('>', 1, 11 + i * 8);
      });
    },
  },
  snake: {
    label: 'Minigame: Snake',
    draw(lcd, t) {
      lcd.text('12', 1, 1);
      lcd.text('SNAKE', 11, 1);
      lcd.box(0, 7, SW, 28);
      // demo: the snake runs round a loop inside the field
      const loop = [];
      for (let x = 4; x <= 26; x++) loop.push([x, 12]);
      for (let y = 13; y <= 29; y++) loop.push([26, y]);
      for (let x = 25; x >= 4; x--) loop.push([x, 29]);
      for (let y = 28; y >= 13; y--) loop.push([4, y]);
      const head = Math.floor(t * 10) % loop.length;
      for (let i = 0; i < 8; i++) { const [x, y] = loop[(head - i + loop.length) % loop.length]; lcd.px(x, y); lcd.px(x, y + 1, i ? 1 : 2); }
      lcd.box(15, 19, 3, 3);
    },
  },
  quests: {
    label: 'Daily quests',
    draw(lcd) {
      lcd.text('TP 40', 1, 0);
      ['FEED', 'XP 20/50', 'HI SNAKE', 'CATCH 15', 'PLAY 1/3'].forEach((q, i) => {
        if (i === 0) { lcd.rect(0, 5 + i * 6, SW, 7); lcd.text(q, 1, 6 + i * 6, 0); } else lcd.text(q, 1, 6 + i * 6);
      });
    },
  },
  stats: {
    label: 'Stats',
    draw(lcd, t, s) {
      lcd.sprite(ANIMALS[s.animal].rows, 8, 1);
      lcd.text('LV', 1, 18); lcd.text(String(demo.level), 28, 18);
      lcd.text('XP', 1, 24); lcd.box(11, 24, 20, 5); lcd.rect(12, 25, Math.round(18 * demo.xp), 3, 1);
      lcd.text('SAVED', 1, 30); lcd.text(String(demo.level), 28, 30);
    },
  },
  levelup: {
    label: 'Level up',
    draw(lcd, t, s) {
      if (Math.floor(t * 3) % 4 !== 3) { lcd.textC('LEVEL', 1); lcd.textC('UP!', 7); }
      const jump = [0, -2, -3, -2][Math.floor(t * 6) % 4];
      lcd.sprite(ANIMALS[s.animal].rows, 8, 14 + jump);
      lcd.textC('+1 SAVED', 30);
    },
  },
};

// Button handling for the preview: heart = next, circle = select, star = back.
export function press(s, btn) {
  const go = (screen) => { s.screen = screen; s.t0 = performance.now(); };
  const sc = s.screen;
  if (sc === 'pick') {
    if (btn === 'heart') s.animal = (s.animal + 1) % ANIMALS.length;
    if (btn === 'circle') go('home');
  } else if (sc === 'home') {
    if (btn === 'heart') s.sel = (s.sel + 1) % MENU.length;
    if (btn === 'circle') go(MENU[s.sel]);
  } else if (sc === 'play') {
    if (btn === 'heart') s.game = (s.game + 1) % GAMES.length;
    if (btn === 'circle') go('snake');
    if (btn === 'star') go('home');
  } else if (sc === 'snake') {
    if (btn === 'star') go('play');
  } else if (btn === 'star' || btn === 'circle') {
    go('home');
  }
}
