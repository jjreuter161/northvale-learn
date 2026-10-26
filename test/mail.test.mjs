// The email client against a fake SMTP server: it signs in, sends one
// message to the right address, and the text arrives intact (UTF-8, lines
// starting with "." escaped).
import net from "node:net";
import assert from "node:assert/strict";

let got = { lines: [] };
const fake = net.createServer((sock) => {
  sock.setEncoding("utf8");
  sock.write("220 fake.smtp ready\r\n");
  let data = false;
  let buf = "";
  sock.on("data", (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf("\r\n")) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 2);
      if (data) {
        if (line === ".") {
          data = false;
          sock.write("250 queued\r\n");
        } else got.lines.push(line);
        continue;
      }
      got[line.split(" ")[0]] = line;
      if (line.startsWith("EHLO")) sock.write("250-fake.smtp\r\n250-AUTH PLAIN\r\n250 SMTPUTF8\r\n");
      else if (line.startsWith("AUTH PLAIN")) sock.write("235 ok\r\n");
      else if (line.startsWith("MAIL FROM") || line.startsWith("RCPT TO")) sock.write("250 ok\r\n");
      else if (line === "DATA") (data = true), sock.write("354 go\r\n");
      else if (line === "QUIT") sock.end("221 bye\r\n");
    }
  });
});
await new Promise((r) => fake.listen(0, "127.0.0.1", r));
Object.assign(process.env, { SMTP_USER: "northvale.app@example.com", SMTP_PASS: "app-password", SMTP_HOST: "127.0.0.1", SMTP_PORT: String(fake.address().port), SMTP_PLAIN: "1" });
const mail = await import("../server/mail.js");
assert.equal(mail.mailMode(), "smtp");
await mail.sendMail({ to: "tester@example.com", subject: "Restablece tu contraseña", text: "Hola:\n.line starting with a dot\nhttps://x/#reset=abc" });
assert.equal(got.AUTH, `AUTH PLAIN ${Buffer.from("\0northvale.app@example.com\0app-password").toString("base64")}`);
assert.equal(got.MAIL, "MAIL FROM:<northvale.app@example.com>");
assert.equal(got.RCPT, "RCPT TO:<tester@example.com>");
const headerEnd = got.lines.indexOf("");
const headers = got.lines.slice(0, headerEnd).join("\n");
assert.match(headers, /^To: <tester@example.com>$/m);
assert.match(headers, /^Subject: =\?UTF-8\?B\?/m);
const body = Buffer.from(got.lines.slice(headerEnd + 1).join(""), "base64").toString("utf8");
assert.equal(body, "Hola:\n.line starting with a dot\nhttps://x/#reset=abc");
console.log("ok: password-reset email goes out over SMTP (signed in, right recipient, text intact)");
fake.close();
