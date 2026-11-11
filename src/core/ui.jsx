// DESIGN SYSTEM — the look (navy and cream, Light and Dark) as CSS variables,
// and the small set of pieces every module builds with. Phone first: 44pt
// tap targets, 16px inputs (so iPhones don't zoom), one column.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Navy and cream. Light: a soft cream page, lighter cream cards, deep navy
// for headings, the main button, progress, the active tab, links and the
// logo, and dark grey-navy body text. Dark: a deep navy page with cream
// text and cream accents. Green (--right) is only for a correct answer in
// a lesson; amber only for "not quite" or "behind"; red only for a loss or
// an error. One card style: a fill, no border, no shadow. Every text pair
// meets WCAG AA (test/look.test.mjs checks). The saved names stay "white"
// (Light) and "navy" (Dark), so nobody's setting changes.
export const LOOKS = {
  white: {
    "--bg": "#F7F2E8",
    "--surface": "#FFFDF8",
    "--surface2": "#EFE7D8",
    "--ink": "#22303F",
    "--head": "#13315C",
    "--mid": "#4C5866",
    "--low": "#5C6573",
    "--line": "#E6DCCB",
    "--brand": "#13315C",
    "--onBrand": "#FFFDF8",
    "--brandSoft": "#E3E7EE",
    "--accent": "#13315C",
    "--accentSoft": "#E3E7EE",
    "--good": "#13315C",
    "--goodSoft": "#E3E7EE",
    "--right": "#1B6F54",
    "--rightSoft": "#E1EFE6",
    "--warn": "#8C520E",
    "--warnSoft": "#F7E9D2",
    "--bad": "#A8231A",
    "--badSoft": "#F9E7E2",
    "--flame": "#13315C",
    "--gold": "#13315C",
    "--sky": "#13315C",
    "--level1": "#CBD3E0",
    "--level2": "#6F89B3",
    "--level3": "#13315C",
    "--focus": "#2B5CB3",
    "--shadow": "none",
  },
  navy: {
    "--bg": "#0D1A2D",
    "--surface": "#15253C",
    "--surface2": "#1F3150",
    "--ink": "#F2EBDC",
    "--head": "#F7F1E6",
    "--mid": "#CFC7B7",
    "--low": "#B3AC9E",
    "--line": "#2A3C58",
    "--brand": "#F0E3C6",
    "--onBrand": "#0D1A2D",
    "--brandSoft": "#24344F",
    "--accent": "#F0E3C6",
    "--accentSoft": "#24344F",
    "--good": "#F0E3C6",
    "--goodSoft": "#24344F",
    "--right": "#63C9A2",
    "--rightSoft": "#123A33",
    "--warn": "#EBB663",
    "--warnSoft": "#3A2E19",
    "--bad": "#F4907F",
    "--badSoft": "#3B2224",
    "--flame": "#F0E3C6",
    "--gold": "#F0E3C6",
    "--sky": "#F0E3C6",
    "--level1": "#2E4568",
    "--level2": "#7F9CC9",
    "--level3": "#F0E3C6",
    "--focus": "#A9C4F0",
    "--shadow": "none",
  },
};

// Profile colors (the avatar is the nickname's first letter on one).
export const AVATARS = ["#3D5A80", "#2B5CB3", "#1E7A5F", "#7A5C2E", "#5B4B8A", "#8A3B4B"];

export const FONT = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";
export const SERIF = "'EB Garamond', Georgia, serif";

