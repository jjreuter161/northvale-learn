// PICTURES — the sailing style (docs/design/playful): flat shapes in navy,
// cream and sunrise coral, as small SVG. They're decoration only (hidden
// from screen readers; nothing is said only in a picture), and they follow
// Light and Dark through the --art* colors in ui.jsx. No faces, characters,
// anchors or ship's wheels.

// The logo's paths (sail under the north star), for boats in pictures.
export const MARK_PATHS = ["M50 4L53 13L62 16L53 19L50 28L47 19L38 16L47 13Z", "M46 32V74H20Z", "M52 42V74H74Z", "M14 80H86L76 92H24Z"];
const INK = "var(--artInk)", PAPER = "var(--artPaper)", SEA = "var(--artSea)", SEA2 = "var(--artSea2)", SAND = "var(--artSand)", SUN = "var(--artSun)", SUN2 = "var(--artSun2)";

// A four-point star.
export const star = (cx, cy, r, fill = INK) => {
  const k = +(r * 0.27).toFixed(2);
  return `<path d="M${cx} ${cy - r}L${cx + k} ${cy - k}L${cx + r} ${cy}L${cx + k} ${cy + k}L${cx} ${cy + r}L${cx - k} ${cy + k}L${cx - r} ${cy}L${cx - k} ${cy - k}Z" fill="${fill}"/>`;
};
// The logo as a boat, at (x, y), scaled from its 100×100 box.
export const boat = (x, y, s, fill = INK, withStar = true) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="${(withStar ? MARK_PATHS : MARK_PATHS.slice(1)).join("")}" fill="${fill}"/></g>`;
// A row of soft waves from y0 down to h, across w.
export const wave = (w, h, amp, n, y0) => {
  const step = w / n;
  let d = `M0 ${y0}`;
  for (let i = 0; i < n; i++) d += `q${step / 4} ${-amp} ${step / 2} 0t${step / 2} 0`;
  return `${d}V${h}H0Z`;
};
const ripples = (pts) => `<path d="${pts.map(([x, y]) => `M${x} ${y}q8-4 16 0`).join("")}" stroke="${SEA2}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
const sea = (y0, amp = 3.5) => `<path d="${wave(160, 120, amp, 4, y0)}" fill="${SEA}"/>`;
const island = (cx, y, w, fill = SAND) => `<path d="M${cx - w / 2} ${y}c${w * 0.12}-${w * 0.32} ${w * 0.88}-${w * 0.32} ${w} 0Z" fill="${fill}"/>`;
const pennant = (x, y, h = 24) => `<path d="M${x} ${y + h}V${y}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M${x + 1.3} ${y}L${x + 17} ${y + 5}L${x + 1.3} ${y + 10}Z" fill="${SUN}"/>`;

