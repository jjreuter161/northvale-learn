// DESIGN SYSTEM — the look (navy and cream, Light and Dark) as CSS variables,
// and the small set of pieces every module builds with. Phone first: 44pt
// tap targets, 16px inputs (so iPhones don't zoom), one column.
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { lookFrom, specFor, AVATAR_COLORS, AVATAR_INK } from "./colors.js";
import { tokensCss } from "./tokens.js";
import { MARK_PATHS, UNIT_ART, BADGE_ART, SCENE, wave } from "./art.js";
import { createPortal } from "react-dom";
import { useLayout } from "./layout.js";
import { holdBack } from "./back.js";

// THE LOOK — three colors (navy, cream, signal red; colors.js): the app's CSS
// variables come from `lookFrom(background, text, highlight)`. Words, icons and
// borders use --brand (the text color); only the main button's fill is the
// highlight (--fill), and red is a spark, never a text color on navy and never
// a wrong answer. One card style: a fill and a soft lift. --art* are the
// pictures' colors (art.js). Every readable combination is tested
// (test/colors.test.mjs). Saved settings.look stays "white" (Cream), "navy",
// "auto" or "custom".
export { lookFrom, specFor };

// The three colors to show: the saved look, with "auto" following the device
// (Navy when the phone is dark, Cream when it's light), kept up to date.
export function useLookSpec(settings) {
  const dark = () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  const [deviceDark, setDeviceDark] = useState(dark);
  const look = settings.look;
  useEffect(() => {
    if (look !== "auto" || typeof matchMedia !== "function") return undefined;
    const m = matchMedia("(prefers-color-scheme: dark)");
    const on = () => setDeviceDark(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [look]);
  const colors = settings.colors;
  return useMemo(() => specFor({ look, colors }, deviceDark), [look, colors && colors.bg, colors && colors.text, colors && colors.hi, deviceDark]);
}

// Profile colors (the avatar is the nickname's first letter on one).
export const AVATARS = AVATAR_COLORS; // navy and red tints, with a cream letter (AVATAR_INK)
export { AVATAR_INK };

export const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const SERIF = "'EB Garamond', Georgia, serif";
// Headings and big numbers: Inter, set heavier and tighter (self-hosted, web/fonts; SIL Open Font License).
export const DISPLAY = FONT;

export const GLOBAL_CSS = `
${tokensCss()}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg)}
html{scroll-padding-top:calc(72px + env(safe-area-inset-top));scroll-padding-bottom:calc(96px + env(safe-area-inset-bottom))}
body{font-family:${FONT};font-size:var(--t-body);font-weight:var(--w1);line-height:var(--lh-text);color:var(--ink);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-feature-settings:'cv11','ss01';font-variant-numeric:tabular-nums}
button{font-family:inherit}
input,select,textarea{font-family:inherit;font-size:var(--t-body)}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
h1,h2{color:var(--head)}
.nv-disp{font-family:${DISPLAY};font-weight:var(--w3);letter-spacing:-.022em;line-height:var(--lh-tight)}

/* Button: 56 (lg), 52 (md), 44 (sm) high. One red main button per screen. */
.nv-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--s2);max-width:100%;min-height:var(--touch-primary);padding:var(--s3) var(--s5);border:0;border-radius:var(--r2);background:var(--surface);color:var(--ink);font-size:var(--t-lead);font-weight:var(--w2);line-height:var(--lh-tight);text-align:center;cursor:pointer;box-shadow:0 0 0 var(--ring,0px) var(--ringc,transparent);transition:filter var(--m-press) ease-out,background-color var(--m-press) ease-out}
.nv-btn.md{min-height:var(--touch-control);font-size:var(--t-body)}
.nv-btn.sm{min-height:var(--touch);padding:var(--s2) var(--s4);border-radius:var(--r1);font-size:var(--t-sm)}
.nv-btn.full{width:100%}
.nv-btn:active:not(:disabled){filter:brightness(.92)}
.nv-btn.primary{background:var(--fill);color:var(--onFill);--ring:var(--ringW);--ringc:var(--ringC);box-shadow:0 0 0 var(--ring) var(--ringc),0 1px 0 var(--edge)}
.nv-btn.bad{background:var(--red);color:var(--onRed);--ring:var(--ringBad);--ringc:var(--ringC);box-shadow:0 0 0 var(--ring) var(--ringc),0 1px 0 var(--shade)}
.nv-btn.good{background:var(--good);color:var(--onBrand);box-shadow:0 1px 0 var(--edge)}
.nv-btn.secondary{background:transparent;color:var(--ink);box-shadow:inset 0 0 0 2px var(--ink)}
.nv-btn.ghost{background:transparent;color:var(--link)}
.nv-btn:disabled{cursor:default}
.nv-btn.primary:disabled,.nv-btn.bad:disabled,.nv-btn.good:disabled{background:var(--surface2);color:var(--low);box-shadow:none}
.nv-btn.secondary:disabled,.nv-btn.ghost:disabled{opacity:.45}

/* Card and rows: flat, with a 1px line. */
.nv-card{display:block;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);padding:var(--s4);color:var(--ink);font:inherit}
.nv-card.hero{border-radius:var(--r3)}
button.nv-card{cursor:pointer}
.nv-list{background:var(--surface);border:1px solid var(--line);border-radius:var(--r2);overflow:hidden}
.nv-list>*+*{border-top:1px solid var(--line)}
.nv-row{display:flex;align-items:center;gap:var(--s3);width:100%;min-height:56px;padding:var(--s3) var(--s4);text-align:left;border:0;background:transparent;color:var(--ink);font:inherit}
button.nv-row{cursor:pointer}
.nv-ico{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:40px;height:40px;border-radius:var(--r1);background:var(--surface2)}
.nv-tag{display:inline-flex;align-items:center;gap:var(--s1);min-height:28px;padding:0 var(--s3);border-radius:999px;background:var(--surface2);color:var(--ink);font-size:var(--t-cap);font-weight:var(--w2);line-height:var(--lh-tight);white-space:nowrap}
.nv-chip{display:inline-flex;align-items:center;gap:var(--s2);min-height:var(--touch);padding:var(--s2) var(--s4);border:2px solid var(--line);border-radius:var(--r1);background:var(--surface);color:var(--ink);font-size:var(--t-body);font-weight:var(--w2);cursor:pointer}
.nv-seg{display:flex;gap:var(--s1);padding:var(--s1);background:var(--surface2);border-radius:var(--r2)}
.nv-seg>button{flex:1;min-width:0;min-height:var(--touch);padding:var(--s2);border:2px solid transparent;border-radius:var(--r1);background:transparent;color:var(--mid);font-size:var(--t-sm);font-weight:var(--w2);overflow-wrap:anywhere;cursor:pointer}
.nv-seg>button[aria-checked=true],.nv-seg>button[aria-pressed=true]{background:var(--bg);color:var(--ink);font-weight:var(--w3)}
.nv-switch{position:relative;flex-shrink:0;width:52px;height:var(--touch);padding:0;border:0;background:transparent;cursor:pointer}
.nv-switch::before{content:"";position:absolute;left:0;top:6px;width:52px;height:32px;border-radius:999px;border:2px solid var(--low);background:var(--surface2);transition:background-color var(--m-press) ease-out}
.nv-switch::after{content:"";position:absolute;left:6px;top:10px;width:24px;height:24px;border-radius:50%;background:var(--low);transition:left var(--m-press) ease-out,background-color var(--m-press) ease-out}
.nv-switch[aria-checked=true]::before{background:var(--brand);border-color:var(--brand)}
.nv-switch[aria-checked=true]::after{left:24px;background:var(--onBrand)}
.nv-field{display:block;width:100%;min-height:var(--touch-control);padding:var(--s3) var(--s4);border:1px solid var(--low);border-radius:var(--r1);background:var(--surface);color:var(--ink)}
.nv-iconbtn{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:var(--touch);height:var(--touch);border:0;border-radius:50%;background:var(--surface2);color:var(--ink);cursor:pointer}
.nv-iconbtn.plain{background:transparent}
.nv-cap{font-size:var(--t-cap);font-weight:var(--w2);letter-spacing:.06em;text-transform:uppercase;color:var(--mid)}

/* A lesson: the header (close, progress, "3 of 6"), the reading column, the pinned action, and on a laptop the side panel. */
.nv-ovl{max-width:640px;min-height:100%;margin:0 auto;display:flex;flex-direction:column;padding:calc(var(--s2) + env(safe-area-inset-top)) var(--s4) calc(var(--s4) + env(safe-area-inset-bottom))}
.nv-lhead{display:flex;align-items:center;gap:var(--s3);min-height:var(--touch-primary);margin-bottom:var(--s3)}
.nv-lhead .count{flex-shrink:0;min-width:var(--touch);text-align:right;color:var(--mid);font-size:var(--t-sm);font-weight:var(--w2);white-space:nowrap}
@media(max-width:260px){.nv-lhead .count{display:none}}
.nv-lesson{flex:1;display:flex;flex-direction:column;min-height:0}
.nv-main{flex:1;display:flex;flex-direction:column;min-width:0}
.nv-lside{display:none}
.nv-dock{position:sticky;bottom:0;background:var(--bg);padding:var(--s3) 0 var(--s1);box-shadow:0 -12px 12px -8px var(--bg)}
.nv-opt{display:flex;align-items:center;gap:var(--s3);width:100%;min-height:64px;padding:var(--s3) var(--s4);border:2px solid var(--line);border-radius:var(--r2);background:var(--surface);color:var(--ink);font:inherit;font-size:var(--t-lead);font-weight:var(--w2);text-align:left;cursor:pointer}
.nv-opt:disabled{cursor:default}
.nv-k{display:flex;align-items:center;justify-content:center;flex-shrink:0;width:32px;height:32px;border:2px solid var(--line);border-radius:50%;color:var(--mid);font-size:var(--t-sm);font-weight:var(--w2)}
.nv-k.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.nv-fb{margin-bottom:var(--s3);padding:var(--s4);border-radius:var(--r2);background:var(--surface)}

/* Motion: a press, something arriving, a sheet (tokens). Reduced motion makes all of it instant. */
.nv-glide{transition:transform var(--m-glide) cubic-bezier(.3,.8,.3,1)}
@keyframes nvSpring{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}
.nv-press{transition:filter var(--m-press) ease-out,background-color var(--m-press) ease-out;-webkit-tap-highlight-color:transparent}
.nv-press:active{filter:brightness(.96)}
.nv-in{animation:nvIn var(--m-enter) ease-out both}
.nv-pop{animation:nvIn var(--m-enter) ease-out both}
@keyframes nvIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes nvFade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
.nv-reduce *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}

/* Layout */
.nv-scene{max-height:132px}
@media(min-width:700px){.nv-sunrise{-webkit-mask-image:linear-gradient(to right,transparent,var(--ink) 14%,var(--ink) 86%,transparent);mask-image:linear-gradient(to right,transparent,var(--ink) 14%,var(--ink) 86%,transparent)}}
.nv-split{display:grid;grid-template-columns:minmax(380px,5fr) 6fr;min-height:100dvh}
.nv-brand{background:var(--brand);color:var(--onBrand);display:flex;flex-direction:column;justify-content:space-between;gap:var(--s7);padding:var(--s8);position:sticky;top:0;height:100dvh;align-self:start}
.nv-formside{display:flex;align-items:center;justify-content:center;padding:var(--s7)}
@media (max-width:280px){.nv-word{display:none}}.nv-hdr{container-type:inline-size}@container (max-width:215px){.nv-beta{display:none}}@container (max-width:160px){.nv-hdr .nv-word{display:none}}
.nv-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-0px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.nv-app{min-height:100dvh}
@media(min-width:1024px){.nv-app{display:grid;grid-template-columns:240px minmax(0,1fr)}}
.nv-side{position:sticky;top:0;height:100dvh;display:flex;flex-direction:column;gap:var(--s1);padding:var(--s5) var(--s4) var(--s4);border-right:1px solid var(--line);overflow-y:auto}
.nv-sidebtn{display:flex;align-items:center;gap:var(--s3);width:100%;min-height:var(--touch-control);padding:0 var(--s4);border:0;border-radius:var(--r1);background:transparent;color:var(--mid);font:inherit;font-size:var(--t-body);font-weight:var(--w2);cursor:pointer;text-align:left}
.nv-sidebtn[aria-current]{background:var(--surface2);color:var(--ink);font-weight:var(--w3)}
.nv-tabs{position:fixed;left:0;right:0;bottom:0;z-index:30;background:var(--bg);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
.nv-tabs>div{display:flex;max-width:640px;margin:0 auto;padding:var(--s2) var(--s2) var(--s3)}
.nv-tab{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:var(--s1);min-height:var(--touch-control);padding:0 var(--s1);border:0;background:transparent;color:var(--mid);font-size:var(--t-cap);font-weight:var(--w2);line-height:var(--lh-tight);cursor:pointer;text-align:center;hyphens:auto;overflow-wrap:anywhere}
.nv-tab .pill{display:flex;align-items:center;justify-content:center;width:100%;max-width:56px;height:32px;border-radius:999px}
.nv-tab[aria-current]{color:var(--ink);font-weight:var(--w3)}
.nv-tab[aria-current] .pill{background:var(--surface2)}
.nv-learn{display:grid;grid-template-columns:minmax(0,700px);justify-content:center;gap:var(--s6)}
@media(min-width:1180px){.nv-learn{grid-template-columns:minmax(0,700px) 300px;align-items:start}.nv-learn>aside{position:sticky;top:76px;display:flex;flex-direction:column;gap:var(--s4);max-height:calc(100dvh - 92px);overflow-y:auto;padding:var(--s1)}}
.nv-cols{display:block}
@media(min-width:600px){.nv-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--s5);align-items:start}.nv-cols>.nv-span{grid-column:1/-1}.nv-cols>div>:first-child{margin-top:0!important}}
@media(min-width:1024px){.nv-cols.nv-c3{grid-template-columns:repeat(3,minmax(0,1fr))}}
.nv-sheetwrap{align-items:flex-end}
.nv-scrim{position:absolute;inset:0;background:var(--scrim);animation:nvFade var(--m-enter) both}
.nv-sheet{position:relative;width:100%;max-width:560px;background:var(--bg);border-radius:var(--r3) var(--r3) 0 0;padding:var(--s3) var(--s4) calc(var(--s5) + env(safe-area-inset-bottom));animation:nvSpring var(--m-sheet) ease-out both}
.nv-grab{width:40px;height:5px;border-radius:999px;background:var(--line);margin:0 auto var(--s3)}
.nv-sheethead{display:flex;align-items:center;justify-content:space-between;gap:var(--s3);margin:0 0 var(--s3);flex-shrink:0}
@media(min-width:700px){.nv-sheetwrap{align-items:center}.nv-sheet{border-radius:var(--r3)!important;padding-bottom:var(--s5)!important;max-height:min(88dvh,760px)!important;animation:nvIn var(--m-sheet) ease-out both!important;box-shadow:var(--lift)}.nv-grab{display:none}}
@media(min-width:1024px){.nv-ovl{padding-top:var(--s5);padding-bottom:var(--s6)}.nv-ovl.wide{max-width:1096px}.nv-lesson{flex:none;display:grid;grid-template-columns:minmax(0,712px) 280px;gap:var(--s7);justify-content:center}.nv-main{flex:none}.nv-lside{display:block;padding-top:var(--s5)}.nv-dock{padding-top:var(--s5)}.nv-dock .nv-btn.full{width:280px}.nv-hero .nv-btn.full{width:auto;min-width:240px}}
@media(hover:hover) and (pointer:fine){.nv-press:hover:not(:disabled){filter:brightness(.97)}.nv-btn.nv-press:hover:not(:disabled){filter:brightness(1.07)}.nv-list>.nv-press:hover{background:var(--bg)!important}.nv-sidebtn:not([aria-current]):hover{background:var(--surface);color:var(--ink)}.nv-hit:hover{background:color-mix(in srgb,var(--artPaper) 32%,transparent)!important;outline:2px solid var(--artSea2)}}
`;

const PATHS = {
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  back: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
  lock: "M7 11V8a5 5 0 0110 0v3M6 11h12v9H6z",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 100 18 9 9 0 000-18z",
  send: "M4 12l16-8-6 16-2.5-6.5L4 12z",
  external: "M14 4h6v6M20 4l-9 9M18 14v6H4V6h6",
  chart: "M4 19h16M6 16l4-5 3 3 5-7",
  target: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a5 5 0 100 10 5 5 0 000-10zm0 4a1 1 0 100 2 1 1 0 000-2z",
  news: "M5 5h11v14H6a1 1 0 01-1-1V5zm11 4h3v9a1 1 0 01-2 0M8 9h5M8 12h5M8 15h3",
  chat: "M5 5h14v10H10l-4 4v-4H5z",
  book: "M5 4h9a3 3 0 013 3v13H8a3 3 0 01-3-3V4zm0 13a3 3 0 013-3h9",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 0114 0",
  settings: "M12 9a3 3 0 100 6 3 3 0 000-6zm7.4 3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-2-1.2L14.5 2h-5l-.4 2.6a7.5 7.5 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 002 1.2l.4 2.6h5l.4-2.6a7.5 7.5 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  trophy: "M8 4h8v5a4 4 0 01-8 0V4zm0 2H5a3 3 0 003 4m8-4h3a3 3 0 01-3 4M12 13v4m-4 3h8",
  shield: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z",
  sparkles: "M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4zM19 15l.7 1.8 1.8.7-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7L19 15z",
  refresh: "M20 11a8 8 0 10-2.3 6.1M20 4v7h-7",
  calendar: "M5 6h14v14H5zM5 10h14M9 3v4M15 3v4",
  wallet: "M4 7h14a2 2 0 012 2v9a2 2 0 01-2 2H4V7zm0 0l11-3v3m2 7h.01",
  play: "M8 5l11 7-11 7V5z",
  volume: "M5 10v4h3l5 4V6l-5 4H5zm11-1a4 4 0 010 6",
  pie: "M12 3v9h9M21 12a9 9 0 11-9-9",
  card: "M3 6h18v12H3zM3 10h18M7 15h4",
  building: "M5 21V5l7-2v18M12 8h7v13M8 8h1M8 12h1M8 16h1M15 12h1M15 16h1M3 21h18",
  layers: "M12 3l9 5-9 5-9-5 9-5zm-9 9l9 5 9-5M3 16l9 5 9-5",
  scale: "M12 4v16M6 20h12M5 7h14M5 7l-3 6a3 3 0 006 0L5 7zm14 0l-3 6a3 3 0 006 0l-3-6z",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zm0 4v5l3 2",
  piggy: "M5 11a6 5 0 0112 0c1 0 2 1 2 2s-1 2-2 2l-1 3h-2v-2H9v2H7l-1-3c-1-1-1-2-1-4zm9-1h.01M3 10c0 1 1 2 2 2",
  compass: "M12 3a9 9 0 100 18 9 9 0 000-18zm3.5 5.5l-2 5-5 2 2-5 5-2z",
  star: "M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0012 3z",
  flag: "M5 21V4m0 0h11l-2 4 2 4H5",
  home: "M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5",
  car: "M5 16V12l2-5h10l2 5v4M5 16h14M5 16v2h3v-2m8 0v2h3v-2M4 12h16M8 13.5h.01M16 13.5h.01",
  users: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  share: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13",
  copy: "M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2zM5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1",
};

export function Icon({ name, size = 22, color = "currentColor", stroke = 2, fill = "none", label }) {
  if (name === "streak") return <StreakStar size={size} color={color} label={label} />;
  if (name === "flame")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined}>
        <path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill={color} />
        <path d="M12 13c1.5 1.5 3 2.5 3 4.5a3 3 0 01-6 0c0-1.3.8-2.3 1.5-3 .2 1 .8 1.5 1.5 1.5 0-1 0-2 0-3z" fill="var(--bg)" opacity={0.35} />
      </svg>
    );
  if (name === "bolt")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined}>
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill={color} />
      </svg>
    );
  if (name === "snow")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round">
        <path d="M12 2v20M4 7l16 10M20 7L4 17M9 3.5l3 2 3-2M9 20.5l3-2 3 2" />
      </svg>
    );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined}>
      <path d={PATHS[name] || ""} />
    </svg>
  );
}

