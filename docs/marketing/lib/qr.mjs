// A small QR code maker (byte mode, error correction level M, versions 1 to 6: up to 106 bytes), so the flyer's
// QR code needs no outside library or website. `qrSvg(text)` returns an SVG string. It's checked by decoding
// the image with the Mac's own QR reader (docs/marketing/verify-qr.swift) and by test/marketing.test.mjs.
const LEVELS = [
  // version, data bytes, total codewords, EC codewords per block, blocks, alignment centers
  { v: 1, data: 14, total: 26, ec: 10, blocks: 1, align: [] },
  { v: 2, data: 26, total: 44, ec: 16, blocks: 1, align: [6, 18] },
  { v: 3, data: 42, total: 70, ec: 26, blocks: 1, align: [6, 22] },
  { v: 4, data: 62, total: 100, ec: 18, blocks: 2, align: [6, 26] },
  { v: 5, data: 84, total: 134, ec: 24, blocks: 2, align: [6, 30] },
  { v: 6, data: 106, total: 172, ec: 16, blocks: 4, align: [6, 34] },
];

const mul = (a, b) => {
  let r = 0;
  for (let i = 7; i >= 0; i--) {
    r = (r << 1) ^ ((r >>> 7) * 0x11d);
    r ^= ((b >>> i) & 1) * a;
  }
  return r & 255;
};
const generator = (deg) => {
  const r = new Array(deg).fill(0);
  r[deg - 1] = 1;
  let root = 1;
  for (let i = 0; i < deg; i++) {
    for (let j = 0; j < deg; j++) {
      r[j] = mul(r[j], root);
      if (j + 1 < deg) r[j] ^= r[j + 1];
    }
    root = mul(root, 2);
  }
  return r;
};
const remainder = (data, gen) => {
  const r = new Array(gen.length).fill(0);
  for (const b of data) {
    const f = b ^ r.shift();
    r.push(0);
    gen.forEach((c, i) => (r[i] ^= mul(c, f)));
  }
  return r;
};

export function qrMatrix(text, mask = 0) {
  const bytes = [...new TextEncoder().encode(text)];
  const L = LEVELS.find((x) => x.data >= bytes.length);
  if (!L) throw new Error(`QR: ${bytes.length} bytes is too long (up to 106)`);
  // The bit stream: byte mode, the length, the bytes, a terminator, padding.
  const bits = [];
  const put = (value, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  };
  put(0b0100, 4);
  put(bytes.length, 8);
  bytes.forEach((b) => put(b, 8));
  const cw = L.total - L.ec * L.blocks; // data codewords (the capacity in bytes is two fewer: the mode and the length)
  put(0, Math.min(4, cw * 8 - bits.length));
  while (bits.length % 8) bits.push(0);
  for (let pad = 0xec; bits.length < cw * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  // Blocks, their error-correction words, and the two interleaved.
  const per = cw / L.blocks;
  const gen = generator(L.ec);
  const blocks = Array.from({ length: L.blocks }, (_, i) => data.slice(i * per, (i + 1) * per));
  const eccs = blocks.map((b) => remainder(b, gen));
  const words = [];
  for (let i = 0; i < per; i++) blocks.forEach((b) => words.push(b[i]));
  for (let i = 0; i < L.ec; i++) eccs.forEach((e) => words.push(e[i]));
  // The grid and its fixed patterns.
  const size = 17 + 4 * L.v;
  const m = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => {
    m[y][x] = dark;
    fn[y][x] = true;
  };
  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]])
    for (let dy = -4; dy <= 4; dy++)
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, Math.max(Math.abs(dx), Math.abs(dy)) !== 2 && Math.max(Math.abs(dx), Math.abs(dy)) !== 4);
      }
  for (const cy of L.align)
    for (const cx of L.align) {
      if ((cx === 6 && cy === 6) || (cx === 6 && cy === L.align[L.align.length - 1]) || (cy === 6 && cx === L.align[L.align.length - 1])) continue;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  // The format area is reserved now and filled once the mask is known.
  const format = (mk) => {
    let d = (0 << 3) | mk; // error correction M = 00
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    const bit = (i) => ((b >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i++) set(8, i, bit(i));
    set(8, 7, bit(6));
    set(8, 8, bit(7));
    set(7, 8, bit(8));
    for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  format(0);
  // The data, in two-column strips from the bottom right.
  let k = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++)
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (!fn[y][x] && k < words.length * 8) {
          m[y][x] = ((words[k >>> 3] >>> (7 - (k & 7))) & 1) === 1;
          k++;
        }
      }
  }
  const masks = [(x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x, y) => x % 3 === 0, (x, y) => (x + y) % 3 === 0, (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0, (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0];
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && masks[mask](x, y)) m[y][x] = !m[y][x];
  format(mask);
  return m;
}

// An SVG of the code with the quiet zone around it (4 modules), `scale` pixels per module.
export function qrSvg(text, { scale = 8, dark = "#000", light = "#fff", mask = 0 } = {}) {
  const m = qrMatrix(text, mask);
  const n = m.length + 8;
  let path = "";
  m.forEach((row, y) => row.forEach((on, x) => on && (path += `M${x + 4} ${y + 4}h1v1h-1z`)));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${n * scale}" height="${n * scale}" shape-rendering="crispEdges" role="img" aria-label="QR code: ${text.replace(/"/g, "")}"><rect width="${n}" height="${n}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}