// One small scene per unit, 160×120.
export const UNIT_ART = {
  budget: `<rect x="22" y="16" width="116" height="90" rx="12" fill="${SAND}"/><path d="M61 16v90M100 16v90" stroke="${PAPER}" stroke-width="2.5"/><ellipse cx="48" cy="40" rx="13" ry="7" fill="${SEA2}"/><ellipse cx="96" cy="90" rx="10" ry="5" fill="${SEA2}"/><path d="M38 92C52 86 50 70 66 66S98 58 104 46 114 34 116 32" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 7.5"/><circle cx="38" cy="92" r="5" fill="${INK}"/>${star(118, 30, 11, SUN)}`,
  save: `<circle cx="118" cy="44" r="17" fill="${SUN2}"/>${sea(80)}<rect x="12" y="64" width="78" height="7" rx="3.5" fill="${INK}"/>${[22, 50, 78].map((x) => `<rect x="${x}" y="64" width="6" height="40" rx="3" fill="${INK}"/>`).join("")}<path d="M86 70Q94 80 104 83" stroke="${INK}" stroke-width="1.6" fill="none"/><path d="M100 84H142L136 93H106Z" fill="${INK}"/><path d="M119 46V80H103Z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M124 56V80H137Z" fill="${INK}"/>${ripples([[18, 110], [64, 114], [112, 108]])}`,
  banking: `<circle cx="34" cy="38" r="14" fill="${SUN2}"/>${sea(84)}<path d="M64 52H120V84H64Z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M58 54L92 32L126 54Z" fill="${INK}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><rect x="85" y="64" width="14" height="20" rx="7" fill="${INK}"/><rect x="70" y="62" width="9" height="9" rx="2" fill="${SUN}"/><rect x="105" y="62" width="9" height="9" rx="2" fill="${SUN}"/><rect x="56" y="84" width="72" height="6" rx="3" fill="${INK}"/>${[64, 116].map((x) => `<rect x="${x}" y="84" width="5" height="24" rx="2.5" fill="${INK}"/>`).join("")}${pennant(92, 14, 18)}${ripples([[20, 108], [128, 104]])}`,
  paycheck: `${star(128, 26, 6, SUN)}${sea(86)}<rect x="96" y="70" width="58" height="7" rx="3.5" fill="${INK}"/><rect x="104" y="70" width="5" height="40" rx="2.5" fill="${INK}"/><rect x="140" y="70" width="5" height="40" rx="2.5" fill="${INK}"/><path d="M14 88H82L74 98H22Z" fill="${INK}"/><path d="M48 40V84H24Z" fill="${INK}"/><rect x="54" y="66" width="20" height="18" rx="3" fill="${SUN}"/><path d="M54 72H74M64 66V84" stroke="${PAPER}" stroke-width="2"/><path d="M86 78h8M84 84h6" stroke="${SEA2}" stroke-width="3" stroke-linecap="round"/>${ripples([[30, 110], [70, 114]])}`,
  credit: `<circle cx="80" cy="34" r="15" fill="${SUN2}"/>${sea(84)}${island(30, 86, 50)}${island(130, 86, 50)}<path d="M16 72Q80 30 144 72" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M14 72H146" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>${[42, 62, 80, 98, 118].map((x) => { const y = 72 - (1 - ((x - 80) / 64) ** 2) * 21; return `<path d="M${x} 72V${y.toFixed(1)}" stroke="${INK}" stroke-width="2"/>`; }).join("")}${ripples([[64, 108], [96, 114]])}`,
  scams: `<g class="nv-beam" style="transform-origin:80px 35px"><path d="M80 35L4 16V54Z" fill="${SUN2}" opacity=".75"/><path d="M80 35L156 16V54Z" fill="${SUN2}" opacity=".75"/></g>${sea(94)}<path d="M48 106c4-12 16-16 32-16s28 4 32 16Z" fill="${SEA2}"/><path d="M71 46H89L94 98H66Z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><path d="M69.4 63H90.6L91.8 76H68.2Z" fill="${INK}"/><rect x="77" y="86" width="6" height="12" rx="3" fill="${INK}"/><rect x="68" y="42" width="24" height="5" rx="2.5" fill="${INK}"/><rect x="72.5" y="29" width="15" height="13" rx="2" fill="${SUN}"/><path d="M68 30L80 18L92 30Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  compound: `<circle cx="40" cy="40" r="15" fill="${SUN2}"/><path d="M0 104C40 104 70 96 100 84S140 64 160 60V120H0Z" fill="${SEA}"/><path d="M0 114C50 112 100 102 160 92V120H0Z" fill="${SEA2}"/>${star(30, 92, 3, SUN)}${star(62, 83, 4.5, SUN)}${star(94, 70, 6, SUN)}${boat(118, 38, 0.34)}`,
  taxes: `<circle cx="126" cy="34" r="14" fill="${SUN2}"/>${sea(70)}<path d="M52 120L70 72M108 120L90 72" stroke="${SEA2}" stroke-width="3" stroke-dasharray="0.1 7" stroke-linecap="round"/><path d="M28 94h16l-3-22h-10Z" fill="${SUN}"/><path d="M28 94h16" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M36 72V60" stroke="${INK}" stroke-width="2.5"/>${star(36, 56, 5)}<path d="M116 94h16l-3-22h-10Z" fill="${INK}"/><path d="M124 72V60" stroke="${INK}" stroke-width="2.5"/>${star(124, 56, 5, SUN)}${boat(66, 64, 0.28)}${ripples([[16, 110], [126, 112]])}`,
  insurance: `${sea(90)}<rect x="68" y="20" width="8" height="90" rx="4" fill="${INK}"/><circle cx="72" cy="58" r="26" fill="none" stroke="${PAPER}" stroke-width="13"/><circle cx="72" cy="58" r="26" fill="none" stroke="${SUN}" stroke-width="13" stroke-dasharray="20.4 20.4"/><circle cx="72" cy="58" r="32.5" fill="none" stroke="${INK}" stroke-width="2"/><circle cx="72" cy="58" r="19.5" fill="none" stroke="${INK}" stroke-width="2"/><path d="M60 14q12 8 24 0" stroke="${INK}" stroke-width="2.5" fill="none"/>${boat(116, 70, 0.26)}${ripples([[14, 108], [100, 112]])}`,
  psychology: `<circle cx="112" cy="36" r="16" fill="${SUN2}"/><circle cx="120" cy="30" r="14" fill="var(--artSky)"/>${star(44, 28, 5, SUN)}${star(70, 44, 3, SUN)}${star(28, 54, 3, SUN)}<rect x="0" y="74" width="160" height="46" fill="${SEA}"/><path d="M28 88h40M40 96h20M100 84h30M108 92h14" stroke="${SEA2}" stroke-width="2.5" stroke-linecap="round"/>${boat(60, 44, 0.32, INK, false)}<g opacity=".35" transform="translate(60 104) scale(0.32 -0.32)"><path d="${MARK_PATHS.slice(1, 3).join("")}" fill="${INK}"/></g>`,
  stocks: `<circle cx="132" cy="28" r="12" fill="${SUN2}"/><path d="M0 92C20 92 22 70 40 70S60 96 80 96 100 60 120 60 140 84 160 84V120H0Z" fill="${SEA}"/><path d="M0 104C30 104 50 94 80 104S130 96 160 98V120H0Z" fill="${SEA2}"/>${boat(28, 46, 0.26)}${boat(68, 72, 0.26)}${boat(108, 36, 0.26)}`,
  etf: `<circle cx="34" cy="34" r="14" fill="${SUN2}"/>${sea(84)}${[[96, 30], [76, 44], [116, 44], [56, 58], [96, 58], [136, 58]].map(([x, y]) => boat(x - 11, y, 0.22)).join("")}${ripples([[20, 108], [70, 112], [120, 106]])}`,
  risk: `<path d="M28 44a14 14 0 0126-6 11 11 0 0118 8 9 9 0 01-2 18H32a10 10 0 01-4-20z" fill="${SEA2}"/><path d="M84 40h30M90 50h40M84 60h24" stroke="${SEA2}" stroke-width="3" stroke-linecap="round"/>${sea(86, 5)}<g transform="rotate(-12 96 86)">${boat(78, 50, 0.38, INK, false)}</g>${ripples([[20, 110], [116, 112]])}`,
  crypto: `<path d="M24 34a13 13 0 0124-6 10 10 0 0117 7 9 9 0 01-2 17H28a9 9 0 01-4-18z" fill="${SEA2}"/><path d="M46 52L38 68H48L42 84" stroke="${SUN}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M0 98L22 78 40 96 64 66 88 96 112 74 136 96 160 80V120H0Z" fill="${SEA}" stroke="${SEA}" stroke-width="4" stroke-linejoin="round"/><path d="M0 110L30 98 56 112 84 98 112 112 140 100 160 108V120H0Z" fill="${SEA2}"/>${boat(96, 46, 0.3)}`,
  retire: `<circle cx="102" cy="70" r="22" fill="${SUN2}"/><rect x="0" y="70" width="160" height="50" fill="${SEA}"/><path d="M24 72c6-11 34-11 44 0Z" fill="${INK}"/><path d="M45 66c0-9 2-17 7-24" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 42c-8-4-16-2-20 4M52 42c8-5 16-3 20 2M52 42c-1-6 3-11 9-13M52 42c-4-6-11-8-16-6" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M88 80h24M93 88h14" stroke="${SUN2}" stroke-width="3" stroke-linecap="round"/>${boat(120, 76, 0.3)}`,
  earning: `<circle cx="40" cy="78" r="22" fill="${SUN2}"/><rect x="0" y="78" width="160" height="42" fill="${SEA}"/><path d="M60 96H136L128 106H68Z" fill="${INK}"/><path d="M96 40V92H64Z" fill="${INK}"/><path d="M100 46V92H124Z" fill="${INK}"/><path d="M104 36V92H140Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" opacity=".95"/><path d="M22 100h28M30 108h18" stroke="${SEA2}" stroke-width="3" stroke-linecap="round"/>${star(132, 22, 6, SUN)}`,
  news: `${star(120, 30, 7, SUN)}${star(100, 18, 3, SUN)}${sea(80)}<g transform="rotate(-24 76 78)"><rect x="48" y="66" width="52" height="22" rx="10" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><rect x="98" y="71" width="14" height="12" rx="3" fill="${INK}"/><rect x="58" y="72" width="30" height="10" rx="2" fill="${SAND}"/><path d="M62 77h22" stroke="${INK}" stroke-width="2" stroke-dasharray="3 3"/></g>${ripples([[24, 108], [96, 112], [130, 100]])}`,
  borders: `<circle cx="124" cy="36" r="15" fill="${SUN2}"/>${sea(84)}${island(38, 84, 54)}${island(122, 84, 54)}${pennant(38, 50, 34)}${pennant(122, 50, 34)}<path d="M42 54Q80 8 118 54" stroke="${INK}" stroke-width="3" fill="none" stroke-dasharray="2 8" stroke-linecap="round"/>${boat(62, 60, 0.26)}${ripples([[24, 108], [96, 110], [132, 104]])}`,
};

