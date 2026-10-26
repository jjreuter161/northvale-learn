// EMAIL — only for password reset links. Sent over SMTP from one account
// you control (for the beta: a dedicated Gmail with an "app password";
// docs/SETUP-KEYS.md). A tiny SMTP client on Node's own TLS, so no extra
// library: connect, sign in, send one message, quit.
//
// Settings: SMTP_USER, SMTP_PASS (the app password), MAIL_FROM (defaults to
// SMTP_USER), SMTP_HOST (smtp.gmail.com), SMTP_PORT (465, TLS from the
// start). Without them, nothing is sent: locally the reset link is printed
// in the server log; in production, password reset says to contact you.
import tls from "node:tls";
import net from "node:net";

const USER = process.env.SMTP_USER || "";
const PASS = process.env.SMTP_PASS || "";
const HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const PORT = Number(process.env.SMTP_PORT) || 465;
// Tests talk to a local fake server without TLS.
const PLAIN = process.env.SMTP_PLAIN === "1";
const FROM = process.env.MAIL_FROM || USER;

export const mailMode = () => (USER && PASS ? "smtp" : process.env.NODE_ENV === "production" ? "off" : "log");

// One SMTP conversation. Each step waits for the server's reply code.
// Without `to`, it only signs in and leaves (to check the settings).
function smtp(to, raw) {
  return new Promise((resolve, reject) => {
    const sock = PLAIN ? net.connect(PORT, HOST) : tls.connect({ host: HOST, port: PORT, servername: HOST });
    sock.setTimeout(15000, () => sock.destroy(new Error("SMTP timeout")));
    sock.setEncoding("utf8");
    let buf = "";
    let waiting = null;
    sock.on("data", (d) => {
      buf += d;
      // A reply is done when a complete line has "NNN " (a space, not a
      // dash) after the code; the last piece may still be arriving.
      const lines = buf.split("\r\n");
      const last = lines.slice(0, -1).findIndex((l) => /^\d{3} /.test(l));
      if (last < 0 || !waiting) return;
      const code = Number(lines[last].slice(0, 3));
      buf = lines.slice(last + 1).join("\r\n");
      const w = waiting;
      waiting = null;
      w(code, lines.slice(0, last + 1).join("\n"));
    });
    sock.on("error", reject);
    const step = (line, expect) =>
      new Promise((ok, fail) => {
        waiting = (code, text) => (expect.includes(code) ? ok(code) : fail(new Error(`SMTP ${code}: ${text.slice(0, 200)}`)));
        if (line !== null) sock.write(`${line}\r\n`);
      });
    (async () => {
      await step(null, [220]);
      await step("EHLO northvale-learn", [250]);
      await step(`AUTH PLAIN ${Buffer.from(`\0${USER}\0${PASS}`).toString("base64")}`, [235]);
      if (!to) {
        sock.end("QUIT\r\n");
        return resolve();
      }
      await step(`MAIL FROM:<${FROM}>`, [250]);
      await step(`RCPT TO:<${to}>`, [250, 251]);
      await step("DATA", [354]);
      // Lines starting with "." get an extra "." (SMTP's rule), then "." ends it.
      await step(`${raw.replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..")}\r\n.`, [250]);
      sock.write("QUIT\r\n");
      sock.end();
      resolve();
    })().catch((e) => {
      sock.destroy();
      reject(e);
    });
  });
}

// Signs in to the mail server and leaves, sending nothing.
export const checkLogin = () => smtp(null, null);

const encode = (s) => `=?UTF-8?B?${Buffer.from(s).toString("base64")}?=`;
// `to` must already be a validated plain address (auth.validEmail).
export async function sendMail({ to, subject, text }) {
  const mode = mailMode();
  if (mode === "log") {
    console.log(`[mail] to ${to}: ${subject}\n${text}`);
    return { sent: false, logged: true };
  }
  if (mode === "off") return { sent: false };
  const raw = [`From: Northvale Learn <${FROM}>`, `To: <${to}>`, `Subject: ${encode(subject)}`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: base64", "", Buffer.from(text).toString("base64").replace(/(.{76})/g, "$1\r\n")].join("\r\n");
  await smtp(to, raw);
  return { sent: true };
}
