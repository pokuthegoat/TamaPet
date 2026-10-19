// Pet status (evolution): Baby → Teen → Adult by TOTAL XP ever earned. Sits next to the levels (which it doesn't
// change); nothing changes visually. Shared by the game (game.js) and the leaderboard API (api/leaderboard.js).
export const xpToNext = (lv) => 40 + lv * 20; // XP needed to go from level lv to lv + 1
export const STAGES = [{ name: 'Baby', from: 0 }, { name: 'Teen', from: 100 }, { name: 'Adult', from: 300 }];
// Total XP ever earned = every finished level's XP + the XP into the current level.
export function totalXp(level, xp) {
  let t = Number(xp) || 0;
  for (let lv = 1; lv < (Number(level) || 1); lv++) t += xpToNext(lv);
  return t;
}
export const stageOf = (level, xp) => {
  const t = totalXp(level, xp);
  return STAGES.reduce((cur, s) => (t >= s.from ? s.name : cur), STAGES[0].name);
};