// LANDMARKS — one island per unit for the sea chart on "Your course"
// (120×96; the island's top is near y=70): a chart house for Budgeting, a
// harbor for Saving, a market for Banking, the lighthouse for Scams…
const lmBase = (x0 = 14, x1 = 106) => `<ellipse cx="${(x0 + x1) / 2}" cy="77" rx="${(x1 - x0) / 2 + 6}" ry="7" fill="${SEA2}" opacity=".45"/><path d="M${x0} 75c${(x1 - x0) * 0.12}-15 ${(x1 - x0) * 0.88}-15 ${x1 - x0} 0Z" fill="${SAND}"/>`;
const lmFlag = (x, y, h, c = SUN) => `<path d="M${x} ${y + h}V${y}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M${x + 1.2} ${y}L${x + 14} ${y + 4.5}L${x + 1.2} ${y + 9}Z" fill="${c}"/>`;

export const LANDMARK = {
  budget: `${lmBase()}<path d="M40 50L59 34L78 50Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><rect x="44" y="49" width="30" height="21" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><rect x="55" y="58" width="8" height="12" fill="${INK}"/><path d="M22 70q8-5 16 0" stroke="${INK}" stroke-width="2" stroke-dasharray="0.1 5" stroke-linecap="round" fill="none"/>${star(88, 34, 7, SUN)}`,
  save: `${lmBase(8, 62)}<rect x="22" y="62" width="62" height="5" rx="2.5" fill="${INK}"/>${[30, 50, 70].map((x) => `<rect x="${x}" y="62" width="4" height="17" rx="2" fill="${INK}"/>`).join("")}<path d="M78 72H110L105 80H83Z" fill="${INK}"/><path d="M94 46V70H80Z" fill="${PAPER}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/><path d="M97 52V70H107Z" fill="${INK}"/>`,
  banking: `${lmBase()}${[28, 62].map((x) => `<rect x="${x}" y="53" width="28" height="18" fill="${PAPER}" stroke="${INK}" stroke-width="2.2"/><path d="M${x - 3} 53h34l-3-9h-28Z" fill="${SUN}"/><path d="M${x + 4} 44v9M${x + 11} 44v9M${x + 18} 44v9M${x + 25} 44v9" stroke="${PAPER}" stroke-width="2"/><rect x="${x + 9}" y="60" width="10" height="11" fill="${INK}"/>`).join("")}`,
  paycheck: `${lmBase()}<rect x="30" y="54" width="17" height="17" fill="${SUN}" stroke="${INK}" stroke-width="2"/><path d="M30 54l17 17M47 54l-17 17" stroke="${INK}" stroke-width="1.6"/><rect x="47" y="59" width="14" height="12" fill="${PAPER}" stroke="${INK}" stroke-width="2"/><path d="M78 72V30H100" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M96 30v14" stroke="${INK}" stroke-width="1.6"/><rect x="91" y="44" width="10" height="8" fill="${SUN}" stroke="${INK}" stroke-width="1.6"/>`,
  credit: `<ellipse cx="60" cy="78" rx="56" ry="7" fill="${SEA2}" opacity=".45"/><path d="M6 76c4-14 34-14 40 0Z" fill="${SAND}"/><path d="M74 76c4-14 36-14 40 0Z" fill="${SAND}"/><path d="M28 64Q60 34 92 64" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M24 62H96" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>${[40, 50, 60, 70, 80].map((x) => `<path d="M${x} 62V${(64 - (1 - ((x - 60) / 32) ** 2) * 22).toFixed(1)}" stroke="${INK}" stroke-width="1.6"/>`).join("")}`,
  scams: `${lmBase(30, 92)}<g class="nv-beam" style="transform-origin:60px 32px"><path d="M60 32L8 18V46Z" fill="${SUN2}" opacity=".7"/><path d="M60 32L112 18V46Z" fill="${SUN2}" opacity=".7"/></g><path d="M53 40H67L71 72H49Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M51.6 51H68.4L69.4 60H50.6Z" fill="${INK}"/><rect x="54.5" y="27" width="11" height="10" rx="1.5" fill="${SUN}"/><path d="M51 28L60 19L69 28Z" fill="${INK}"/><rect x="51" y="37" width="18" height="4" rx="2" fill="${INK}"/>`,
  compound: `${lmBase()}<path d="M30 70h60v-8H30Z" fill="${SEA2}"/><path d="M38 62h44v-8H38Z" fill="${SAND}" stroke="${INK}" stroke-width="1.6"/><path d="M46 54h28v-8H46Z" fill="${SEA2}"/><path d="M60 46V24" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><circle cx="60" cy="22" r="9" fill="${SEA2}"/>${[[54, 20], [64, 17], [61, 27]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${SUN}"/>`).join("")}`,
  taxes: `${lmBase(26, 94)}<rect x="53" y="34" width="14" height="38" fill="${PAPER}" stroke="${INK}" stroke-width="2.4"/><rect x="56" y="42" width="8" height="7" fill="${SUN}"/><path d="M51 34h18" stroke="${INK}" stroke-width="3"/>${lmFlag(60, 14, 20)}${[[14, 80], [104, 80]].map(([x, y]) => `<path d="M${x - 5} ${y}h10l-2-10h-6Z" fill="${SUN}"/><path d="M${x} ${y - 10}v-5" stroke="${INK}" stroke-width="1.6"/>`).join("")}`,
  insurance: `${lmBase(26, 94)}<rect x="57" y="30" width="6" height="42" rx="3" fill="${INK}"/><circle cx="60" cy="48" r="13" fill="none" stroke="${PAPER}" stroke-width="7"/><circle cx="60" cy="48" r="13" fill="none" stroke="${SUN}" stroke-width="7" stroke-dasharray="10.2 10.2"/><circle cx="60" cy="48" r="16.5" fill="none" stroke="${INK}" stroke-width="1.4"/><circle cx="60" cy="48" r="9.5" fill="none" stroke="${INK}" stroke-width="1.4"/>`,
  psychology: `${lmBase()}<path d="M86 12a11 11 0 1 0 0 22a8 8 0 1 1 0-22Z" fill="${SUN2}"/>${star(30, 20, 3.5, SUN)}${star(46, 30, 2.5, SUN)}<path d="M56 70V46" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><circle cx="56" cy="40" r="12" fill="${INK}"/><circle cx="64" cy="48" r="8" fill="${INK}"/>`,
  stocks: `${lmBase()}${lmFlag(36, 44, 26, PAPER)}${lmFlag(56, 30, 40, SUN)}${lmFlag(76, 38, 32, SEA2)}`,
  etf: `${lmBase(30, 90)}<path d="M50 70V50" stroke="${INK}" stroke-width="2.4"/><circle cx="50" cy="46" r="6" fill="${SEA2}"/>${[[6, 60], [86, 58], [16, 38], [80, 36]].map(([x, y]) => boat(x, y, 0.2)).join("")}`,
  risk: `${lmBase()}<path d="M30 30a12 12 0 0122-6 10 10 0 0116 7 8 8 0 01-2 15H34a8 8 0 01-4-16z" fill="${SEA2}"/><path d="M38 52l-3 8M50 52l-3 8M62 52l-3 8" stroke="${SEA2}" stroke-width="2.4" stroke-linecap="round"/><g transform="rotate(-10 84 66)">${boat(72, 42, 0.26, INK, false)}</g>`,
  crypto: `<ellipse cx="60" cy="77" rx="50" ry="7" fill="${SEA2}" opacity=".45"/><path d="M18 76L34 44L46 58L60 28L72 54L84 40L102 76Z" fill="${INK}"/><path d="M64 4L56 20H64L58 34" stroke="${SUN}" stroke-width="3.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  retire: `<circle cx="78" cy="70" r="20" fill="${SUN2}"/>${lmBase(14, 96)}<path d="M44 70c0-12 3-24 9-32" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M53 38c-9-4-17-2-21 5M53 38c9-5 17-3 21 3M53 38c-1-7 3-12 10-14M53 38c-5-6-12-8-17-6" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  earning: `${lmBase()}<path d="M54 72L57 38H67L70 72Z" fill="${PAPER}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><rect x="58" y="60" width="8" height="12" fill="${INK}"/><g transform="translate(62 36)">${[0, 90, 180, 270].map((a) => `<g transform="rotate(${a + 20})"><rect x="-2" y="-24" width="4" height="22" fill="${INK}"/><rect x="2" y="-24" width="7" height="14" fill="${SUN}"/></g>`).join("")}<circle r="3.4" fill="${INK}"/></g>`,
  news: `${lmBase()}<path d="M60 72V18" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M46 28H74" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M48 28v8" stroke="${INK}" stroke-width="1.2"/><rect x="42" y="36" width="12" height="10" fill="${SUN}"/><path d="M72 28v8" stroke="${INK}" stroke-width="1.2"/><rect x="66" y="36" width="12" height="10" fill="${PAPER}" stroke="${INK}" stroke-width="1.6"/><rect x="54" y="50" width="12" height="10" fill="${SEA2}"/>`,
  borders: `${lmBase()}${lmFlag(32, 40, 32, PAPER)}${lmFlag(88, 40, 32, SUN)}<path d="M34 44Q60 12 90 44" stroke="${INK}" stroke-width="2.4" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>${star(60, 22, 4, SUN)}`,
};

