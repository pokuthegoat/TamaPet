// Daily quests: 5 new ones every day (same 5 all day — picked from the date). Each gives XP + TamaPoints the
// moment it's done. Labels fit the 8-letter screen; `text` is the full description shown under the device.
import { GAMES } from './games.js';

// Short game names (4–5 letters) so "HI BRICK" / "CATCH 15" fit on one screen line.
const SHORT = { SNAKE: 'SNAKE', PONG: 'PONG', BRICKS: 'BRICK', FLAP: 'FLAP', JUMP: 'JUMP', SPACE: 'SPACE', BLOCKS: 'BLOCK', MEMORY: 'MEMO', RACER: 'RACER', CATCH: 'CATCH' };
// "Score N" targets: reachable in a decent round, not in a lucky first second.
const TARGET = { SNAKE: 8, PONG: 8, BRICKS: 10, FLAP: 5, JUMP: 10, SPACE: 10, BLOCKS: 2, MEMORY: 5, RACER: 15, CATCH: 15 };
const title = (name) => name[0] + name.slice(1).toLowerCase();

export const REWARD = {
  care: { xp: 10, tp: 5 },
  xp: { xp: 15, tp: 10 },
  hi: { xp: 20, tp: 15 },
  score: { xp: 20, tp: 15 },
  play: { xp: 15, tp: 10 },
};

export const today = () => {
  const n = new Date();
  return `${n.getFullYear()}-${n.getMonth() + 1}-${n.getDate()}`;
};

// Small seeded random generator, so everyone gets the same quests on the same day.
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

export function makeDay(day) {
  const r = seeded('tamapad' + day); // old name kept: changing it would reshuffle everyone's quests
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const names = GAMES.map((g) => g.name);
  const hiGame = pick(names);
  const scoreGame = pick(names.filter((n) => n !== hiGame));
  return {
    day,
    xpToday: 0,
    played: [],
    list: [
      { type: 'care', what: pick(['feed', 'bath']), progress: 0, target: 1, done: false },
      { type: 'xp', progress: 0, target: pick([40, 50, 60]), done: false },
      { type: 'hi', game: hiGame, progress: 0, target: 1, done: false },
      { type: 'score', game: scoreGame, progress: 0, target: TARGET[scoreGame], done: false },
      { type: 'play', progress: 0, target: 3, done: false },
    ],
  };
}

export function label(q) {
  switch (q.type) {
    case 'care': return q.what.toUpperCase();
    case 'xp': return `XP ${Math.min(q.progress, q.target)}/${q.target}`;
    case 'hi': return 'HI ' + SHORT[q.game];
    case 'score': return `${SHORT[q.game]} ${q.target}`;
    case 'play': return `PLAY ${Math.min(q.progress, q.target)}/${q.target}`;
    default: return '';
  }
}

export function text(q) {
  const r = REWARD[q.type];
  const n = Math.min(q.progress, q.target);
  let what = '';
  switch (q.type) {
    case 'care': what = q.what === 'feed' ? 'Feed your pet' : 'Give your pet a bath'; break;
    case 'xp': what = `Earn ${q.target} XP today (${n}/${q.target})`; break;
    case 'hi': what = `Beat your ${title(q.game)} high score`; break;
    case 'score': what = `Score ${q.target} in ${title(q.game)}`; break;
    case 'play': what = `Play ${q.target} different minigames (${n}/${q.target})`; break;
  }
  return `${what} — +${r.xp} XP, +${r.tp} TamaPoints${q.done ? ' · done ✓' : ''}`;
}
