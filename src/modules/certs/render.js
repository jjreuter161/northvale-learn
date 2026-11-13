// DRAWING A CERTIFICATE — an image (PNG) and a one-page PDF, made on the
// device from the text it's given. Loaded when someone opens a certificate, so
// it isn't part of starting the app.
import { FONT, SERIF, MARK_PATHS } from "../../core/ui.jsx";

export const CERT_W = 1600;
export const CERT_H = 1131; // A4 landscape

// Words onto lines no wider than `width`.
function wrap(ctx, text, width) {
  const lines = [];
  for (const word of String(text).split(/\s+/)) {
    const last = lines[lines.length - 1];
    if (last && ctx.measureText(`${last} ${word}`).width <= width) lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}
// The biggest size (down to `min`) at which `text` fits on one line.
function fit(ctx, text, width, size, min, weight, family) {
  for (let s = size; s >= min; s -= 4) {
    ctx.font = `${weight} ${s}px ${family}`;
    if (ctx.measureText(text).width <= width) return s;
  }
  ctx.font = `${weight} ${min}px ${family}`;
  return min;
}

// The look's colors, read from the page: the certificate is drawn in the colors you chose.
const cv = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

// lines: { heading, certifies, name (or null), finished, title, issued, code, verify, fine }
export async function drawCertificate(lines, type = "image/png", quality = 0.92) {
  await (document.fonts && document.fonts.ready).catch(() => {});
  const c = document.createElement("canvas");
  c.width = CERT_W;
  c.height = CERT_H;
  const x = c.getContext("2d");
  const NAVY = cv("--ink", "#1B3560"); // the text color
  const CREAM = cv("--bg", "#F7F2E8"); // the paper
  const SAND = cv("--line", "#E3CFA4"); // the quiet rules
  x.fillStyle = CREAM;
  x.fillRect(0, 0, CERT_W, CERT_H);
  x.strokeStyle = NAVY;
  x.lineWidth = 10;
  x.strokeRect(46, 46, CERT_W - 92, CERT_H - 92);
  x.strokeStyle = SAND;
  x.lineWidth = 3;
  x.strokeRect(70, 70, CERT_W - 140, CERT_H - 140);
  x.textAlign = "center";
  x.textBaseline = "alphabetic";
  // The logo, centered.
  x.fillStyle = NAVY;
  x.save();
  x.translate(CERT_W / 2 - 46, 96);
  x.scale(0.92, 0.92);
  for (const d of MARK_PATHS) x.fill(new Path2D(d));
  x.restore();
  x.font = `650 44px ${SERIF}`;
  x.fillText("Northvale Learn", CERT_W / 2, 222);
  x.font = `650 26px ${FONT}`;
  x.globalAlpha = 0.7;
  x.fillText(lines.heading.toUpperCase().split("").join(" "), CERT_W / 2, 292);
  x.globalAlpha = 1;
  let y = 372;
  if (lines.name) {
    x.font = `500 34px ${FONT}`;
    x.globalAlpha = 0.8;
    x.fillText(lines.certifies, CERT_W / 2, y);
    x.globalAlpha = 1;
    fit(x, lines.name, CERT_W - 360, 104, 52, 700, SERIF);
    y += 110;
    x.fillText(lines.name, CERT_W / 2, y);
    x.fillStyle = SAND;
    x.fillRect(CERT_W / 2 - 220, y + 26, 440, 6);
    x.fillStyle = NAVY;
    y += 100;
  } else {
    y += 40;
  }
  x.font = `500 34px ${FONT}`;
  x.globalAlpha = 0.8;
  x.fillText(lines.finished, CERT_W / 2, y);
  x.globalAlpha = 1;
  y += 40;
  const size = fit(x, lines.title, CERT_W - 300, 84, 52, 700, SERIF);
  let t = wrap(x, lines.title, CERT_W - 300).slice(0, 2);
  for (const l of t) (x.fillText(l, CERT_W / 2, y + size), (y += size + 14));
  y += 44;
  x.font = `500 32px ${FONT}`;
  x.fillText(lines.issued, CERT_W / 2, Math.max(y, 820));
  x.font = `650 30px ${FONT}`;
  x.fillText(lines.code, CERT_W / 2, Math.max(y, 820) + 56);
  x.font = `500 26px ${FONT}`;
  x.globalAlpha = 0.75;
  x.fillText(lines.verify, CERT_W / 2, Math.max(y, 820) + 100);
  x.font = `500 22px ${FONT}`;
  x.globalAlpha = 0.6;
  for (const [i, l] of wrap(x, lines.fine, CERT_W - 360).slice(0, 2).entries()) x.fillText(l, CERT_W / 2, CERT_H - 126 + i * 30);
  return new Promise((ok) => c.toBlob(ok, type, quality));
}

// A one-page PDF around a JPEG (bytes), sized to the image's proportions.
export function pdfFromJpeg(jpeg, w, h) {
  const enc = (s) => new TextEncoder().encode(s);
  const W = 842;
  const H = Math.round((W * h) / w);
  const parts = [];
  const offsets = [];
  let at = 0;
  const push = (u8) => (parts.push(u8), (at += u8.length));
  const obj = (n, dict, stream) => {
    offsets[n] = at;
    push(enc(`${n} 0 obj\n${dict}\n`));
    if (stream) (push(enc("stream\n")), push(stream), push(enc("\nendstream\n")));
    push(enc("endobj\n"));
  };
  push(enc("%PDF-1.4\n"));
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>`, jpeg);
  const content = enc(`q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`);
  obj(5, `<< /Length ${content.length} >>`, content);
  const xref = at;
  push(enc(`xref\n0 6\n0000000000 65535 f \n${[1, 2, 3, 4, 5].map((n) => `${String(offsets[n]).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`));
  const out = new Uint8Array(at);
  let p = 0;
  for (const part of parts) (out.set(part, p), (p += part.length));
  return out;
}