// Scenes for empty screens, Welcome and the end of the course (wide).
export const SCENE = {
  harbor: (w = 358, h = 170) => `<rect width="${w}" height="${h}" fill="var(--artSky)"/><circle cx="${w * 0.31}" cy="${h * 0.36}" r="${h * 0.14}" fill="${SUN2}"/>${star(w * 0.77, h * 0.24, 6, SUN)}<path d="${wave(w, h, 5, 5, h * 0.7)}" fill="${SEA}"/>${boat(w / 2 - 38, h * 0.32, 0.74)}<path d="${wave(w, h, 4, 6, h * 0.86)}" fill="${SEA2}" opacity=".7"/>`,
  welcome: (w = 390, h = 300) => `<rect width="${w}" height="${h}" fill="var(--artSky)"/><circle cx="${w * 0.72}" cy="${h * 0.48}" r="44" fill="${SUN2}"/>${star(w * 0.22, h * 0.22, 6, SUN)}${star(w * 0.3, h * 0.14, 3.5, SUN)}<path d="${wave(w, h, 7, 4, h * 0.66)}" fill="${SEA}"/>${boat(w / 2 - 70, h * 0.27, 1.2)}<path d="${wave(w, h, 6, 5, h * 0.78)}" fill="${SEA2}" opacity=".75"/><path d="${wave(w, h, 8, 3, h * 0.94)}" fill="var(--bg)"/>`,
  open: (w = 358, h = 220) => `<rect width="${w}" height="${h}" fill="var(--artSky)"/>${star(w / 2, 40, 14, SUN)}${star(w * 0.3, 70, 4, SUN)}${star(w * 0.72, 76, 5, SUN)}<circle cx="${w / 2}" cy="${h * 0.66}" r="52" fill="${SUN2}"/><rect x="0" y="${h * 0.66}" width="${w}" height="${h}" fill="${SEA}"/><path d="M${w / 2 - 34} ${h * 0.71}h68M${w / 2 - 20} ${h * 0.78}h40" stroke="${SUN2}" stroke-width="5" stroke-linecap="round"/>${boat(w * 0.16, h * 0.5, 0.52)}`,
};

