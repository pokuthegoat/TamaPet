# TamaPet (formerly TamaPad) — Project Notes

Running log of decisions and open items. Updated as things are shared/decided.

## Working rules
- "dnc" in a message = do nothing. No code, no revert, no changes.
- Short, simple messages. Speed is life.
- No code/changes without explicit direct instruction (mentioning "working on X today" is not permission).
- Visual/animation changes must be verified via screenshot/browser check before calling them done.
- While coding: self-review constantly, not just at the end.
- Whenever work seems done: review it and run checks before calling it done.
- Update this notes file after every important conversation/decision, not just when asked.
- "do not code" = discuss only. Fix bugs at the root, explain in short plain language — no workaround menus.
- Check 3D changes from more than one angle (front AND side) before calling them done.
- Desktop only — user doesn't care about mobile; don't propose mobile work.

## ▶ START HERE — state at end of session 2026-10-17
Run: `python D:\TamaPad\serve.py` → http://localhost:8080/ (no-cache dev server, 2026-10-18: a normal reload picks up changes. The old `python -m http.server` let Chrome run stale JS modules).

**Files:** `index.html`, `styles.css`, `script.js` (Lenis, GSAP text reveals, FAQ, orbs parallax, reload-to-top), `three-scene.js` (3D scene, scroll path, cursor follow, idle, chain), `device-style.js` (restyles the model at load: colours, logo, label, screen pet, wings removed, rebuilt buttons), `assets/tamagotchi.glb` (14 MB original model), `assets/gsap/*` (local GSAP plugins).

**What the site is now (desktop):**
- Plain royal-blue page (`#0B3986`) + short light-blue gradient at the very top + 9 soft drifting background orbs with light scroll parallax.
- 3D Tamagotchi (blue shell, cream T logo/buttons, pixel cat on screen, back label "TamaPad") on a fixed full-screen canvas. Layering: text < device < buttons/icons < navbar.
- It follows the whole page on the round serpentine path (Path v5): hero right → spin at The hook/Why → loops over the 3 hidden How-it-works image boxes → spin at Who → ends lower-left above the footer. Idle float + cursor tilt on top.
- Chain: clean code-built chrome ball chain hooked through a clean ring; zero-gravity behaviour (pushed opposite to movement, stays where it ends up); loads resting leaned right, no entrance flick.
- Two-lane layout so text sits beside the path (right lane where the device is on the left).
- Headings light up word by word on scroll; other text fades/rises in; hero title rises in after the loader. FAQ opens/closes smoothly (GSAP height).
- Who-it's-for: pixel icons (paw / coin / heart). Footer has the CC BY credit for the model. Reload always starts at the top.

**Tried and rejected (don't redo unless asked):** chain per-bead physics, pendulum sway, upright/drooped chain variants, entrance flick; path v1–v4; fast-scroll "progress along path" smoothing (reverted, fast-scroll corner-cutting is back); pixel illustrations (code-generated = bad; user's image pixelated looked good but clashed with the 3D device → removed); animated screen pet / ending CTA / interactive device ideas (user said no); in-code outline rounding (serrated → reverted).