// WHAT'S CHOSEN — outlined in the main button's color (3px, with the button's edge on navy), and never by color alone:
// whatever wears SELECTED also shows a check or a filled dot.
export const SELECTED = { border: "2px solid var(--select)", boxShadow: "inset 0 0 0 1px var(--select)" };
export const Chosen = ({ size = 18 }) => <Icon name="check" size={size} stroke={3} color="var(--ink)" />;

// BUTTONS — kind "primary" is the one red main button of a screen; "secondary" is outlined in the text color; "ghost" is
// a plain link; "bad" is the final confirm of something that can't be undone. A button that can't be pressed yet is quiet
// and neutral (never a faded red). Heights are the touch tokens: lg 56, md 52, sm 44. What each kind looks like is CSS (.nv-btn).
export function Button({ kind = "primary", size = "lg", full, disabled, onClick, children, style, type = "button", ...rest }) {
  return (
    <button type={type} className={`nv-press nv-btn ${kind}${size === "lg" ? "" : ` ${size}`}${full ? " full" : ""}`} onClick={disabled ? undefined : onClick} disabled={disabled} style={style} {...rest}>
      {children}
    </button>
  );
}

// A card: flat, with a 1px line. `hero` has the largest corners. A card you can press is a button.
export function Card({ children, style, onClick, pad = 16, hero, ...rest }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`nv-card${onClick ? " nv-press" : ""}${hero ? " hero" : ""}`} onClick={onClick} style={{ padding: pad, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

// A list in one card, rows split by hairlines (the one list style).
export const List = ({ children, style }) => (
  <div className="nv-list" style={style}>
    {children}
  </div>
);
// One row: an icon tile, a title, a line under it, and a chevron when it
// opens something. Locked rows show a lock and can't be tapped; `isNew`
// is the "New" tag's text (in the learner's language), shown once.
export function ListRow({ icon, title, sub, onClick, right, locked, isNew, label }) {
  const press = onClick && !locked;
  const Tag = press ? "button" : "div";
  return (
    <Tag onClick={locked ? undefined : onClick} className={`nv-row${press ? " nv-press" : ""}`} aria-label={label}>
      {icon && (
        <span className="nv-ico" style={{ color: locked ? "var(--low)" : "var(--ink)" }}>
          <Icon name={locked ? "lock" : icon} size={20} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, color: locked ? "var(--mid)" : "var(--ink)" }}>
          {title}
          {isNew && <span className="nv-tag" style={{ background: "var(--brandSoft)" }}>{isNew}</span>}
        </span>
        {sub && <span style={{ display: "block", fontSize: "var(--t-sm)", color: "var(--mid)" }}>{sub}</span>}
      </span>
      {right !== undefined ? right : press ? <Icon name="next" size={18} color="var(--low)" /> : null}
    </Tag>
  );
}

// A small label that isn't pressed (a unit, a status): a pill on a quiet fill.
export const Tag = ({ children, style }) => (
  <span className="nv-tag" style={style}>
    {children}
  </span>
);

export function Progress({ value, max = 1, color = "var(--accent)", height = 12, label }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} style={{ height, borderRadius: 999, background: "var(--line)", overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: color, transition: "width var(--m-sheet) ease-out" }} />
    </div>
  );
}