// ACHIEVEMENTS — round medallions, 96×96: [inside the r=38 circle, on the rim].
const arc = (pct) => {
  const c = 2 * Math.PI * 43;
  return `<circle cx="48" cy="48" r="43" fill="none" stroke="${SUN}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(c * pct).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 48 48)"/>`;
};
const dots = (n, cx = 48, cy = 44, r = 27) =>
  Array.from({ length: n }, (_, i) => {
    const a = Math.PI * (0.18 + (0.64 * i) / Math.max(1, n - 1));
    return `<circle cx="${(cx - r * Math.cos(a)).toFixed(1)}" cy="${(cy + r * Math.sin(a)).toFixed(1)}" r="2.8" fill="${SUN}"/>`;
  }).join("");
const waterline = (y = 62) => `<rect x="0" y="${y}" width="96" height="${96 - y}" fill="${SEA}"/>`;
const flagIsland = `${waterline(62)}<path d="M20 66c6-15 50-15 56 0Z" fill="${SAND}"/>${pennant(48, 26, 32)}`;
export const BADGE_ART = {
  first_lesson: [`<circle cx="61" cy="40" r="13" fill="${SUN2}"/>${boat(24, 22, 0.5)}`],
  perfect: [`<circle cx="48" cy="46" r="22" fill="${SUN2}" opacity=".7"/>${star(48, 46, 20)}${[0, 90, 180, 270].map((a) => { const r = (a * Math.PI) / 180 + Math.PI / 4; return `<path d="M${48 + 22 * Math.cos(r)} ${46 + 22 * Math.sin(r)}L${48 + 30 * Math.cos(r)} ${46 + 30 * Math.sin(r)}" stroke="${SUN}" stroke-width="3" stroke-linecap="round"/>`; }).join("")}`],
  streak_3: [`${star(48, 40, 15)}${dots(3)}`],
  streak_7: [`<circle cx="48" cy="40" r="20" fill="${SUN2}" opacity=".75"/>${star(48, 40, 17)}${dots(7)}`],
  streak_30: [`<circle cx="40" cy="44" r="20" fill="${SUN2}"/><circle cx="50" cy="38" r="17" fill="${PAPER}"/>${star(62, 54, 12)}${star(30, 26, 4, SUN)}${star(70, 26, 3, SUN)}`],
  unit: [flagIsland],
  path: [`<circle cx="48" cy="62" r="18" fill="${SUN2}"/>${waterline(62)}${boat(30, 26, 0.36)}<path d="M28 72h40M38 80h20" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`],
  first_trade: [`${waterline(70)}<path d="M18 62L36 50 50 56 76 30" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="76" cy="30" r="5" fill="${SUN}"/>${boat(30, 52, 0.24)}`],
  diversified: [`${waterline(66)}${boat(16, 36, 0.3)}${boat(36, 26, 0.3, SUN, false)}${boat(56, 38, 0.3)}`],
  goal_setter: [`<circle cx="48" cy="60" r="17" fill="${SUN2}"/>${waterline(60)}${star(48, 30, 10)}<path d="M32 70h32M40 78h16" stroke="${PAPER}" stroke-width="3" stroke-linecap="round" opacity=".8"/>`],
  news_5: [`${waterline(66)}<g transform="rotate(-24 48 56)"><rect x="24" y="46" width="44" height="18" rx="9" fill="${PAPER}" stroke="${INK}" stroke-width="3"/><rect x="66" y="50" width="11" height="10" rx="3" fill="${INK}"/><rect x="32" y="51" width="26" height="8" rx="2" fill="${SAND}"/></g>${star(68, 24, 6, SUN)}`],
  curious: [`<g transform="rotate(-28 48 48)"><rect x="16" y="40" width="24" height="17" rx="4" fill="${INK}"/><rect x="39" y="42" width="21" height="13" rx="3" fill="${SUN}"/><rect x="59" y="44" width="18" height="9" rx="2.5" fill="${INK}"/></g>${star(70, 26, 6, SUN)}`],
  level_5: [`${[0, 1, 2, 3, 4].map((i) => star(22 + i * 13, 58 - [0, 9, 14, 9, 0][i] * 1.4 - i * 3, 5 + i * 1.2, i === 4 ? SUN : INK)).join("")}`],
  mission_1: [`${waterline(68)}${pennant(40, 24, 42)}<path d="M30 68H50" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`],
  mission_5: [`${waterline(68)}${pennant(32, 24, 42)}${pennant(56, 34, 32)}${dots(5, 48, 52, 30)}`],
  mission_weeks_4: [`${waterline(70)}${[22, 38, 54, 70].map((x, i) => pennant(x - 4, 40 - i * 4, 28 + i * 4)).join("")}`],
  ms_25: [flagIsland, arc(0.25)],
  ms_50: [flagIsland, arc(0.5)],
  ms_75: [flagIsland, arc(0.75)],
  ms_100: [`${waterline(62)}<path d="M20 66c6-15 50-15 56 0Z" fill="${SAND}"/>${star(48, 34, 14, SUN)}`, arc(1)],
};