**Open / possible next:**
1. Site still feels like "something is missing" (user can't say what); background boredom only partly solved (orbs + top gradient).
2. Fast-scroll corner-cutting through How it works (fix was reverted without reason — ask before retrying).
3. Rounder outline / wing ghost bumps → needs a 3D-editor pass on the .glb (Blender) or a better model.
4. Model is 14 MB — could be compressed (~2–4 MB) with no visible loss.
5. X/Twitter links point to x.com (account not made yet). Game vs charity content split (from 10-16) never done.

## ▶ NARRATIVE CHANGE (2026-10-18)
- Main story: **1 level in the game = 1 real animal saved in real life.** Literally, one to one.
- Tokenising a pet is only a SIDE feature. The site currently puts it front and centre, which is wrong. Copy and structure need to shift toward the level → saved-animal loop.
- COPY REWRITTEN (2026-10-18), text only, same sections/classes (3D path anchors untouched). Game first, hook as the hook, token pushed down: hero sub = game + hook; strip "1 level in the game = 1 real animal saved"; What is = "A pet that's yours to raise." body (user's exact text): "Pick an animal and raise it. Feed it, bathe it and play minigames to level up your pet."; banner "One level. One real life saved."; Why = "Built to save real animals." + tiles 1:1 / XP / Quests / Daily; How = "From adoption to saving a life.", step 03 "Level up, save a life" (ends with "Want more? Tokenise your pet on pump.fun — the fees go to a charity you pick."); Who sub = pet lovers, gamers…; token only in the Traders card + 2 FAQ items (tokenise, fees/charity/escrow), after "How do I level up?". Meta description updated. Verified in browser, no site errors.
- Funding (who pays per level): the user will explain it on the X/Twitter account. The site doesn't need to cover it, so don't raise it again.

## Core concept
- "Crypto tek" — a site built to get tokenised. Better the narrative, more the token trades.
- Site = marketing/narrative layer for a Tamagotchi-style pet game.

## Game concept (open to change)
- User picks an animal to raise.
- Level up via interactions: feeding, bathing, minigames → XP.
- In-game currency from quests (milestones with your animal).
- Currency buys clothes/items (details TBD).
- Possible later: spin the wheel, daily rewards.

## Tokenization hook
- Core hook: tokenize your pet — launch a coin per pet via pump.fun.
- One pet = one coin. Not one site-wide coin. Each owner tokenises their own pet.
- Trading fees → charity of the user's (launcher's) choice. Money sits in escrow.
- Marketing angle: "every level you progress with your pet, a real one is saved in real life."

## Build order
1. Landing / marketing page first.
2. Game later.

## Landing page layout (as given by user)
1. Navbar — copied from https://www.idlenet.app/ (see "Navbar reference" below).
2. Cinematic hero section.
3. "What is TamaPad?" — launchpad/game: adopt a pet, raise it, play/feed it, tokenise your animal, save it in real life.
4. "Raise a pet, save a life" statement section.
5. "Why is it built?" — all coin fees go to the biggest animal charity in the world; leveling up your pet = saving a real life.
6. "How it works" — 3 rows, alternating layout:
   - Text left / image right
   - Image left / text right
   - Text left / image right
7. "Who's it for" — built for people who want to save lives.
8. FAQ.
9. Footer.

### Navbar reference (idlenet.app, scraped values)
- Header: bg `rgb(239,239,237)`, 1px solid black bottom border, sticky, padding `14px 40px`, height ~69px.
- Font: "Geist Mono" (monospace) throughout nav.
- Layout: logo+wordmark (left) → nav links → "CA: 0x..." contract pill → dark CTA button (black ~78% opacity, white text) on far right.
- Nav link style: 13px, weight 400, grey `rgb(76,76,76)`.

## Visual style — SCRAPPED (2026-10-16)
- v1 copied Browserbase's visual design (colors, fonts, pixel-art illustrations) too literally. User called it bad: wrong tone (cold SaaS/crypto-terminal palette for a cute pet-charity game), no real pet depicted, lazy emoji icons, felt like "Browserbase with pet words pasted in."
- Per user instruction: scrapped every piece of design. Only layout (grid/flex structure, spacing, section order) and real text content remain.
- Current state: system font stack, black/white/grey only, plain bordered buttons, no colors, no custom fonts, no decorative effects. Every image/illustration/icon slot is now a plain dashed-border grey placeholder box.
- Visual design direction is now an open question — do not reintroduce colors, fonts, or illustration style without explicit direction from the user.

## Build status
- Files: `index.html`, `styles.css`, `script.js` in `D:\TamaPad`.
- Running locally at **http://localhost:8080/** via `python3 -m http.server 8080` (background process).
- Self-reviewed after strip-down: checked hero, split section, stat grid, how-it-works rows, FAQ accordion, footer — all render as plain layout with placeholder boxes, no leftover color/font/decoration.

## Hero — "make it cinematic" clarified + done (2026-10-16)
- First attempt (motion: letterbox bars, Ken Burns zoom, fade-up text) was reverted — user clarified "cinematic" meant LAYOUT, not animation/motion.
- Correct interpretation, now built: poster-style layout — text block anchored bottom-left (not centered), stronger dark gradient at the base for legibility, image given full room above. No letterbox bars (user explicitly said not to do those), no animation.
- Verified on desktop and mobile (390px) — legible, buttons wrap correctly.
- Lesson: "cinematic" from this user means composition/framing, not motion effects. Don't default to animation for this kind of request again.

## Hero — done (2026-10-16)
- Layout decision: full-bleed cinematic hero (image fills viewport, text overlaid with dark gradient for legibility), not the old stacked text-then-image.
- Real image in use: `D:\TamaPad\assets\hero.png` — cyanotype-style landscape (user-provided, not a pet image, chosen deliberately for the mood). Swapped once already (2026-10-16): mountain range → valley with winding river, same file path/same cyanotype style.
- Verified on desktop and mobile (390px) — text stays legible, buttons wrap correctly.

## FULL REVERT to v1 build (2026-10-16)
- User explicitly asked to revert the whole site all the way back to the very first build — the Browserbase-inspired design (orange/black/lavender palette, Space Grotesk/Inter/JetBrains Mono, pixel-dither mountain hero, highlight-marker headline, emoji icons, stat tiles, giant-letter orange footer).
- This undoes ALL later work: the "scrap every piece of design" strip-down, the real cyanotype hero.png image, and the bottom-left poster-layout hero. All of that is gone now — current state is byte-for-byte the original v1 index.html/styles.css.
- `assets/hero.png` file still exists on disk but is NOT referenced anywhere in the current HTML/CSS (v1 hero uses a CSS pixel-art mountain shape, not a real image).
- Note: this is a deliberate reversal of the user's own earlier rejection of this exact design ("this is bad... every single thing"). Don't assume it's a mistake — it was an explicit, unambiguous instruction. But don't be surprised if more changes follow.
- If asked to revert again, the next-oldest milestone is the "scrapped to layout+text only, placeholder boxes" version, then after that the "real hero image, full-bleed centered" version, then "poster-layout hero" (most recent before this revert).

## FULL REDESIGN — "copy everything from Pace" (2026-10-16)
User gave a big combined instruction and said START. Executed all of it:
- New hero image: `assets/hero.png` — bright snowy mountain panorama (file: snowlight-pines-main.png), replacing the dark cyanotype one.
- Image is now a FIXED background layer (`.site-bg`, position:fixed, z-index:-3) that stays visible behind the entire site at every scroll position — not just the hero. A fixed navy gradient tint (`.site-bg__tint`) sits over it for legibility (lighter near top/nav, darker through content).
- Typography, buttons, nav styling copied from https://www.paceearn.run/: single font "DM Sans" (Google Fonts) for everything, headline weight 500 with tight negative letter-spacing, 8px-radius buttons (not pills) — primary = blue `#1D4ED8` with a white circular arrow icon, ghost = translucent white. Nav is a floating frosted-glass pill (`rgba(255,255,255,0.06)` + `blur(10px)`), small square social icon button added (X/Twitter).
- Lenis smooth scroll added (CDN, vanilla JS, not React) — settings mirror `D:\gamestock\src\lib\smooth-scroll.ts`: duration 1.2s, custom expo-out easing, wheelMultiplier 1, syncTouch false, respects prefers-reduced-motion. Simplified to a plain continuous rAF loop (gamestock's on-demand frame system is React-specific machinery, not worth porting here). In-page anchor links now scroll via `lenis.scrollTo`.
- Grain overlay added: lightweight canvas-generated noise tile (in script.js) applied via a fixed, pointer-events:none div with `mix-blend-mode:overlay` and a stepped background-position animation for flicker. (Pace/gamestock's actual grain is a WebGL/Three.js shader — way too heavy for this static site, so this is a CSS/canvas equivalent with the same visual intent, not the literal same code.)
- Copy cleanup: removed all "0X / " prototype-style numbering from section eyebrows (was "01 / ADOPT", "02 / THE HOOK", "03 / THE LOOP" — now just "The hook", "How it works", etc.). The 01/02/03 labels on individual how-it-works steps were KEPT — those are legitimate step numbers, not prototype artifacts.
- Section spacing increased: `--section-pad` token bumped to 160px desktop / 96px mobile (was 60-90px).
- Content sections (what-is card, stat tiles, who-cards) now sit in subtle glass panels (`rgba` navy + blur) for legibility/structure against the busy photo background, echoing Pace's card treatment.
- Re-applied the mobile-menu-overlay fix (position:absolute, not in-flow) — this was lost when the file was fully rewritten and had to be redone.
- Verified: desktop scroll through every section, FAQ accordion, mobile (390px) hero + nav menu open/close, Lenis confirmed active (`lenis` class present on `<html>`), grain tile confirmed generated and applied.

## Background fix — image now genuinely extends over the whole site (2026-10-16)
- User clarified the complaint: background wasn't "sticky" / only showed at the top — they wanted the image to extend downward over the entire site, not just sit pinned in the hero viewport.
- I do NOT have an image-generation tool in this session — tried a local workaround first (PowerShell/System.Drawing mirror-tiling the bottom snow band downward to make a taller PNG). Result looked bad — an obvious repeating kaleidoscope/chevron pattern. Rejected it on sight, reverted `assets/hero.png` back to the original, did not ship it.
- Real fix (pure CSS, no doctored image): the original photo sits at the top of `body` at its natural aspect ratio (`background-size:100% auto`, not stretched/distorted), then fades into a solid colour sampled directly from the photo's own snow tone (`#CED6E1`, sampled via PowerShell `GetPixel` near the image's bottom edge) via a `vw`-unit gradient (so the fade point scales correctly with viewport width regardless of total page height). Background now lives on `body` directly (removed the old fixed `.site-bg`/`.site-bg__tint` divs) and scrolls normally with the page — it is NOT `position:fixed` anymore.
- A flat semi-transparent navy wash (`rgba(4,11,44,0.46)`) sits over the whole thing for text legibility, since the photo is very bright/white and plain white Pace-style text wouldn't read against it otherwise.
- Verified: scrolled the entire page on desktop (hero → fade zone → solid tone → footer, all consistent, no cutoff, no repeating pattern) and checked mobile (390px) — works at both.
- Lesson: don't attempt image generation/extension work-arounds without showing the result critically first — the mirror-tile attempt was visually bad and got caught by self-review before shipping, per the user's standing "review before calling it done" rule.

## Visual direction decisions (2026-10-16)
- Site currently "looks plain and boring" past the hero — flat grey wall of text, empty placeholder boxes everywhere. Agreed plan: fill placeholders is the top priority to fix this (bigger lever than animations or color).
- Style resolution for realistic-photo-hero vs. pixel-art-Tamagotchi-game mismatch: lean INTO the contrast rather than make everything consistent. Realistic photography = anything tied to "the real world / real animals saved" (hero, charity section). Pixel art = anything tied to "the game" (how-it-works icons, pet stat card, who's-it-for icons). This is the agreed direction, not yet built.
- "What is TamaPad" pet-stat-card placeholder will eventually be replaced with a real demo VIDEO (not a static image) — user will record it once the actual game/app is built. Don't design a static image for that slot; leave it as a video-shaped placeholder when touched next.

## Full palette swap — royal blue + cream, footer illustration reused (2026-10-16)
- User provided a screenshot of a different site's footer (`sequel`, a blue duotone desert illustration with a cowboy on horseback) and asked to (1) reuse that image for our footer, (2) change the whole site's color to that blue, (3) make the hero the same blue + texture (new hero image coming later).
- Sampled exact colors from the reference: royal blue `#0B3986` (new `--navy`), cream `#EFE3D3` (new `--cream`). These replaced the old dark navy `#040B2C` / blue accent `#1D4ED8` / light snow `#CED6E1` tokens site-wide.
- Buttons flipped: primary is now cream bg + navy text (was blue bg + white text). Nav logo mark is cream too.
- First footer attempt was wrong and caught by self-review: I used the ENTIRE reference screenshot as the footer background, which included the OTHER site's own logo ("sequel"), nav fragment, and link columns — overlapping and unreadable against our own footer content. Did not ship it.
- Fix: cropped the reference down to just the illustration band (mountains + cowboy, no competing text) via PowerShell/System.Drawing, saved as `assets/footer-art.jpg` (1671x381, cropped from y=560 down). Footer background is now this cropped art anchored to the bottom (`background-position:bottom`), with our own TamaPad link columns sitting in the plain blue area above it — same layering pattern as the original reference site, just without stealing their actual branding.
- Deleted the uncropped `assets/footer.jpg` (unused once the crop was made).
- Hero currently has NO photo (removed the old snow image per user's "we need different images, I don't like the colour" from earlier) — it now just shows the plain new royal blue + the site-wide grain texture, satisfying "hero = same blue and same texture" until a new hero image is provided.
- Verified desktop (hero, FAQ, footer) and mobile (390px, footer illustration + 2-col link layout) — both clean, no text overlap, no leftover old-palette colors.

## Grain "visible sky particles" fix — REVERTED (2026-10-16)
- Built a fix for this (sparse light speckles, screen blend, pixelated edges, tuned density/opacity) — see conversation for full detail if redone later. User said "revert" right after, before giving feedback on it.
- Reverted both script.js (`initGrain`) and styles.css (`.grain`) back to the original: full-coverage black/white random noise, 160px tile, `overlay` blend, 0.05 opacity. This is the same grain that was "basically invisible" against the flat blue — so the original complaint (sky particles not visible) is unresolved again. Needs new direction before touching it again.

## Copy pass (2026-10-16)
Several direct text edits were made to tighten/finalize copy across sections. Current exact strings in index.html:
- Hero subtext: "TamaPad is a launchpad and a game in one. Adopt a pet, raise it, feed it, play with it, and tokenise it — every level you progress with your pet, a real one gets saved."
- Trust strip: "everytime you level up with your pet, a real one is saved"
- What-is-TamaPad body: "Adopt an animal, raise it — feed it, bathe it, play with it, and complete quests to earn GamePoints. Buy clothes and items for your pet. Tokenise your pet whenever you want, and fund a charity of your choice with the fees"
- Why-it's-built body: "Every pet on TamaPad can be tokenised. All trading fees go straight to an animal charity, chosen by YOU."
- How-it-works step 2 (Raise it): "Feed it, bathe it, play minigames, and complete quests. earn XP and GamaPoints to spend on items."
- How-it-works step 3 (Tokenise it): "Launch your pet, pick a charity, and every trade helps save a real animal."
- NOTE: in-game currency is called "GamePoints" in one spot and "GamaPoints" in another (typo inconsistency) — flagged to user, not yet resolved, don't silently fix without asking.
- Both lowercase sentence starts ("earn XP...") in a couple of these are intentional as typed by the user — not yet corrected to capitalized, worth asking about before changing.

## Content structure — GAME vs CHARITY split discussed, NOT YET BUILT
- User asked (via content-balance question) where the site sits 1-10 on "game-focused" vs "fees/shelter-focused" — assessed it as ~7 (charity-heavy). User said they don't want that and want the site split into two distinct sections: one fully about the game, one fully about fees/charity.
- This was discussed but never implemented — got interrupted by other requests (image/color changes). Still an open task for next session.

## END OF SESSION (2026-10-16) — pick up here tomorrow
Open threads, in priority-ish order:
1. **Game/charity section split** — discussed, not built (see above).
2. **New hero image** — user said they'd provide one; hero currently has NO image, just plain royal blue (`#0B3986`) + grain texture.
3. **Grain visibility** — user caught that the grain (meant to mimic light "particle" specks in the reference sky image) was invisible on the flat blue. A fix was built (sparse light speckles, screen blend) then explicitly reverted by the user before giving feedback on it — so it's back to the original barely-visible noise. Needs a fresh attempt once hero image direction is settled, or new specific feedback.
4. **"GamePoints" vs "GamaPoints" typo** — unresolved, flagged, awaiting a decision.
5. **Site still feels "plain and boring" in places** — agreed direction was to fill placeholder images/icons first (biggest lever), not yet executed. Also agreed: realistic photography = "real world" content, pixel art = "game" content, when that work happens.
6. Remaining placeholders unchanged (see below) — pet-stat-card will become a VIDEO later, not an image.

## GSAP added (2026-10-17)
- All 25 minified plugins (from user's `D:\Downloads\gsap-public.zip\gsap-public\minified`, .min.js only, no .map files) copied into `assets/gsap/`.
- Only `gsap.min.js`, `ScrollTrigger.min.js`, `SplitText.min.js` are actually loaded (script tags in index.html after Lenis, before script.js). Add a script tag for any other plugin only when it's used.
- ScrollSmoother deliberately NOT included — Lenis already handles smooth scroll; ScrollTrigger works alongside Lenis.
- No animations written yet. Plugins not yet registered (`gsap.registerPlugin`) — do that when first animation is added.

## New direction — scroll-driven 3D (2026-10-17)
- User doesn't want a "generic site with images". Wants something interesting and scroll-driven, with a Three.js 3D object.
- Agreed idea: a 3D Tamagotchi egg device, pinned on screen while you scroll, acting out the story: floats/turns (hero) → egg hatches on its screen (adopt) → pet grows, stat bars fill (raise) → device flips into a spinning coin (tokenise) → coin breaks into particles toward a "real animal saved" counter (why it's built).
- Reference: https://drone.riotters.com/ — one pinned 3D object (drone) that rotates/moves as text sections scroll past, plus scroll-driven word-by-word text highlighting (grey → dark). Same pattern we want.
- Their drone is a photoreal pro 3D model. A code-built device would look like a stylized glossy toy; photoreal needs a .glb model (buy/commission).
- Plan: build the hero device + scroll rotation first, get approval, then the rest.
- User supplied a model: `D:\Downloads\tamagotchi_pet_sailor_moon.glb` — told NOT to implement yet (2026-10-17).
  - Sketchfab, by Aldemona, CC-BY-4.0 → visible credit required on the site.
  - 4,250 triangles (very light), 36 separate meshes (shell parts, 3 buttons, metal thread, ~27 spheres), 1 PBR material, no animations.
  - 14.35MB, almost all from 3x 2048px PNG textures (color, metal/roughness, normal) → compress before shipping.
  - No obvious separate "screen" mesh; screen likely baked into texture — scroll-driven screen content would need an overlay plane.
  - Motion plan (agreed): 3 stacked layers like drone.riotters.com — (1) idle: always-on gentle float/sway, (2) cursor follow: small tilt toward mouse with soft lag, off on touch devices, (3) scroll path: smooth glide between per-section poses (ScrollTrigger scrub + Lenis). Scroll sets the pose; idle + cursor add on top.
  - Quality: user doesn't want quality reduced. Load the original first; later compare vs. same-resolution better-compressed textures side by side and let user decide.
  - Chain: option 3 chosen — beads dangle/swing with simple physics; hide the solid metal-thread mesh and draw a thin flexible wire between beads. Build LAST (after device motion works). If it looks bad → remove the chain entirely.
  - Project is personal / skill-building only — user said don't worry about copyright. User will handle the Aldemona credit themselves. Don't raise IP/licensing again.

## Footer image removed (2026-10-17)
- User asked to remove only the IMAGE behind the footer. (I first misread it and deleted the whole footer — restored it.)
- Footer now: same link columns + legal line on plain navy, `padding:70px 32px`. The desert/cowboy background and the big bottom padding that made room for it are gone.
- `assets/footer-art.jpg` left on disk, unreferenced.
- Lesson: "remove the footer" with an image in it may mean just the image — ask if ambiguous.

## 3D step 1 done — Tamagotchi in hero + idle (2026-10-17)
- Model copied to `assets/tamagotchi.glb` (original, full quality, 14MB). Textures get max anisotropy for sharpness at angles.
- Three.js r0.170.0 via importmap (jsdelivr CDN) + GLTFLoader + RoomEnvironment (reflections). New file `three-scene.js` (ES module, loaded after script.js).
- Canvas `#heroCanvas` is absolute inside `.hero` (behind text, pointer-events none) — it scrolls away with the hero for now. Will need to become a fixed full-page canvas when the scroll-path step is built.
- Model faces -Z, so it's rotated 180°. Normalized to 1.9 world-units tall (incl. chain).
- Lighting: neutral tone mapping, white key light top-right, cream rim light from behind-left.
- Structure: `anchor` group (layout position — scroll step will drive this) → `idle` group (float/sway, always on, off for prefers-reduced-motion) → model. Cursor-follow will be another layer.
- Desktop: model on the right of the hero. Mobile (<0.9 aspect): mobile hero gets `padding-top:min(46vh,420px)` to reserve space; model is fitted into that band above the text.
- Loader: full-screen navy overlay with cream % counter, fades out when the model is loaded.
- Render loop pauses when hero is off-screen.
- Confirmed: the screen pixel art (Sailor Moon) is part of the texture — not a separate mesh.
- Verified desktop + 390px mobile, no console errors.
- User reaction: "holy shit this looks so good" — keep this look (lighting, placement, idle).

## 3D step 2 done — cursor follow (2026-10-17)
- New `follow` group between `anchor` and `idle`. Device turns/tilts toward the cursor and drifts slightly toward it, eased so it trails (frame-rate independent smoothing).
- Tuning lives in `FOLLOW` in three-scene.js: yaw 0.28 rad (~16°), pitch 0.16 rad (~9°), shift 0.06, ease 3.2 (higher = snappier). Returns to center when the mouse leaves the window.
- Off on touch devices (only `hover:hover` + `pointer:fine`) and for prefers-reduced-motion.
- Verified: cursor top-left → faces up-left; bottom-right → faces down-right. No console errors.
- User: "looks good".

## 3D step 3 done — scroll path, device follows the whole site (2026-10-17)
- User wants it like the drone: the device stays with you through the ENTIRE page (never leaves). Layout will be redesigned around it LATER — for now overlap with text is accepted.
- Canvas moved out of the hero: now `#stage`, `position:fixed` full-viewport, z-index 0, BEHIND all content (`main, .footer` are z-index 1). Device shows through glass panels (blurred by their backdrop-filter).
- Footer background made transparent (body is already navy) — its solid navy was slicing the device with a hard edge.
- Path = `PATH` array in three-scene.js, one stop per section: hero (right) → #what-is (right, turned toward text) → .banner (centre, big 1.3x) → #why (right, spun to show the BACK) → 3 how-rows (spins back to front, hops right/left/right opposite the text) → .panel--center who-it's-for (centre top, small) → #faq (left). Each stop's x/y = fraction of visible width/height, s = scale, rx/ry/rz rotation.
- Each stop is reached when its section is centred in the viewport; device rests for `HOLD` (12% of viewport height) then glides (power2.inOut via gsap.parseEase) to the next. Positions re-measured automatically on resize / any page height change (ResizeObserver on body), so layout redesign only needs the numbers retuned.
- Extra feel: `PATH_EASE` 6 = how tightly it trails the scroll; `BANK` = leans into sideways moves like the drone.
- Not using ScrollTrigger for this (simple per-frame interpolation off window.scrollY, which Lenis smooths). Lenis/ScrollTrigger sync still not wired — do it when ScrollTrigger is first actually used.
- Mobile: x positions squeezed (x0.4) and scaled to fit width; hero stop still uses the band above the hero text.
- Verified desktop full scroll + 390px mobile; no console errors.
- Next: chain physics (option 3), then layout redesign around the path.

## Path v2 — calm (2026-10-17)
- User liked the execution but called path v1 "random and crazy, too busy" (9 stops, full spins, back view, side hops, centre).
- User explicitly does NOT want the device going to the centre or growing big. Don't propose that again.
- New path (5 stops, all on the RIGHT side, no spins, gentle turns only):
  hero (x .2, s 1) → #why (x .24, s .85, turned ~20° toward the text) → held through How it works (stop on the last how-row with the same pose) → who-it's-for (x .22, s .8, turned gently the other way) → held through FAQ/footer.
- Softer feel: PATH_EASE 6→4 (floatier trailing), BANK 0.12→0.06 (less lean).
- Verified full desktop scroll, no errors.
- User reaction to v2: "why is it only on the right side, there's not even a path now". I overcorrected — "too busy" meant HOW it moved (random spins/hops), not that it moved. Lesson: when the user criticises something, fix the specific problem, don't swing to the opposite extreme.

## Path v3 — user's own S-curve sketch (2026-10-17)
- User drew the route: `D:\Downloads\PATH.png` (red line on a full-page screenshot). A winding S-curve: What-is RIGHT → banner FAR LEFT (widest swing) → Why RIGHT (peak at stat tiles) → How heading/row 01 LEFT → row 02 right (smaller swing) → row 03 left → Who-it's-for straight down on the LEFT → FAQ drifting toward the middle → ends just above the footer, slightly left of centre.
- User said: it's a rough guide, "add some spins and sizes, be creative".
- Built: 10 stops following the sketch. x values read off the drawing (px/436 − 0.5); far-left kept at −0.32 so it stays fully on screen.
- Two full 360° spins only, on the two long crossings (into the banner, into who-it's-for). Sizes vary gently (0.78–1.05). Elsewhere it turns slightly toward the middle of the page.
- HOLD = 0 → one continuous flowing line (it naturally slows at each turn because of the inOut easing). BANK back up to 0.1.
- Stops past the end of the scroll (FAQ, footer) are now spread evenly over the remaining scroll so the footer pose is actually reached.
- Verified full desktop scroll against the sketch, no errors.

## Path v4 — user's precise sketch "BETTER PATH" (2026-10-17)
- v3 "not really what I was looking for". A follow-up idea ("go to every image placeholder") was retracted by the user — ignore it.
- I made a clean full-page screenshot for drawing on: `D:\Downloads\tamapad-full-page.png` (1440x6151, device/loader/grain hidden, nav not sticky). Script: `$CLAUDE_JOB_DIR/tmp/fullshot.mjs` (Node + headless Chrome over DevTools protocol, no deps) — job temp, may be gone; easy to recreate.
- User drew `D:\Downloads\BETTER PATH.png`: red = path (~90% accurate, smooth it, don't copy 1:1), GREEN tags = spin here, PURPLE tags = go over that image placeholder.
- Route: hero top-right → long diagonal right-to-left through What-is (passes the stat-card box, NO stop) → left at the banner → stays left through Why with a SPIN (green) → zig-zag over the 3 how-it-works image boxes: row01 right, row02 left, row03 right (purple) → long swoop back left → stays left at Who-it's-for cards with a SPIN (green) → curves toward centre through FAQ → ends at the last FAQ question.
- User wants the device IN FRONT of everything: `.stage` z-index 150 (above content + nav; loader 998 and grain 999 still above it). pointer-events none so clicks pass through. Removed the old `main, .footer` z-index rule.
- Implementation (three-scene.js): `PATH` points anchored to elements (`f` = which part of the element is at mid-screen). `box:true` points fly onto the actual placeholder element (centre x from its real position, scaled so the device is 1.25x the box height) and linger (BOX_HOLD = 8% of screen height, two knots with the same pose). `spin` = full turns completed by that point. Device turns slightly toward the page centre when off to a side (FACE_IN).
- Smoothing: ONE monotone cubic curve (Fritsch–Carlson) through all points per channel (x, y, scale, rotation) — continuous flow, no stopping at every point (the old per-segment easing stopped at each point, part of why v3 felt off), and it never overshoots off-screen.
- Verified: lands centred on each how-it-works box (in front), spins at Why and Who, ends at the last FAQ item; also on 390px mobile. No errors.

## Path v5 — round serpentine (2026-10-17) — CURRENT
- I rendered the real v4 path onto a full-page screenshot so the user could see it: `D:\Downloads\tamapad-current-path.png` (regenerate with `$CLAUDE_JOB_DIR/tmp/pathshot.mjs <url> <out.png> 1440 900` — it reads PATH + curve code straight out of three-scene.js; job temp, may be gone). Red = path, green = spinning, purple = lands on box, dashed = device size.
- User: v4 "too blocky — curves then goes straight down". Cause: paired points with the same x (for spins), the box lingers, and in-between points. User drew `D:\Downloads\roound.png`: one serpentine with big round U-bends.
- Rebuilt: points ONLY at the bends — hero (x .2) → #why bend LEFT (x −.3, SPIN) → 3 how-it-works image boxes (right/left/right, exact box centre, sized to box) → who-it's-for cards bend LEFT (x −.29, SPIN) → ends at the footer near centre. No more lingering; it's slowest at each bend anyway, which reads as landing on the boxes.
- Bends placed exactly on the box centres, not the slightly wider swing in the sketch (told the user; they can ask for the wider swing).
- Curve between bends: power in-out ease (`ROUND` = 2.6) → wide round U-bends + quicker crossing. Tried a half-cosine (bends too pointy in how-it-works) and a cosine/circular blend (made a visible kink mid-crossing) — both rejected after checking the rendered image.
- Spins: separate `turns` curve, one full turn spread over ±SPIN_SPAN (40% of screen height) around each spin bend.
- Verified with the rendered path image + live browser check, no errors.
- User: "looks good", asked for a bit more round/smooth. Fix: roundness is now picked PER STRETCH (`stretchPowers`, `ROUND = {min 2, max 2.7, slope .35}`): power = 2.9 − 0.35 × (scroll length ÷ sideways swing in px), clamped 2–2.7. Long sweeps get ~2 (gentle flowing curve, no near-vertical runs at the Why/Who bends); tight how-it-works loops get ~2.7 (round U-bends). Re-rendered + live check OK.
- First spin start adjusted by user a few times (banner title → "A launchpad and a game" → final): now STARTS when the device reaches the "THE HOOK" eyebrow (`spin: '.banner .eyebrow'` on the #why bend = start when the device reaches just above that element's top), same length as before (2 × SPIN_SPAN), ends around the "Why it's built" heading. Second spin (who-it's-for) unchanged, still centred on its bend.

## How-it-works loops: true round arcs (2026-10-17)
- User wanted the path over the 01/02/03 steps "a lotttt more" round. A scroll-driven wave can't get rounder there (boxes are close vertically, wide swing).
- New: `arc: true` on PATH points (rows 02 and 03) → the stretch INTO that point is a round "S" made of two quarter-ellipses in PAGE space (straight down onto box → sideways at midpoint → straight down into next box). The device travels along it by arc length with an ease-in-out, so its on-screen height drifts a little during the crossing, and it slows onto each box and moves with the page there (reads as landing). Function `arcStretch` in three-scene.js. Entry (Why → row 01) and exit (row 03 → Who) are still the normal wave.
- Path image tool changed: three-scene.js now exposes the live path on `window.__tamaPath` ONLY when the URL has `?pathdebug` (PATH_DEBUG). `pathshot.mjs` opens `http://localhost:8080/?pathdebug` and just draws `__tamaPath.curves` — no more duplicated path math in the script.
- Verified: rendered image (round S-loops through the 3 boxes) + live check, no errors.

## Image placeholders hidden (2026-10-17)
- User asked to hide the placeholder images. `.placeholder--card` (pet stat card) and `.placeholder--row` (3 how-it-works boxes) now `visibility:hidden` — invisible but still take up space, because the 3D path lands on the how-it-works boxes (display:none would collapse them and break the path). The 3 small `[ICON]` placeholders in who-it's-for are still visible (not asked).
- Note: python http.server doesn't send cache headers, so Chrome may show stale CSS/JS — hard refresh (Ctrl+Shift+R) after changes.

## Chain physics (option 3) built (2026-10-17)
- Model's chain = 27 bead meshes (`Sphere_01..28`, no 21) forming a closed LOOP that starts and ends at the ring on top (`Circle_02`), plus a rigid wire (`Metal thread_01`) and a small clasp (`Element_01`). The loop is modelled sticking up/back, NOT hanging — so real gravity would flop it over the screen.
- Built as springy secondary motion (`createChain` + `CHAIN` settings in three-scene.js): each bead springs back to its modelled spot with inertia (verlet), slight downward sag, link lengths (ring → beads → ring) kept by constraint passes, and each bead capped to ~2 bead-gaps from its resting spot. Rigid wire hidden; a thin metal TubeGeometry wire is rebuilt through the beads every frame. Clasp rides between its two nearest beads. Off (static) for prefers-reduced-motion.
- First tuning (stiffness 70, no cap) whipped the loop into long straight strands across the screen on spins → tightened to stiffness 220, damping 0.78, maxStray 0.008.
- Verified live: keeps its loop shape, trails/bends during moves and spins, settles after. No errors.
- User verdict: "really bugged, glitching, looks bad" → REMOVED. All chain physics code deleted; the chain is back to the model's original stiff chain + modelled wire, moving rigidly with the device. Verified live, no errors.
- Don't propose chain physics again unless the user brings it up.
- User then realised the chain looked broken even BEFORE the physics. High-res render confirmed: the model's chain is low-poly (faceted beads), beads clump near the ring/clasp, texture-seam "cracks" across beads, crumpled clasp. Rest of the device is fine.

## Chain rebuilt in code (2026-10-17)
- `rebuildChain(model)` + `BALL_CHAIN` settings in three-scene.js: hides the model's beads, wire and clasp; fits a smoothed closed loop (2 neighbour-averaging passes, centripetal Catmull-Rom) through the original bead centres; places smooth chrome spheres evenly along it (InstancedMesh, radius 0.00145, spacing 0.0037 model units); thin steel TubeGeometry wire along the loop; a chrome cylinder clasp where the original clasp was, with the beads it covers removed. The model's own ring (`Circle_02`) is kept. Built in model space, so it's stiff and moves rigidly with the device. Runs before the model is re-centred, so sizing/positions are unchanged.
- Before/after close-ups: `D:\Downloads\tamapad-chain-closeup-old.png` / `-new.png` (3x render via `$CLAUDE_JOB_DIR/tmp/chainshot.mjs <url> <out> "x,y,w,h"`).
- Verified live, no errors.

## Keychain sway (2026-10-17)
- User asked for the keychain to have physics / not be stiff (they brought it up, after the clean rebuild).
- Done as ONE rigid pendulum, not per-bead physics: `rebuildChain` now puts all chain parts in a `swing` group pivoting at the ring (`Circle_02` centre); `createSway` + `SWAY` settings in three-scene.js. Damped angular spring driven by the device's acceleration (loop swings opposite to movement, lever arm = ring → loop centre of mass) and angular acceleration (lags behind turns/spins). Accelerations lightly smoothed (frame jitter). Off for prefers-reduced-motion.
- Tuning: stiffness 60, damping 3.2, push 1, turn 1.6. Big swings ease into a SOFT limit (`maxAngle` 0.5 rad ≈ 29°, via tanh) instead of a hard stop; raw angle hard-capped at 3× that.
- First tuning (push .25 / turn .45) gave ~1° from cursor moves = looked stiff; now cursor sweeps give ~6°, fast scroll/spins swing up to ~29°, and it settles back to rest. Measured via `window.__tamaSway` (only with `?pathdebug`). No errors / NaN.

## Keychain v3 — upright, bends with movement (2026-10-17) — superseded by v4
- User on the pendulum sway: "pretty bad — always holds the same shape; when the object moves right the chain still points right". Diagnosis I gave: its home shape was glued to the device (sculpted sideways loop rotating with it), and it reacted only to ACCELERATION (springs back while still moving) instead of trailing behind MOVEMENT; also rigid.
- User chose: chain stands UPRIGHT and bends/turns depending on the Tamagotchi's movement and speed while scrolling.
- Built (`createChain` + `BALL_CHAIN` + `CHAIN_BEND` in three-scene.js; old rebuildChain/createSway/SWAY removed):
  - Original beads/wire/clasp hidden; model's ring (`Circle_02`) kept. New chain lives in the SCENE (not under the model): positioned at the ring each frame, scaled with the device, but oriented to SCREEN-up — device tilts/spins underneath it.
  - Rest shape: narrow upright loop from the ring (height 0.032, width 0.013 model units, slight depth tilt), chrome beads evenly spaced by arc length, thin steel wire, cylinder clasp at 62% around the loop (beads under it removed).
  - Bend: ONE constant-curvature bend (straight at the ring, most bent at the top; length-preserving), direction = opposite the ring's sideways+depth velocity, amount = gain 0.2 × speed (chain-heights/s), max 1.2 rad; follows through a damped spring (stiffness 80, damping 8) → slight overshoot + wobble back to upright. Speeds > 60 chain-heights/s ignored (teleports/resizes).
  - Twist: follows how fast the device turns (0.06 × yaw rate, max 0.8 rad), so spins twist it and it untwists after (not accumulated).
  - No per-bead simulation → can't stretch/jitter. Off for prefers-reduced-motion. Debug: `window.__tamaChain` (bend vector) with `?pathdebug`.
- Verified: 3x close-up of the upright loop; live scroll — bends up to ~1.4 rad on fast moves, settles back near upright; no errors/NaN.
- User then asked: not upright at rest — "a bit drooped down". Added a resting droop: `CHAIN_BEND.droop` 1.5 rad toward `droopDir` [1, −0.3] (screen-right, slightly back), movement bend adds on top, total capped at `maxTotal` 2.3 rad (~130°) so it can't curl into the device. First try (0.95 rad) only read as a ~25° lean — a constant-curvature bend leans the whole loop about half its tip angle — so it was raised to 1.5. Now the loop's top flops over to the right at rest; bends further while moving; settles back into the droop. Verified (3x render + live, no errors).

## Chain hooked through a clean ring (2026-10-17)
- User spotted the chain "doesn't actually fit through the loop". 8x render confirmed: chain base was attached to the ring's CENTRE point, so both strands met in a V inside the ring's solid band; chain was screen-oriented while the ring turns with the device; the model's ring (`Circle_02`) is also low-poly/flat with crack texture.
- Fix (in `createChain`): measure the model ring at runtime (centre, facing via cross product of spread vertices, mean in-plane radius; ring "up" = in-plane direction closest to model up), hide it, add a clean chrome `TorusGeometry` ring in exactly that spot (`BALL_CHAIN.ringWire` 0.00055 tube). Chain base ("hook") = inside the ring's hole just under its top wire; the bottom of the loop lies in the ring's frame (loop's sideways axis = ring normal → strands leave through the front and back of the hole). Over the lowest `CHAIN_BEND.ringBlend` (35%) of the chain the shape blends from ring-frame to the screen-based droop/bend. The chain's heading now follows the ring's heading (with lag, `CHAIN_BEND.follow` 10) instead of the old spin-rate twist — so it stays hooked when the device spins.
- Verified: 8x close-up (chain wire runs under the ring's top wire; ring in front of one bead, behind the other), wide 3x render, live mid-spin frames, no errors. Close-ups: `D:\Downloads\tamapad-chain-ring-zoom.png` (before) / `tamapad-chain-ring-zoom-fixed.png` (after).

## Keychain v4 — zero gravity (2026-10-17) — CURRENT
- User: hooked version "still looks a bit weird"; their idea: like in outer space — push the chain left and it STAYS there, no gravity to droop it / pull it back. Fits the weightless floating Tamagotchi.
- User chose: start bent to the right.
- Built (in `createChain`, settings `CHAIN_BEND`): no restoring spring / droop target any more. Starts at `start` 1.5 rad toward `startDir` [1, −0.3] (right, slightly back). Each frame the bend's velocity eases (`momentum` 5) toward −`push`(0.3) × the ring's sideways/depth speed (chain-heights/s) — so movement pushes it the opposite way, and when the device stops the push fades (short drift) and the bend just stays. Soft boundary `limit` 2 rad (~115°): beyond it the outward speed is removed and `wall` 40 pushes back (gentle bounce); hard cap at 1.15 × limit for the shape. Still hooked through the ring, heading follows the ring (`follow`), bottom 35% blends to the ring frame.
- Verified live: starts (1.43, −0.43); pushed by scrolling; after stopping it held its pose (1.970 → 1.962 over 3 s); max bend 2.08 (soft limit working); different pose after later moves; no errors/NaN.
- BUG (user: "inherently droops to the right"): the bottom 35% of the chain followed the ring's own frame, and the ring is tilted ~34° → a permanent built-in lean to the right regardless of the physics. Fix: hinge frame — the chain hooks over the ring's top wire ("bar", direction ringT) and may swing freely AROUND it: z = bar direction, y = screen-up with the bar component removed, x = through the hole; lowest bead sits right under the bar along that y. Verified by forcing bend = 0 via `window.__tamaChain.set(0,0)`: chain stands perfectly vertical, still hooked, also mid-spin.
- Remaining by design: starts bent right (user's choice), and the path's first big move is LEFTWARD (hero → Why), which pushes it further right into the soft limit — so in the first half it will tend to sit on the right. Offered: start upright instead.
- User: right bend ~6/10 max, left only ~2/10. User clarified "start drooping right" meant only the SPAWN moment ("act like it just moved right"), not a home side. Changed: loads upright, then one entrance flick (`intro` 0.6 rad toward `introDir`, `introDelay` 0.7 s after load, flick speed = intro × momentum so it travels exactly `intro`).
- Measured after that change: flick works (upright → settles at 0.51). BUT a full scroll still only ranged bend.x 0.51 … 1.76 — never left of the start. Root cause (inherent to this model): with push-by-velocity and no restoring force, bend ≈ start − push × (device's horizontal displacement), i.e. the chain angle is tied to WHERE the device is on screen. The path starts on the right (hero x +0.2) and its first move is left, so the whole swing sits on the right. Not yet fixed — asked the user how to resolve (options: very slow re-centring when idle, or offset the start so the swing is centred).
- User (frustrated): no shortcuts, fix it properly so left works like right. Also rejected "more sensitive to the left" (I advised against: path-specific patch). FIX: movement no longer ADDS to the current angle. While moving, the bend approaches the TRAILING pose of the current movement (−direction × `trail` 1.2 rad), by a fraction 1 − exp(−distance / `reach` 1.5 chain-heights) per frame — same rule both directions, independent of where the chain currently is; fed through the `momentum` smoothing; no movement → no change → it stays put. Measured full scroll: bend.x −1.31 … +1.16 (balanced); hold after stop −0.84 → −0.72 over 3 s (residual path/Lenis trailing). No errors.
- Lesson: when the user reports a bug, fix the root cause directly — don't offer workaround options that change the agreed behaviour; keep explanations short and plain.

## Device restyle (2026-10-17)
- User chose: BLUE shell with CREAM details; replace the Sailor Moon emblem with a TamaPad logo (remove heart, ribbons, wings, Bandai text); screen = "pet illustration" (I drew a static pixel pet; user can swap their own art later).
- New file `device-style.js` (`restyleDevice(model, anisotropy)`, called in the GLTF load callback before sizing). The whole model uses ONE 2048 texture atlas, so it's edited in a canvas at load:
  - pink pixels → shell blue `[46,98,209]` (a bit brighter than the page navy so the device stands out), keeping texture detail via a luminance ratio; low-saturation whites (screen bezel etc.) → cream.
  - emblem + ribbons, wing marks and the embossed "©BANDAI 1997 / MADE IN CHINA" text covered with soft-edged shell-colour fills; also flattened in the NORMAL map (the Bandai text is embossed there).
  - TamaPad logo (cream rounded square + navy "T") where the heart was; back sticker → cream label "TamaPad" (drawn vertically mirrored to read correctly on the model).
  - screen: LCD background + 16×16 pixel pet (`PET` grid) + two "+" sparkles. In the atlas the screen is rotated: screen-up = atlas-left.
  - buttons (heart/circle/star meshes) get a plain cream plastic material.
  - wings: NOT in the texture islands I first assumed (that attempt only nicked triangles). They are 2 separate pieces of `Corps_01_low014` (106 tris each, centre x ±0.02, y ~0.044). `removeWings` finds connected pieces (merging seam-duplicated vertices) and drops small (<150 tris), off-centre (|x| > 0.012), mid-height pieces.
- Atlas coordinates of each area are in `AREAS` in device-style.js.
- Verified with 2x headless renders (front) + live browser (back during spin, label reads correctly), no errors. Close-up: `D:\Downloads\tamapad-device-restyled.png`.
- Note: headless renders need >9 s to load now (model + restyle); a blank navy render = loader still up, not an error.
- Buttons: user said they looked low-poly (they are: ~40 verts each; flat cream made the facets visible). `rebuildButtons` hides them and adds smooth `ExtrudeGeometry` heart / circle / star (bevelled, 48 curve segments) in cream `MeshPhysicalMaterial` (light clearcoat). Order left→right on the device = model +x → −x (model is shown turned 180°).
  - Placement lessons (3 failed tries): the originals are simple prisms facing STRAIGHT FORWARD (−z), not tilted with the shell. Facing = biggest group of vertices with matching normals (the flat top face); position = centre of that face's OUTLINE (bbox, not vertex average — the heart's lobes bias the average). PCA "thinnest axis" and an ellipsoid surface-normal estimate both gave wrong facing/offsets.
  - Size: radius = widest in-plane extent of the original; shape scaled ×1.7·radius; height ~0.38·radius (flat, sinks into the hole).
  - Verified 4x render (each centred in its hole) + live, no errors. Close-up: `D:\Downloads\tamapad-buttons-new.png`.
  - User: "look at the buttons from the side" — I'd only checked the front. From the side they were thin wafers standing in front of the curved shell, facing straight forward while the shell around the holes tilts down toward the egg's bottom. FIX: raycast the shell just outside each hole's rim (above/below/left/right, along the facing direction) → fit the surrounding surface plane; the button now faces along that surface normal, centred on it, front `raise` = 0.3·radius above the shell, body 1.5·radius deep into the hole. Verified side (5x, at the first spin's side-on moment, scroll 1500) + front (4x) + live, no errors. Side close-up: `D:\Downloads\tamapad-buttons-side.png`.
  - Lesson: check 3D changes from more than one angle (front AND side / back) before calling them done.
  - User then: "executed pretty badly". Diagnosed: flat sticker-like tops (no shading), didn't fill holes (uneven dark gaps, off-centre), each tilted differently. REBUILT (`rebuildButtons` + `BUTTON` settings):
    - Size/centre from each original button's flat top face (biggest same-normal vertex group) projected into the button plane — the hole was made to fit it. (Raycasting the hole failed: the "holes" are a narrow groove around a raised floor, so no depth step is found.)
    - All three face straight out of the holes (model −z, shared). Tilting to the shell's curve slid them off-centre as they sank into the holes.
    - Domed "pillow" top: ExtrudeGeometry bevel kept INSIDE the outline (bevelOffset = −bevelSize), bevelThickness = dome height; per-shape inset (heart 0.16, circle 0.3, star 0.07 — bigger folds the heart notch / star corners). Closed-curve duplicate end point removed (caused a glitch on the circle).
    - Depth: dome top just in front of the original's top face (`raise` 0.08) — putting it relative to the shell rim sank it behind the upper rim (shell slopes back at the bottom). Body runs 2× half-size back into the hole.
    - Result: front = filled, centred, domed; side = solid rounded buttons standing proud of the shell like real Tamagotchi buttons. Verified 4x front, 5x side, live; no errors.
  - Render tool (`chainshot.mjs`): now waits for the loader to disappear (not a fixed 9 s) and offsets the clip by scrollY (page vs. screen coordinates) — both caused blank renders before.

## Who-it's-for icons (2026-10-17)
- User clarified: the "3D object flies over the empty boxes" idea was for HOW IT WORKS (already done). WHO IT'S FOR will just use real icons in its 3 `[ICON]` boxes (Pet lovers / Traders / Charity-minded).
- Done: pixel-art icons (user: "all pixel style"), 12×12 grids → inline SVG (`.pixel-icon`, 48px, cream fill, crispEdges): paw (Pet lovers), coin with TamaPad "T" (Traders), heart (Charity-minded). Grids live in `$CLAUDE_JOB_DIR/tmp/icons.mjs` (generator; job temp). `.placeholder--icon` CSS removed.

## Layout redesign — two lanes (2026-10-17)
- Goal: text never under the Tamagotchi's path. Desktop-only CSS block "TWO-LANE LAYOUT" (`@media (min-width:861px)`, `--lane-start:44%`): where the device is on the LEFT, content starts at 44% (right lane).
  - What is: text block max 500px. Banner (hook): left-aligned in the right lane. Why: head + stat tiles (2×2) in the right lane. How heading: left-aligned (device crosses on the right). Who: heading/sub/cards in the right lane, cards stacked in 1 column. FAQ: widened to maxw, content in the right lane.
  - `.h2` got `text-wrap:balance` (Who heading was leaving "lives." alone).
- Path tweaks to match: Who spin bend now anchored to `.panel--center .h2` (f .5) instead of `.who__grid` bottom (taller stacked cards made the device cross over the heading); end point `.footer` x −0.24, y +0.1 (was centre; it now ends in the empty left area, clear of the FAQ and footer links).
- Verified: rendered path over the full page (clears all text), live desktop at Why / Who / end, no errors.
- Mobile (<861px) keeps the normal stacked layout — device still overlaps content there. User (2026-10-17): "no one cares about phone" — desktop only, don't prioritise or propose mobile work.

## Loose ends done (2026-10-17)
- Telegram link removed from the footer (Social column = X / Twitter only).
- Currency spelling unified to "GamePoints" (How-it-works step 2 had "GamaPoints"); that sentence's lowercase "earn" → "Earn".
- Model credit added under the footer legal line (`.footer__credit`): "3D model based on “Tamagotchi (Pet Sailor Moon)” by Aldemona, licensed under CC BY 4.0 — recoloured and modified", with links to the Sketchfab model, the author and the licence (CC BY requires noting changes).
- Still open: X links (nav square + footer) point to plain x.com — the TamaPad X account doesn't exist yet (user, 2026-10-17). Swap in the handle once it's made.

## Fast-scroll fix — device stays on its path (2026-10-17)
- User: scrolling even remotely fast past How it works "looks like shit, like it doesn't follow its path". Cause: the trailing (PATH_EASE) was applied to screen x and y SEPARATELY → in the tight loops the lagging device cut straight across the inside of each loop; and the lag was in screen space while the path belongs to the page → it slid off its box during fast scrolls. Lenis easing stacked on top.
- Fix (`updatePath`): smooth `progress` = position ALONG the path (in scroll px) instead; the device is placed exactly on the path point for `progress`, with its screen y corrected by (scrollY − progress)/screen height (the point belongs to the page). Lag capped at `MAX_LAG` 0.12 screen heights; `PATH_EASE` 4 → 8. First try (lag cap 0.35, ease 4) stayed on the path but trailed up against the top edge on fast scrolls.
- Verified with fast wheel scrolls through How it works / Who / FAQ (down and up): device on its path mid-motion, no corner cutting, no errors.
- REVERTED by user right after ("revert", no reason given). Back to the old per-channel x/y smoothing, PATH_EASE 4. The fast-scroll problem is therefore open again — don't redo this fix without asking.

## Scroll text reveals (2026-10-17)
- User: "the site looks boring". Agreed first step: drone-site-style scroll text.
- Built in `script.js` (`initTextReveals`): GSAP ScrollTrigger + SplitText registered (first real use); Lenis synced via `lenis.on('scroll', ScrollTrigger.update)` (initLenis now returns the instance).
  - `.h2` + `.banner__title`: split into words, opacity 0.15 → 1, scrubbed to scroll (start top 85%, end top 45%, stagger) — words light up left to right as you scroll.
  - eyebrows, `.body-lg`, `.panel__sub`, `.link-arrow`, `.how__text`, stat tiles, who cards, FAQ items: fade + rise (y 28) once on enter.
  - Hero title words rise in (then sub + buttons) when the loader gets `is-done` (MutationObserver).
  - All skipped for prefers-reduced-motion.
- Verified live: words light progressively mid-scroll, everything ends fully visible, no errors.
- FAQ open/close smoothed (user asked): CSS max-height trick (jerky, delayed close) replaced by GSAP in `initFaq` (script.js): open = tween height to the measured `scrollHeight` (power3.inOut 0.55s) then set `auto`; answer text fades/slides in; close = from current height to 0 (0.45s); opening one closes others; toggle rotation eased to match. `.faq__a` is now `height:0; overflow:hidden`. (GSAP `height:'auto'` measured ~0 here — don't use it.) Note: the automation Chrome tab is rAF-throttled (~4 fps), so time-based animation checks there look stalled — verify by jumping tweens to progress(1) instead.
- Remaining "boring" ideas offered: animated screen pet, section contrast (a cream section / oversized headline), counting stat numbers, pixel icon animation, hover effects.

## Pixel illustrations — hero v1 (2026-10-17)
- User: site boring because of plain blue background → wants PIXEL ILLUSTRATIONS (hero, footer, in between). NOT chunky 8-bit — fine, high-pixel-count art. References (inspiration only, don't copy): `D:\Downloads\HTewx0XbAAAsT35 (1).jpg` (blue/cream engraved desert + lone rider), `HU15oGtaoAEHvBE.jpg` (blue/cream etched harbour town), `HUcV6iabcAADUCD.jpg` (desert camels, gold moon), `HUXJnaGaoAAVt81.jpg` (navy hero, cream engraved palace). Common traits: two-tone blue + cream (one small warm accent max), stippled/engraved texture, low horizon fading into the sky, vast calm scene with a tiny focal point, paper grain.
- Plan agreed: hero (night meadow), 1–2 in-between scenes (e.g. hill + lone tree + animal shelter with a warm lit window), footer (meadow with rescued animals under a crescent moon). User: "work some magic, if it's bad we can get rid of it".
- Built hero: new `pixel-art.js` (loaded after script.js) draws onto `<canvas class="hero__art">` (absolute, full hero, `image-rendering:pixelated`) at HALF resolution (1 art px = 2×2 screen px). Deterministic noise (same art every load), redrawn on width change.
  - Sky: sparse stars (+ a few 4-point), kept mostly clear behind the headline; faint haze above the mountains.
  - Far range: haze blue `[72,110,196]` with a cream moonlit ridge line, contour hatching (`inkAt`, strokes follow depth below the ridge), big peak on the right (behind the Tamagotchi).
  - Mid hills: cream, stippled shading (noise + Bayer dots) darker toward the valley, soft folds.
  - Meadow: near-solid cream with sparse marks + blue grass tufts.
  - Focal point: kid (12×26 sprite) walking a dog (20×15) on a sagging leash, lower left under the headline, cleared patch around them.
- Hero CSS: `min-height: calc(100vh − 110px)` so the landscape sits at the fold; bottom padding `--hero-art` (38vh) keeps copy above the hills; copy/actions z-index 1.
- Iterations: v1 dithered bands looked like flat noise; v2 straight horizontal scanlines; v3 contour hatching; v4 stippled mid hills + bigger sprites (current). Renders: `D:\Downloads\tamapad-hero-pixel.png` / `-zoom.png`.
- Next (pending user feedback): footer scene, in-between scene(s), stronger paper grain.
- User verdict on v4: "pretty bad". Also: "too 2D and the pixels were too big" — wants MUCH smaller, many more pixels. Code-generated landscapes have a low ceiling → REPLACED.

## Pixel illustrations — hero v2: user's image, pixelated (2026-10-17) — REMOVED
- New approach (agreed): user supplies a base image (16:9), I pixelate it in code. Hero image: `assets/hero-src.png` (copy of `D:\Downloads\882cf321-…png`, 1671×941, 3.3 MB): starry blue night, gold desert dunes, crescent moon, two camels + rider + a resting camel.
- `pixel-art.js` rewritten (procedural generator deleted): loads `canvas.dataset.src`, builds a 14-colour palette by k-means on a 160px thumbnail (+ the page navy), draws the image cover-fit and BOTTOM-anchored at 1 art px = `PIXEL` 1.5 CSS px, quantises every pixel to the palette with 8×8 Bayer ordered dithering (`DITHER` 26). Bottom `FADE` 14% blends into the page navy (stronger dither there) → dithered pixel fade into the next section. Redrawn on width change.
- Hero CSS: pulled up under the sticky nav (`margin-top:-114px`, `min-height:100vh`, padding-top 154px) so the sky runs behind the frosted nav; copy stays above the dunes via bottom padding `--hero-art` 38vh.
- Tamagotchi hero stop moved so the camels stay visible and the chain clears the nav: x 0.34, y −0.06, s 0.84 (the moon now peeks through the chain loop).
- Verified renders + live, no errors. Renders: `D:\Downloads\tamapad-hero-pixel.png`, `-zoom.png`.
- User: "yoo it looks so good" — keep this approach/settings for the other scenes.
- BUT then: "it doesn't match with the 3D object flying over it" (glossy smooth 3D vs flat dithered pixel world). I offered pixelating the 3D render to match; user declined: "just get rid of the image on the hero".
- REMOVED (2026-10-17): canvas + pixel-art.js script tag gone, `pixel-art.js` and `assets/hero-src.png` deleted (original still in D:\Downloads), hero CSS back to min-height 92vh / padding 40px 48px 70px (no pull-up under the nav), Tamagotchi hero stop back to x 0.2, y −0.02, s 1. Verified live, no errors.
- Takeaway: the illustrated / pixel-background direction is shelved — background-boredom problem is still open. Don't reintroduce without the user asking.
- Next: footer + in-between scenes need their own images from the user (same 16:9, low horizon). The image is a 3.3 MB PNG — could be compressed later.

## Background orbs (2026-10-17)
- User: keep it simple — clouds / white gradient circles / click ripple? I recommended soft gradient circles (smooth like the 3D render, no style clash); user: "forget the ripple, just add those circles".
- Built: `<div class="orbs">` (after .grain in index.html) with 9 `.orb` spans down the page, alternating sides, inline vars `--top --left --size --depth --drift`. Each is a big radial gradient (blue `rgba(84,136,246,.55)` or cream `rgba(239,227,211,.2)`, fading out by 70%) — no blur filter (cheap). `::before` drifts slowly (CSS `orbDrift`, 26–37 s alternate); `initOrbs` in script.js sets `--shift = scrollY × depth` every frame (light parallax). body is `position:relative`; `main, .footer` z-index 1 above `.orbs` (z 0). Reduced-motion: no drift/parallax.
- First opacities (.38 / .13) were too faint → raised. Verified live: glows visible behind hero / What-is / Why, no horizontal scroll, no errors.

## Top gradient (2026-10-17)
- User: still boring; wants a short gradient at the very top like drone.riotters.com (theirs: `linear-gradient(180deg,#dde5e9,#fdfdfd)` over the hero — lighter tint at the top melting into the page colour).
- Added on `body`: `linear-gradient(180deg, #3f74d8 0, #24539f 160px, var(--navy) 380px)`, no-repeat, 100% × 380px — scrolls away with the page (not fixed). Verified render.

## Layering: device over text, under icons + nav (2026-10-17)
- User: 3D object in front of all text, but behind all icons/buttons and the navbar.
- Stack (root stacking context): `.orbs` z −1 < page text (in flow; main/footer no longer have z-index, so they don't form a stacking context) < `.stage` z 50 < `.btn, .link-arrow, .faq__toggle, .pixel-icon` (position relative, z 60) < `.nav` z 100 < loader 998 / grain 999.
- Gotchas fixed: GSAP fade-in reveals left `transform`/`opacity` on wrappers → stacking contexts that trapped buttons below the device → reveals now use `clearProps:'transform,opacity'`. `.who__card` backdrop-filter trapped the pixel icons → glass moved to a `::before` layer (z −1) under the card.
- Verified: chain slides behind the frosted nav, device covers paragraph text, a script check finds no button/icon trapped by an ancestor; no errors.

## Reload → top (2026-10-17)
- User: reloading should bring you to the top. script.js: `history.scrollRestoration='manual'` + `scrollTo(0,0)` at the top, `pagehide` → `scrollTo(0,0)`, and `ScrollTrigger.clearScrollMemory('manual')` after registering ScrollTrigger (ScrollTrigger was resetting scrollRestoration to 'auto', which is why the first attempt failed). Verified in a fresh headless Chrome: scrolled to 3000, reload → 0. (`$CLAUDE_JOB_DIR/tmp/reloadtest.mjs`)
- Note: the automation Chrome tab caches script.js aggressively (python http.server sends no cache headers); test JS changes in a fresh headless profile or a ?v= URL.

## Chain: no entrance flick (2026-10-17)
- User: the flick at load "looks super weird". Chose option 3: chain loads already resting leaned right, no motion. `CHAIN_BEND.start` 0.6 rad toward `startDir` [1, −0.3] set as the initial bend; intro flick code removed. Physics unchanged.
- Verified (fresh headless, `$CLAUDE_JOB_DIR/tmp/chaintest.mjs`): first 3 s bend.x steady 0.57→0.55 (only the idle float), full scroll range +1.37 / −1.23 (still balanced), no NaN.

## Rounder outline — attempted, reverted (2026-10-17)
- User: "round the outline a bit, nothing else" (not the crack points, not the seam).
- Tried in-code subdivision (2× midpoint split) with Phong-tessellation rounding only on sideways-facing surfaces. Results: v1 tore/spiked (split vertices rounded differently), v2 (position-keyed shape normals, capped moves) → serrated sawtooth outline, v3 (smooth weighting) → still serrated: the outline is a crease/rim against the seam groove; new midpoints bulge while original rim vertices stay put → scallops.
- Reverted completely (roundOutline removed); device back to previous look (verified render).
- Proper fix would be in a 3D editor (e.g. Blender: subdivision surface + creases on the crack/seam edges, then re-export the .glb) or a higher-poly model. Don't retry the in-code approach.
- Also noted (user didn't ask): faint "ghost" bumps where the removed wings were, visible in the shading on the left/right of the shell.

## Backdrop — gamestock.site style — REVERTED (2026-10-18)
- Built gamestock-style background (WebGL beams + strong film grain + vignette, orbs removed). User said "revert" right after, no reason given. Fully undone: backdrop.js deleted, orbs + old CSS grain restored. Background is back to orbs + top gradient. Don't redo without asking.
- Other ideas from the awwwards nominee scan (not tried): kindi.land twinkling pixel grid on blue, junkbranding floating dust, orizon big rings.

## GAME — design preview (2026-10-18)
- Decided: game lives on this site at /play (not built yet); played ON the 3D device's LCD screen, using the device's 3 buttons (♥ next, ● select, ★ back); progress saved in the browser; first version = core loop (pick animal, feed, bathe, minigame, XP/levels). Keep it simple. Minigames = rebuilt retro games (proposed Snake, Pong, Bricks).
- Design preview: http://localhost:8080/debug.html — live 3D device (drag to turn, click its buttons or ←/Enter/Esc) + flat previews of all screens: Pick animal, Home (LV + XP bar, pet, 4 icons Feed/Bath/Play/Stats), Feed, Bath, Play menu, Snake, Stats (LV, XP, SAVED), Level up (+1 SAVED). Animals shown: cat/dog/bunny (placeholders — user hasn't named the animals).
- Files: `lcd.js` (32×35 3-tone LCD buffer, 3×5 pixel font, paints LCD cells; `attachLcd` copies only the screen patch into the atlas texture each refresh via copyTextureToTexture, 7% bezel inset), `game-screens.js` (sprites, screen drawings, button state machine — preview only), `debug.html` + `debug.js`. `device-style.js`: restyleDevice now RETURNS {map, atlasSize, area} for the LCD, and the rebuilt buttons are named TP_heart / TP_circle / TP_star. Landing page unaffected (verified).
- Atlas screen orientation confirmed: transpose (screen x → atlas y, screen y → atlas x), text reads correctly.

## GAME v1 — /play built (2026-10-18)
- User: animals = DOG, CAT, POLAR BEAR (bunny dropped). Minigames: ONLY Snake for now; Pong/Bricks later.
- `play.html` + `play.js`: full-screen 3D device (raised a bit, `lift`), hint line + ♥●★ buttons under it, logo/back link to the site. All "Adopt your pet" buttons + footer "Adopt" now link to play.html.
- `game.js` (logic): pick animal (first visit) → Home (LV, XP bar, wandering pet, Feed/Bath/Play/Stats) → Feed/Bath give XP (CONFIG xpFeed/xpBath 10) with a cooldown (feedEvery 20 min, bathEvery 30 min; otherwise "FULL"/"CLEAN", no XP) → Play menu (SNAKE) → Snake (15×13 grid of 2×2 px, READY 1.5 s, speeds up 170→90 ms; ♥/★ turn left/right, ● pause, arrow keys absolute) → game over gives 2 XP per food → Level up screen "+1 SAVED". Levels: XP to next = 40 + 20×level. SAVED = levels gained. Stats screen: LV, XP bar, SAVED. Numbers are my picks in CONFIG — user can change.
- Save: localStorage `tamapad.save.v1` (animal, level, xp, saved, lastFeed, lastBath, best). `play.html?reset` wipes it.
- Keys: a/s/d or ←→ / Enter / Esc for ♥ ● ★; device buttons clickable; drag turns the device.
- `device-view.js` = shared 3D viewer (play + debug). debug.html/debug.js now use it; game-screens.js holds sprites + the design-preview screens.
- Verified: live play (pick, feed, snake READY/game over, save persists), scripted logic test with faked time (feed→FULL, bath, snake turn + wall death after exactly 7 steps, level-up 55+10 → LV2 xp5 saved1), debug page + landing page OK, no errors.

## 10 minigames (2026-10-18)
- User wanted ~10 games total. Built in `games.js`: SNAKE, PONG, BRICKS (breakout), FLAP (flappy), JUMP (dino runner), SPACE (invaders), BLOCKS (tetris-like), MEMORY (simon with ♥●★), RACER (3-lane dodge), CATCH (falling food, 3 lives). Each = { name, rate (XP per point), pausable, hint, create() → {score, over, press, update(dt, held), draw(F, t)} } in a 30×26 field; game.js draws the frame/score/HI/READY/PAUSE/GAME OVER and turns score into XP. XP rates: snake 2, pong 1 (+3 pts when CPU misses), bricks 1, flap 3, jump 2, space 1, blocks 5/line, memory 3/round, racer 1, catch 1.
- Play menu scrolls (3 rows visible + scroll bar). Best score per game: save `best` is now an object by game name (old numeric Snake best migrated).
- Holding buttons now works (needed for paddles etc.): device-view presses on pointer DOWN (capture phase, before OrbitControls) and reports release; play.js tracks keydown/keyup (a/s/d, Enter/Space/Esc, arrows) and on-screen buttons pointerdown/up. Menus: ♥/→/↓ next, ←/↑ previous.
- Fixes found by testing: JUMP couldn't clear tall obstacles (jump 34/gravity 80, tall = 4 px); FLAP flap stronger; ALL collisions now use the drawn (rounded) positions (bird was dying while visibly clear).
- Verified: 5 random-mash runs per game (no crashes), bots: Pong alive 90 s (52), Catch 67, Bricks 16, Jump ~20, Flap 16–38, Memory 8 rounds; live device: menu scroll, Space, 3D button click. Racer bot deaths traced to bot bugs, game fair.

## Known placeholders (still awaiting direction)
- Pet-stat-card box + 3 how-it-works image boxes: hidden (`visibility:hidden`, keep their space — the path lands on the how-it-works boxes). Who-it's-for icons: DONE (pixel icons).
- No real pump.fun contract address anywhere (none exists yet — correctly omitted).

## Open questions / TBD
- Clothes/items details.
- Charity escrow mechanism (who holds funds, how verified).
- Exact minigame list.

## Pet name (2026-10-18)
- After picking the animal comes a NAME screen (also for old saves that have an animal but no name). ♥/→ next letter, ★/← previous, ● picks; DEL and OK are at the end of the letter list; or just type (letters/digits, Backspace, Enter). Max 8 letters (screen width); an empty name can't be confirmed. Save field `name`.
- Stats screen now: name at the top, pet, LV + XP bar, SAVED; ● = rename, ★ = back.
- "and stuff": user's other customisation wishes not specified yet — asked.
- serve.py added (see START HERE) after a stale cached game.js broke a live test.

## Daily quests + TamaPoints (2026-10-18)
- User: 5 daily quests, each gives XP + **TamaPoints** (user's name for the currency — NOTE the landing page still says "GamePoints"; flagged, not changed).
- `quests.js`: 5 quests per day, picked from the date (same all day, new at local midnight): care (feed OR bath), earn 40/50/60 XP today, beat your high score in a random game, reach a target score in another game (targets per game in TARGET), play 3 different games. Rewards (REWARD): care 10 XP/5 TP, xp 15/10, hi 20/15, score 20/15, play 15/10. Completed automatically → "QUEST DONE!" screen (queued with level-ups, shown after feed/bath/game over). Quest-reward XP does NOT count toward the "earn XP" quest.
- Home menu now 5 icons (5×7 px, `menuX`): feed, bath, play, quests (trophy), stats. Quests screen: TP at top, 5 short labels (done = inverted), ♥ moves a blinking cursor, full description + reward under the device. Stats: name, pet, LV + XP bar, SAVED, TP.
- Save: `tp`, `quests` {day, xpToday, played[], list[]}.
- Fixes found while testing: quest description crashed for non-game quests; buttons held in a menu carried into a game (held now cleared when a game starts).
- Verified with scripted tests (feed quest, Catch bot score 73 → level up + 3 quests, TP totals, play-3-games, day rollover) + device screenshots.

## /play navbar: Stats + Quests moved off the device (2026-10-18)
- User: quests (and then stats) belong in a NAVBAR on /play, not on the LCD.
- Device home is back to 3 icons (feed, bath, play; `menuX` = 3 + i·11). Device screens 'quests', 'questdone', 'stats' removed; renaming from the device removed (first-time naming after picking the animal stays on the device).
- play.html: frosted pill navbar (logo · Stats · Quests n/5 badge · "N TP" pill · ← Site). Dropdown panels (one open at a time; click outside / Esc closes):
  - Stats: name + Rename (input, A–Z/0–9, max 8, saved via game.rename), "Animal · Level N", XP bar "x / y XP", tiles Real animals saved + TamaPoints, best score per game.
  - Quests: "Daily quests" + "New quests in Xh Ym", 5 cards (tick when done, description, progress bar for multi-step, reward chips +XP / +TP).
- Quest done = page notification (cream toast under the navbar, ~4 s) — my choice since the quests now live on the page; user can ask to put it back on the device.
- game.js API for the page: info() (snapshot), rename(name), takeEvents() (quest-done events). play.js polls info() every 300 ms and redraws only on change; key handling ignores typing inside inputs.
- Device framing on /play: distance 4.4, lift 0.1 (clears navbar + hint).
- Verified live: navbar, both panels, toast + badge/TP update after a bath completed the XP quest, rename "sadie99x!" → SADIE99X, no console errors.

## Daily spin (2026-10-18)
- User: simple daily spin in the /play navbar, "win some stuff". Prizes = XP / TamaPoints only (nothing else exists yet; items can join once a shop exists).
- Navbar "Daily spin" tab (yellow dot when the free spin is ready) → panel with an SVG wheel of 8 prizes (`SPIN_PRIZES` in game.js, weights add to 100): +10 XP 20%, +5 TP 20%, +20 XP 15%, +10 TP 15%, +40 XP 10%, +20 TP 10%, +75 XP 5%, +50 TP 5% (the two 5% ones are gold). Spin button → 4.6 s eased spin landing on the prize → "You won …!" + toast; then "Next spin in Xh Ym" (local midnight).
- game.js: spinAvailable(), spin() (picks prize, marks the day + `spinPending` immediately so reload can't re-spin), claimSpin() (pays out when the wheel stops, or on next load if closed mid-spin). Spin XP doesn't count toward the "earn XP" quest; a level up from it shows on the device right away.
- Verified live: landed on +75 XP (matches result), level 1→2 shown on device, button/ dot state; scripted: pending prize paid on reload, second spin same day refused.

## Shop (2026-10-18)
- User: shop sells colours for the pet (pixels) and the 3D device (shell only, cream parts stay). Layout: buy on the LEFT, preview + equip on the RIGHT; click any colour (owned or not) to preview; buying and equipping are separate steps.
- `shop.js` catalogue: device Blue (free default), Red, Pink, Purple, Mint, Black, White (75 TP), Gold (400, rare); pet Classic (free default), Red, Pink, Purple, Blue, Green, Orange (75), Rainbow (400, rare; hue shifts across the pet).
- Navbar "Shop" → modal window (shop-box): left swatch grids (price / Owned / Equipped), right: its own small turning 3D device (second createDeviceView, paused while the shop is closed via setActive) showing the previewed shell + the pet in the previewed colour; button = Buy · N TP / Need N more TP / Equip / Equipped. Game input paused while the shop is open; Esc / × / backdrop closes.
- Tech: device-style.js now sorts shell pixels once (index + brightness) and `setShell(rgb)` repaints the atlas fast (landing page unaffected, still blue). lcd.js: buffer values 3/4 = pet dark/mid, painted in the pet colour (`sprite(..., { pet: true })`). device-view: `shell`, `spin`, `setShell`, `setActive`; onFrame may return { buf, pet }. game.js: save `owned` / `equipped`, buy(), equip(), look(); info() has owned/equipped/animalId.
- Verified live (with a temporary 500 TP, then restored the save to 15 TP / defaults): previews, buy Pink + Rainbow (TP 500→425→25), equip, "Need 375 more TP" on Gold, main device pink + rainbow pet, persists after reload; landing page still blue; no errors.

## LCD window fix (2026-10-18)
- User: the see-through green screen was too big — spilled past the bottom of its frame and on the top corners.
- Cause: the painted screen patch (AREAS.screen) was ~31 atlas px too long on the atlas-right side (= screen BOTTOM, the atlas holds the screen sideways) and square, while the real LCD window is a rounded rect with a darker sunken edge.
- Fix (measured by flood-filling the non-cream LCD area in the original texture): AREAS.screen = { x 130, y 1295, w 427, h 430, r 32 }. Landing static screen + live LCD both paint only inside the rounded window (clip), with `lcdShade` inner shadow; live LCD keeps the bezel corners from the atlas; content margin 5% (was a 7% "bezel" inset that compensated for the oversized patch). Colour pass now skips only the rounded window, so the corners get cream like the rest of the bezel.
- Verified front + side on /play and the landing page, no errors.

## Parked ideas (2026-10-18)
- Leaderboard: discussed, user said "later". Needs a server (Vercel functions + Supabase/Upstash), a Leaderboard navbar tab, basic anti-cheat (reject impossible scores, rate limit). Open questions: what's ranked (animals saved / per-game bests), all-time vs weekly, pet name vs player name, user to create the DB account.
- Hosting: probably Vercel + custom domain later. User wants /play (not /play.html): plan = vercel.json cleanUrls, links → /play, serve.py maps /play. Offered, not done yet.

## RENAMED: TamaPad → TamaPet (2026-10-18)
- User: the site isn't all about a launchpad → new name **TamaPet** (picked by the user over my suggestions HeartBit / OneLife / PixelPaws).
- Every visible "TamaPad" changed (landing, /play, debug, page titles, nav logos, device back label, footer, FAQ, comments, serve.py). Folder is still D:\TamaPad.
- Kept on purpose (internal, never shown): save key `tamapad.save.v1` (renaming would wipe saves) and the quest seed 'tamapad' (would reshuffle today's quests).
- Currency is still "TamaPoints" (landing still says "GamePoints" — still to align).
- Older notes below say TamaPad — same project.

## Logo (2026-10-18)
- User supplied their own logo: D:\Downloads\6d9827ca-…png — blue pixel-cat outline (smile, square eyes) with a "+" sparkle (copied to assets/logo/tamapet-logo-source.png). My 3 generated options (A/B/C) were rejected and deleted.
- Traced into exact vectors (41 rects, colour #034FED): `assets/logo/tamapet-logo.svg` (transparent) and `assets/logo/tamapet-icon.svg` (cream rounded square + blue cat) — the icon replaces the "T" in the landing + /play navbars and is the browser-tab icon (index, play, debug).
- NOT changed (ask first): the cream "T" badge on the front of the 3D device.

## GitHub + Vercel (2026-10-18)
- Repo: https://github.com/pokuthegoat/TamaPet (branch main). Everything pushed except server.log (.gitignore). vercel.json has `cleanUrls: true` → play.html is served at /play (play.html redirects there), so no link changes were needed.
- User wants it simple: make repo, push everything, host on Vercel. Don't overthink deploy steps.

## Connect wallet (Privy) (2026-10-18)
- Wallet-only login (Solana: Phantom, Solflare, Backpack + detected wallets), button in BOTH navbars (landing next to "Adopt your pet", /play next to "← Site").
- Source: wallet/main.jsx (React + @privy-io/react-auth) → built with `npm run build:wallet` (wallet/vite.config.js) into ONE committed static file /wallet.js (~5.7 MB minified, loads async, doesn't block the page). Vercel stays a plain static host — no build step there. Rebuild + commit wallet.js after changing wallet/main.jsx.
- config.js holds the public Privy App ID. The app SECRET is in .env.local (git-ignored) — never commit it / never write it in these notes.
- Solana peer deps pinned to a matching set: @solana/kit ^5, @solana-program/memo 0.10.0, system ^0.10, token ^0.9 (newer memo needs kit 8 → conflict).
- Connected state: shortened address + green dot, menu Copy address / Disconnect. Fires `tamapet:wallet` events + window.tamapetWallet.address for the cloud save later.
- Verified: button on both pages, Privy login modal opens with the Solana wallet list, no errors. Actual wallet connection to be tested by the user. User must add localhost:8080 + the Vercel domain to Privy allowed domains.
- vercel.json now also pins a plain static deploy (framework null, no-op install/build, outputDirectory ".") — otherwise Vercel would auto-detect Vite from package.json and build/serve the wrong thing.

## Cloud save (2026-10-18)
- Supabase project imgngvgdqalbgnzbtagp (org MarketOS). Table public.saves (user_id text PK = Privy DID, wallet, name, level, saved, data jsonb, updated_at); RLS on, no policies → public key blocked; service_role granted select/insert/update/delete (new projects don't auto-grant).
- api/save.js (+ api/_lib.js): GET/POST, verifies the Privy login token itself (ES256 JWT via Privy JWKS, node:crypto) and looks up the Solana wallet via Privy's REST API; writes via Supabase REST with the secret key; sanity checks (size ≤ 64 KB, level/xp/tp/saved ranges, name A–Z0–9 ≤ 8). No npm deps → vercel.json no-op install still fine. Tested locally: no/garbage/forged token → 401; DB round trip OK.
- Client: wallet.js exposes window.tamapetWallet.getToken(); game.js createGame({ onSave }) + data()/hasPet()/setData(); play.js: on connect GET → cloud save replaces local (toast "loaded … from your wallet"), or if none, uploads the local pet; afterwards every change POSTs (debounced 1.5 s, flush on hide).
- Vercel needs env vars: PRIVY_APP_ID, PRIVY_APP_SECRET, SUPABASE_URL, SUPABASE_SECRET_KEY (values in .env.local).
- Live (2026-10-18): user added the 4 env vars in Vercel; needed a redeploy (empty commit) to take effect. Verified: live /play with the user's connected wallet → GET /api/save 200 (real Privy token verified + Supabase read). No pet on the live domain yet, so nothing uploaded; POST path to be confirmed once the user creates/plays a pet there.
- Confirmed end-to-end: user made pet "TEST" (cat) on live /play → row in public.saves with wallet AtC9…dzQE (looked up via Privy server-side). POST path works.
- BUG found + fixed (2026-10-18): a stale tab (opened before the pet existed, "synced" to an empty game) overwrote the user's newer cloud save "TEST" with an empty pet when it was navigated away (visibilitychange push). Fixes: (1) a save without a pet is never uploaded (page) and refused (server 400); a cloud save without a pet never replaces a local pet; (2) version check: POST carries `base` (the updatedAt it started from); server answers 409 + the cloud data if the cloud is newer / exists without base → page loads that instead ("loaded newer progress from another tab or device"). Tested with a stubbed login.
- Leaderboard (2026-10-18): api/leaderboard.js (public, CORS *, cached 20 s): top 50 by saved (then level) or ?game=X by data.best.X. /play navbar "Leaderboard" tab: "Animals saved" button + minigame dropdown; rows rank (top 3 gold) · pet name · animal · short wallet · value; own wallet highlighted. Local test server reads the live API.

## Live counter (2026-10-18)
- Landing: new section `.counter` between How it works and Who it's for — green "Live" dot, big number = real animals saved by all players (sum of `saved` over cloud saves, api/stats.js, public + edge-cached 10 s), "real animals saved by TamaPet players, and counting." Counts up when scrolled into view, re-polls every 15 s (local test server reads the live API). Right lane on desktop.
- 3D path: added a stop `{ el: '.counter', f: .5, x: -.3 }` so the device finishes crossing before the counter and rests on its left (it was crossing right over the number). Don't give the counter the class panel--center (the Who-it's-for path anchor uses `.panel--center .h2`).

## Launching your pet — DROPPED (2026-10-18)
- User decided not to build pet-coin launching ("seems like a lot of work"). Research kept for reference: pump.fun creator fee sharing (Jan 2026) lets the creator assign up to 10 fee recipients (could be 100% to a charity), payout instruction distribute_creator_fees_v2 is permissionless; set after launch (2nd signature). Operation Kindness Giving Block SOL address the user generated: GUEAn5QX63jihkPb3ojN2A8e8tpXZbAjLB2QWnMaowyw (reusable). Polar Bears International also takes SOL via The Giving Block.
- The site still mentions tokenising (How it works step 03 line, "Traders" card, 2 FAQ items) — asked the user whether to remove.
- Removed from the landing (2026-10-18): step 03 "Tokenise your pet on pump.fun" sentence, the "Traders" card (Who it's for now 2 cards: Pet lovers, Charity-minded), FAQ "Can I tokenise my pet?" and "Where do the trading fees go?". Kept: FAQ "Is this financial advice?" + footer legal line (both mention tokens in general).
- FAQ now (2026-10-18): What is TamaPet? · What animals can I adopt? · How do I level up? (updated: feed/bath, minigames, daily quests, spin) · What can I play? (10 games) · What are daily quests? · What are TamaPoints for? (shop colours). Financial-advice FAQ + footer text removed (footer: "© 2026 TamaPet." + model credit).
- "GamePoints … clothes and items" fixed everywhere on the landing → TamaPoints / new colours (Why tile, How step 02).

## Wallet required to play (2026-10-18)
- Without a connected wallet you can only browse/pick an animal. Picking → LCD "CONNECT WALLET" screen (pet shown); ● opens the Privy login (game emits {type:'login'} → window.tamapetWallet.login()); ★ back to picking. Once connected (and after any cloud save has loaded) the game continues: cloud pet → home, local pet → home (uploaded), else naming with the picked animal. Disconnecting (or a returning browser-only pet with no wallet) → connect screen.
- wallet.js now reports `ready` (Privy finished checking an existing login) so returning users don't flash the connect screen; game.setWallet(true/false) called by play.js only when ready.