export function Ring({ value, max = 1, size = 56, stroke = 7, color = "var(--accent)", children, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <div role="img" aria-label={label} style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset var(--m-sheet) ease-out" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

// A chip you press to choose (a filter, a pick): the choice is outlined in the text color and shows a check.
export function Chip({ active, onClick, children, style }) {
  return (
    <button className="nv-press nv-chip" onClick={onClick} aria-pressed={!!active} style={{ ...(active ? { ...SELECTED, background: "var(--brandSoft)" } : null), ...style }}>
      {active && <Chosen size={16} />}
      {children}
    </button>
  );
}

// Two to four choices side by side (language, country, a daily goal).
export function Segmented({ options, value, onChange, label, toggle }) {
  return (
    <div role={toggle ? "group" : "radiogroup"} aria-label={label} className="nv-seg">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} {...(toggle ? { "aria-pressed": on } : { role: "radio", "aria-checked": on })} onClick={() => onChange(o.value)} style={on ? SELECTED : undefined}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return <button role="switch" aria-checked={!!checked} aria-label={label} onClick={() => onChange(!checked)} className="nv-switch" />;
}

export function Field({ label, hint, style, ...input }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      {label && <span style={{ display: "block", fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--mid)", marginBottom: 8 }}>{label}</span>}
      <input {...input} className="nv-field" style={style} />
      {hint && <span style={{ display: "block", fontSize: "var(--t-sm)", color: "var(--low)", marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

// Full-screen layers (sheets, the lesson player) render at the top of the
// page, so nothing they're opened from can clip or cover them. While one
// is open, the app behind it is inert: screen readers and the keyboard
// stay in the layer.
let layers = 0;
// `onBack`: what the Back button does while this layer is open (see back.js).
export function Layer({ children, onBack }) {
  const back = useRef(onBack);
  back.current = onBack;
  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.inert = ++layers > 0;
    const release = back.current ? holdBack(() => back.current && back.current()) : null;
    return () => {
      if (root) root.inert = --layers > 0;
      if (release) release();
    };
  }, []);
  return createPortal(children, document.body);
}

// A bottom sheet. Escape or the backdrop closes it.
// `fill`: the sheet takes its full height; the title bar and close button stay put, and the body is a column that decides for itself what scrolls (the tutor's messages).
const closeWord = () => (typeof document !== "undefined" && document.documentElement.lang === "es" ? "Cerrar" : "Close");
export function Sheet({ open, onClose, title, children, tall, fill }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Layer onBack={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="nv-sheetwrap" style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "center", color: "var(--ink)", fontFamily: FONT }}>
        <div onClick={onClose} className="nv-scrim" />
        <div className="nv-sheet" style={{ maxHeight: tall ? "92dvh" : "85dvh", ...(fill ? { height: "92dvh", display: "flex", flexDirection: "column", overflow: "hidden" } : { overflowY: "auto" }) }}>
          <div className="nv-grab" />
          <div className="nv-sheethead">
            <h2 className="nv-disp" style={{ fontSize: "var(--t-title)", margin: 0 }}>{title}</h2>
            <button onClick={onClose} aria-label={closeWord()} className="nv-iconbtn nv-press">
              <Icon name="close" size={20} />
            </button>
          </div>
          {fill ? <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div> : children}
        </div>
      </div>
    </Layer>
  );
}

export function Note({ tone = "info", icon, children, style }) {
  const tones = { info: ["var(--brandSoft)", "var(--ink)"], good: ["var(--goodSoft)", "var(--ink)"], bad: ["var(--badSoft)", "var(--ink)"] };
  const [bg, fg] = tones[tone];
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", background: bg, color: fg, borderRadius: 12, padding: "12px 16px", fontSize: "var(--t-sm)" }}>
      {icon && <span style={{ flexShrink: 0 }}><Icon name={icon} size={18} /></span>}
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

// A screen's title (heading size), with a line under it and anything to its right.
export function Title({ children, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "4px 0 16px" }}>
      <div>
        <h1 className="nv-disp" style={{ fontSize: "var(--t-head)", margin: 0 }}>{children}</h1>
        {sub && <p style={{ color: "var(--mid)", margin: "8px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
export const Label = ({ children, style }) => <h2 style={{ fontSize: "var(--t-lead)", fontWeight: 700, color: "var(--ink)", margin: "24px 0 12px", ...style }}>{children}</h2>;

// THE LOGO — a sail under the north star (docs/design/brand), in one
// color. web/icon.svg, the landing pages and share cards draw the same
// paths. `fill` (0–1) fills the sails from the bottom (the day's XP goal in
// the header); when the goal is met the star turns coral. With `play`,
// tapping it makes the star twinkle (a small easter egg).
export { MARK_PATHS };
export function Mark({ size = 24, color = "var(--head)", fill = 1, play }) {
  const id = `nvm${useId().replace(/[^a-z0-9]/gi, "")}`;
  const [tw, setTw] = useState(0);
  const sails = MARK_PATHS[1] + MARK_PATHS[2];
  const full = fill >= 1;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" onClick={play ? () => setTw((x) => x + 1) : undefined} style={{ display: "block", flexShrink: 0, overflow: "visible", cursor: play ? "pointer" : undefined }}>
      <path key={tw} d={MARK_PATHS[0]} fill={play && full ? "var(--warm)" : color} className={tw ? "nv-twinkle" : undefined} />
      {full ? (
        <path d={sails} fill={color} />
      ) : (
        <>
          <clipPath id={id}>
            <rect x="0" y={74 - 42 * Math.max(0, fill)} width="100" height="100" />
          </clipPath>
          <path d={sails} fill="none" stroke={color} strokeWidth="5" strokeLinejoin="round" />
          <path d={sails} fill={color} clipPath={`url(#${id})`} />
        </>
      )}
      <path d={MARK_PATHS[3]} fill={color} />
    </svg>
  );
}
// The name in the brand serif; with `mark`, the logo before it.
export function Wordmark({ size = 24, mark, fill, play }) {
  const word = <span className={mark ? "nv-word" : undefined} style={{ fontFamily: SERIF, fontWeight: 600, fontSize: size, letterSpacing: -0.3, lineHeight: 1.2, color: "var(--head)" }}>Northvale</span>;
  return mark ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(size * 0.28) }}>
      <Mark size={Math.round(size * 1.15)} fill={fill} play={play} />
      {word}
    </span>
  ) : (
    word
  );
}

// "Beta", beside the wordmark while the app is in its beta. In the header it
// steps aside when there isn't room (a long streak, Spanish, a small phone).
export const BetaTag = ({ label, style }) => (
  <span className="nv-word nv-beta" style={{ fontSize: "var(--t-cap)", fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: "var(--brand)", background: "var(--brandSoft)", borderRadius: 999, padding: "4px 8px", lineHeight: 1.2, ...style }}>
    {label}
  </span>
);

// The streak's north star: a soft coral glow from 7 days, brighter at 30,
// small rays at 100.
const STAR4 = "M12 2L14.7 9.3L22 12L14.7 14.7L12 22L9.3 14.7L2 12L9.3 9.3Z";
export function StreakStar({ count = 0, size = 18, color = "var(--flame)", label }) {
  const g = count >= 100 ? 3 : count >= 30 ? 2 : count >= 7 ? 1 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined} style={{ display: "block", flexShrink: 0, overflow: "visible" }}>
      {g > 0 && <circle cx="12" cy="12" r={6.5 + g * 2.8} fill="var(--warm)" opacity={0.24 + g * 0.12} />}
      {g === 3 && <path d="M3 3l3.5 3.5M21 3l-3.5 3.5M3 21l3.5-3.5M21 21l-3.5-3.5" stroke="var(--warm)" strokeWidth="1.8" strokeLinecap="round" />}
      <path d={STAR4} fill={color} />
    </svg>
  );
}

// Waiting: a small boat bobbing on a wave (still with "reduce motion").
export function Loading({ label, size = 34 }) {
  return (
    <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: 12, color: "var(--mid)", fontSize: "var(--t-body)" }}>
      <svg width={size} height={size * 0.9} viewBox="0 0 100 90" aria-hidden="true" style={{ display: "block", overflow: "visible" }}>
        <g className="nv-bob">
          <path d={MARK_PATHS.join("")} fill="var(--artInk)" />
        </g>
        <path d="M0 92q12-8 25 0t25 0 25 0 25 0" fill="none" stroke="var(--artSea2)" strokeWidth="6" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}

// PICTURES (art.js) — decoration, hidden from screen readers.
const svgArt = (w, h, box, html, style) => <svg width={w} height={h} viewBox={box} aria-hidden="true" style={{ display: "block", flexShrink: 0, ...style }} dangerouslySetInnerHTML={{ __html: html }} />;
export const UnitArt = ({ id, width = 120, style }) => (UNIT_ART[id] ? svgArt(width, Math.round(width * 0.75), "0 0 160 120", UNIT_ART[id], style) : null);
// An achievement's medallion; not yet earned, it's grey.
export function Badge({ id, size = 64, locked }) {
  const cid = `nvb${useId().replace(/[^a-z0-9]/gi, "")}`;
  const [inner, rim = ""] = BADGE_ART[id] || [""];
  return svgArt(size, size, "0 0 96 96", `<defs><clipPath id="${cid}"><circle cx="48" cy="48" r="38"/></clipPath></defs><circle cx="48" cy="48" r="46" fill="var(--artSea)"/><circle cx="48" cy="48" r="38" fill="var(--artPaper)"/><g clip-path="url(#${cid})">${inner}</g>${rim}`, locked ? { filter: "grayscale(1)", opacity: 0.45 } : undefined);
}
// A wide scene (art.js SCENE), drawn at w×h and scaled to the width.
// On a tablet or computer the picture is drawn wider and shorter, so it fits the card instead of being cropped.
export function Scene({ name, w = 358, h = 170, style }) {
  const phone = useLayout() === "phone";
  const sw = phone ? w : 700, sh = phone ? h : Math.min(h, 120);
  return <svg className="nv-scene" viewBox={`0 0 ${sw} ${sh}`} width="100%" aria-hidden="true" preserveAspectRatio="xMidYMax slice" style={{ display: "block", ...style }} dangerouslySetInnerHTML={{ __html: SCENE[name](sw, sh) }} />;
}
// A soft wave edge between a picture and what's under it.
export const WaveEdge = ({ color = "var(--surface)", style }) => (
  <svg viewBox="0 0 390 24" width="100%" height="20" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block", ...style }}>
    <path d={wave(390, 24, 6, 5, 14)} fill={color} />
  </svg>
);

// TOASTS — short notes at the top ("+5 XP", "Saved"). Anyone can call toast(). One shows at a time, under the header; the
// rest wait their turn (three at most, the same words never twice).
const toastListeners = new Set();
export function toast(message, tone = "info") {
  toastListeners.forEach((l) => l({ id: Math.random(), message, tone }));
}
export function Toasts() {
  const [shown, setShown] = useState(null);
  useEffect(() => {
    const queue = [];
    let current = null, timer = 0;
    const next = () => {
      current = queue.shift() || null;
      setShown(current);
      timer = current ? setTimeout(next, 2400) : 0;
    };
    const l = (t) => {
      if (queue.length < 3 && t.message !== (current && current.message) && !queue.some((q) => q.message === t.message)) queue.push(t);
      if (!timer) next();
    };
    toastListeners.add(l);
    return () => (toastListeners.delete(l), clearTimeout(timer));
  }, []);
  // Outside the app's root, so they're still heard while a lesson or sheet is open; they sit under the top bar (a lesson's close, progress and Ask), not on it.
  return createPortal(
    <div aria-live="polite" style={{ position: "fixed", top: "calc(70px + env(safe-area-inset-top))", left: 0, right: 0, zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
      {shown && (
        <div key={shown.id} className="nv-in" style={{ background: "var(--ink)", color: "var(--bg)", borderRadius: 12, padding: "12px 16px", fontWeight: 600, boxShadow: "var(--lift)", maxWidth: "90vw" }}>
          {shown.message}
        </div>
      )}
    </div>,
    document.body,
  );
}

// A line chart for prices and projections: a main line (`points`), more
// lines to compare (`lines`: [{ points, color, dash }]), an optional faint
// band (`band`: [[x, low, high]…]) and dashed reference `markers`. Points
// are spread evenly unless `xDomain` ([from, to]) places them by their x.
// `minSpan` keeps small moves from filling the whole height. Pure SVG.
export function LineChart({ points, lines = [], band, height = 160, color = "var(--brand)", label, markers = [], xDomain, minSpan = 0 }) {
  const all = [...(points ? [{ points, color }] : []), ...lines].filter((l) => l.points && l.points.length > 1);
  if (!all.length) return null;
  const w = 320;
  const vals = [...all.flatMap((l) => l.points.map((p) => p[1])), ...(band ? band.flatMap((b) => [b[1], b[2]]) : []), ...markers.map((m) => m.value)];
  const grow = Math.max(0, minSpan - (Math.max(...vals) - Math.min(...vals))) / 2;
  const min = Math.min(...vals) - grow;
  const max = Math.max(...vals) + grow;
  const pad = (max - min) * 0.08 || 1;
  const y = (v) => height - 6 - ((v - min + pad) / (max - min + pad * 2)) * (height - 12);
  const x = (i, n, p) => (xDomain ? ((p[0] - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) * w : (i / (n - 1)) * w);
  const path = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${x(i, pts.length, p).toFixed(1)},${y(p[1]).toFixed(1)}`).join("");
  const area = band ? `${band.map((b, i) => `${i ? "L" : "M"}${x(i, band.length).toFixed(1)},${y(b[2]).toFixed(1)}`).join("")}${[...band].reverse().map((b, i) => `L${x(band.length - 1 - i, band.length).toFixed(1)},${y(b[1]).toFixed(1)}`).join("")}Z` : null;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={label} style={{ display: "block", overflow: "visible" }}>
      {area && <path d={area} fill={all[0].color} opacity={0.13} />}
      {markers.map((m, i) => (
        <line key={i} x1={0} x2={w} y1={y(m.value)} y2={y(m.value)} stroke={m.color || "var(--low)"} strokeDasharray="4 4" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      ))}
      {all.map((l, i) => (
        <path key={i} d={path(l.points)} fill="none" stroke={l.color} strokeWidth={2.5} strokeDasharray={l.dash === true ? "6 5" : l.dash || undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, display }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--mid)" }}>{label}</span>
        <span style={{ fontSize: "var(--t-lead)", fontWeight: 700 }}>{display ?? value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} style={{ width: "100%", accentColor: "var(--brand)", height: 32 }} />
    </label>
  );
}

export function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", marginTop: 8 }}>
      {items.map((it) => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: "var(--t-sm)", fontWeight: 600, color: "var(--mid)" }}>
          <span style={{ width: 18, height: 0, borderTop: `4px ${it.dash ? "dotted" : "solid"} ${it.color}` }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