export const GLOBAL_CSS = `
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg)}
html{scroll-padding-top:calc(64px + env(safe-area-inset-top));scroll-padding-bottom:calc(84px + env(safe-area-inset-bottom))}
body{font-family:${FONT};color:var(--ink);-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-feature-settings:'cv11','ss01';font-variant-numeric:tabular-nums}
button{font-family:inherit}
input,select,textarea{font-family:inherit;font-size:16px}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
h1,h2{color:var(--head)}
.nv-press{transition:transform .15s cubic-bezier(.2,.7,.2,1),filter .15s;-webkit-tap-highlight-color:transparent}
.nv-press:active{transform:scale(.98);filter:brightness(.97)}
.nv-in{animation:nvIn .2s ease-out both}
.nv-pop{animation:nvIn .2s ease-out both}
.nv-pulse{animation:nvPulse 1.2s ease-in-out infinite}
@keyframes nvIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@keyframes nvPulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes nvSheet{from{transform:translateY(100%)}to{transform:none}}
@keyframes nvFade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion: reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
.nv-reduce *{animation-duration:.01ms!important;transition-duration:.01ms!important}
.nv-list>*+*{border-top:1px solid var(--line)}
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
  if (name === "flame")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={!label} aria-label={label} role={label ? "img" : undefined}>
        <path d="M12 2c1 4 6 6 6 12a6 6 0 01-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z" fill={color} />
        <path d="M12 13c1.5 1.5 3 2.5 3 4.5a3 3 0 01-6 0c0-1.3.8-2.3 1.5-3 .2 1 .8 1.5 1.5 1.5 0-1 0-2 0-3z" fill="#fff" opacity={0.35} />
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

const BUTTON = {
  primary: { background: "var(--brand)", color: "var(--onBrand)" },
  good: { background: "var(--good)", color: "var(--onBrand)" },
  bad: { background: "var(--bad)", color: "var(--onBrand)" },
  secondary: { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line)" },
  ghost: { background: "transparent", color: "var(--brand)", boxShadow: "none" },
};
export function Button({ kind = "primary", size = "lg", full, disabled, onClick, children, style, type = "button", ...rest }) {
  const pad = size === "lg" ? "16px 22px" : size === "md" ? "11px 18px" : "8px 14px";
  return (
    <button
      type={type}
      className="nv-press"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ border: "none", borderRadius: 14, padding: pad, minHeight: size === "sm" ? 36 : size === "lg" ? 52 : 44, fontSize: size === "lg" ? 17 : 15, fontWeight: 700, letterSpacing: -0.1, cursor: disabled ? "default" : "pointer", width: full ? "100%" : undefined, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: disabled ? 0.45 : 1, ...BUTTON[kind], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Card({ children, style, onClick, pad = 18, ...rest }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={onClick ? "nv-press" : undefined} onClick={onClick} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--surface)", border: "none", borderRadius: 18, padding: pad, color: "var(--ink)", font: "inherit", cursor: onClick ? "pointer" : undefined, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

// A list in one card, rows split by hairlines (the one list style).
export const List = ({ children, style }) => (
  <div className="nv-list" style={{ background: "var(--surface)", borderRadius: 18, overflow: "hidden", ...style }}>
    {children}
  </div>
);
// One row: an icon tile, a title, a line under it, and a chevron when it
// opens something. Locked rows show a lock and can't be tapped; `isNew`
// is the "New" tag's text (in the learner's language), shown once.
export function ListRow({ icon, title, sub, onClick, right, locked, isNew, label }) {
  const Tag = onClick && !locked ? "button" : "div";
  return (
    <Tag onClick={locked ? undefined : onClick} className={onClick && !locked ? "nv-press" : undefined} aria-label={label} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: "none", background: "transparent", color: "var(--ink)", padding: "13px 16px", minHeight: 60, font: "inherit", cursor: onClick && !locked ? "pointer" : "default" }}>
      {icon && (
        <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg)", color: locked ? "var(--low)" : "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name={locked ? "lock" : icon} size={19} />
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 650, fontSize: 16, color: locked ? "var(--mid)" : "var(--ink)" }}>
          {title}
          {isNew && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand)", background: "var(--brandSoft)", borderRadius: 8, padding: "2px 7px" }}>{isNew}</span>}
        </span>
        {sub && <span style={{ display: "block", fontSize: 14, color: "var(--mid)", marginTop: 1, lineHeight: 1.4 }}>{sub}</span>}
      </span>
      {right !== undefined ? right : onClick && !locked ? <Icon name="next" size={18} color="var(--low)" /> : null}
    </Tag>
  );
}

export function Progress({ value, max = 1, color = "var(--accent)", height = 12, label }) {
  const pct = Math.max(0, Math.min(1, max ? value / max : 0)) * 100;
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)} style={{ height, borderRadius: height, background: "var(--surface2)", overflow: "hidden", flex: 1 }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: height, background: color, transition: "width .6s cubic-bezier(.2,.7,.2,1)" }} />
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
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface2)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

export function Chip({ active, onClick, children, style }) {
  return (
    <button className="nv-press" onClick={onClick} aria-pressed={!!active} style={{ border: active ? "1px solid var(--brand)" : "1px solid transparent", background: active ? "var(--brandSoft)" : "var(--surface)", color: "var(--ink)", borderRadius: 999, padding: "8px 14px", minHeight: 40, fontSize: 15, fontWeight: 650, cursor: "pointer", ...style }}>
      {children}
    </button>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", background: "var(--surface)", borderRadius: 14, padding: 4, gap: 4 }}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} style={{ flex: 1, border: "none", borderRadius: 11, padding: "9px 8px", minHeight: 40, fontSize: 14, fontWeight: 650, cursor: "pointer", background: value === o.value ? "var(--bg)" : "transparent", color: value === o.value ? "var(--ink)" : "var(--mid)", boxShadow: value === o.value ? "0 1px 2px rgba(0,0,0,.08)" : "none" }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({ checked, onChange, label }) {
  return (
    <button role="switch" aria-checked={!!checked} aria-label={label} onClick={() => onChange(!checked)} style={{ width: 52, height: 32, borderRadius: 16, border: "none", background: checked ? "var(--brand)" : "var(--surface2)", position: "relative", cursor: "pointer", flexShrink: 0, transition: "background .2s" }}>
      <span style={{ position: "absolute", top: 3, left: checked ? 23 : 3, width: 26, height: 26, borderRadius: 13, background: checked ? "var(--onBrand)" : "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.3)", transition: "left .2s" }} />
    </button>
  );
}

export function Field({ label, hint, style, ...input }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      {label && <span style={{ display: "block", fontSize: 14, fontWeight: 650, color: "var(--mid)", marginBottom: 6 }}>{label}</span>}
      <input {...input} style={{ width: "100%", border: "1px solid var(--line)", borderRadius: 12, background: "var(--bg)", color: "var(--ink)", padding: "13px 14px", fontSize: 16, outline: "none", ...style }} />
      {hint && <span style={{ display: "block", fontSize: 13, color: "var(--low)", marginTop: 5 }}>{hint}</span>}
    </label>
  );
}

// Full-screen layers (sheets, the lesson player) render at the top of the
// page, so nothing they're opened from can clip or cover them.
export const Layer = ({ children }) => createPortal(children, document.body);

// A bottom sheet. Escape or the backdrop closes it.
export function Sheet({ open, onClose, title, children, tall }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <Layer>
    <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", color: "var(--ink)", fontFamily: FONT }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(5,12,25,.45)", animation: "nvFade .2s both" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: tall ? "92dvh" : "85dvh", overflowY: "auto", background: "var(--bg)", borderRadius: "24px 24px 0 0", padding: "10px 18px calc(22px + env(safe-area-inset-bottom))", animation: "nvSheet .3s cubic-bezier(.2,.7,.2,1) both" }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: "var(--line)", margin: "0 auto 10px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 750, margin: 0 }}>{title}</h2>
          <button onClick={onClose} aria-label="Close" style={{ border: "none", background: "var(--surface2)", borderRadius: 20, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink)" }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
    </Layer>
  );
}

export function Note({ tone = "info", icon, children, style }) {
  const tones = { info: ["var(--brandSoft)", "var(--ink)"], good: ["var(--goodSoft)", "var(--ink)"], bad: ["var(--badSoft)", "var(--ink)"] };
  const [bg, fg] = tones[tone];
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", background: bg, color: fg, borderRadius: 16, padding: "12px 14px", fontSize: 14, lineHeight: 1.45, ...style }}>
      {icon && <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name={icon} size={18} /></span>}
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

export function Title({ children, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, margin: "4px 0 16px" }}>
      <div>
        <h1 style={{ fontSize: 30, fontWeight: 750, letterSpacing: -0.6, margin: 0, lineHeight: 1.15 }}>{children}</h1>
        {sub && <p style={{ fontSize: 15, color: "var(--mid)", margin: "6px 0 0", lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}
export const Label = ({ children, style }) => <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.2, color: "var(--ink)", margin: "28px 0 10px", ...style }}>{children}</h2>;

export function Wordmark({ size = 24 }) {
  return <span style={{ fontFamily: SERIF, fontWeight: 650, fontSize: size, letterSpacing: -0.3, lineHeight: 1, color: "var(--head)" }}>Northvale</span>;
}

// TOASTS — short notes at the top ("+5 XP", "Saved"). Anyone can call toast().
const toastListeners = new Set();
export function toast(message, tone = "info") {
  toastListeners.forEach((l) => l({ id: Math.random(), message, tone }));
}
export function Toasts() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const l = (t) => {
      setItems((x) => [...x.slice(-2), t]);
      setTimeout(() => setItems((x) => x.filter((y) => y.id !== t.id)), 2600);
    };
    toastListeners.add(l);
    return () => toastListeners.delete(l);
  }, []);
  return (
    <div aria-live="polite" style={{ position: "fixed", top: "calc(10px + env(safe-area-inset-top))", left: 0, right: 0, zIndex: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, pointerEvents: "none" }}>
      {items.map((t) => (
        <div key={t.id} className="nv-in" style={{ background: t.tone === "good" ? "var(--brand)" : t.tone === "bad" ? "var(--bad)" : "var(--ink)", color: t.tone === "good" || t.tone === "bad" ? "var(--onBrand)" : "var(--bg)", borderRadius: 999, padding: "10px 18px", fontWeight: 650, fontSize: 15, boxShadow: "var(--shadow)", maxWidth: "90vw" }}>
          {t.message}
        </div>
      ))}
    </div>
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
        <path key={i} d={path(l.points)} fill="none" stroke={l.color} strokeWidth={2.5} strokeDasharray={l.dash ? "6 5" : undefined} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </svg>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, display }) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)" }}>{label}</span>
        <span style={{ fontSize: 17, fontWeight: 750 }}>{display ?? value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} style={{ width: "100%", accentColor: "var(--brand)", height: 32 }} />
    </label>
  );
}

export function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
      {items.map((it) => (
        <span key={it.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 650, color: "var(--mid)" }}>
          <span style={{ width: 14, height: 4, borderRadius: 2, background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
