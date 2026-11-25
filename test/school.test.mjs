// SCHOOL MODE, IN A REAL BROWSER (docs/SCHOOL-PLAN.md) — one app, two ways in:
//   - without school mode, the welcome is unchanged; with the tester link (?school=on) it asks "I'm a student / I'm a
//     teacher" first, and a student goes on to the usual first lesson;
//   - a teacher signs up on one screen (an adult age band, the teacher terms, what the school gets), then confirms
//     their email and names a class; the server refuses a teacher sign-up from 13–17 or without the terms;
//   - "Have a class code?" at the start opens the join screen over Today; the student's class shows on Today;
//   - the teacher's one list shows which lessons each student finished, and nothing else.
// Runs after `npm run build`.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const ROOT = join(import.meta.dirname, "..");
const port = 20000 + Math.floor(Math.random() * 20000);
const env = { ...process.env, NORTHVALE_DOTENV: "0", PORT: String(port), NORTHVALE_DATA: mkdtempSync(join(tmpdir(), "nvlearn-school-")), ANTHROPIC_API_KEY: "", ANTHROPIC_AUTH_TOKEN: "", TWELVEDATA_API_KEY: "", SMTP_USER: "", SMTP_PASS: "", ALERT_WEBHOOK_URL: "", NEWS_FEEDS: JSON.stringify({ US: [], MX: [] }), SIGNUP_CODE: "", ADMIN_TOKEN: "school-test-admin-token-1234" };
const server = spawn(process.execPath, [join(ROOT, "server/index.js")], { env, stdio: ["ignore", "pipe", "inherit"] });
let serverOut = "";
server.stdout.on("data", (d) => (serverOut += d));
await new Promise((resolve) => server.stdout.on("data", (d) => String(d).includes("Northvale Learn on") && resolve()));
const BASE = `http://127.0.0.1:${port}/`;
const post = (path, body, extra = {}) => fetch(`${BASE.slice(0, -1)}${path}`, { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json", ...extra }, body: JSON.stringify(body) }).then(async (r) => ({ status: r.status, ...(await r.json()) }));
const admin = (path, body) => post(path, body, { "X-Admin-Token": env.ADMIN_TOKEN });
let browser;
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
const LAPTOP = { viewport: { width: 1366, height: 768 } };
async function open(size, url = `${BASE}?school=on`) {
  const context = await browser.newContext({ ...size, locale: "en-US", timezoneId: "America/Mexico_City", serviceWorkers: "block", reducedMotion: "reduce" });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  await page.goto(url);
  const top = () => page.getByRole("dialog").last();
  const tab = (name) => page.getByRole("navigation").getByRole("button", { name, exact: true }).first().click();
  const classes = async () => (await tab("Me"), await page.getByRole("button", { name: /^Classes/ }).first().click());
  return { page, context, top, tab, classes, errors, close: () => context.close() };
}
const ok = (m) => console.log(`ok: ${m}`);
const RAW = /\b(cls|onb)\.[a-z]+(\.[a-z]+)*\b/;

try {
  // --- without school mode, nothing changes ---
  {
    const app = await open(PHONE, BASE);
    await app.page.getByRole("button", { name: "Get started" }).waitFor();
    assert.equal(await app.page.getByText("How will you use Northvale?").count(), 0);
    await app.close();
  }
  ok("without school mode the welcome is the same as before (no choice)");

  // --- the choice at the start: a student goes on to the usual first steps ---
  {
    const app = await open(PHONE);
    const { page } = app;
    await page.getByText("How will you use Northvale?").waitFor();
    assert.equal(await page.getByRole("radio", { name: /^I'm a student/ }).getAttribute("aria-checked"), "true", "student is the default");
    await page.getByRole("radio", { name: /^I'm a teacher/ }).waitFor();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: /Skip|Continue|Check/ }).first().waitFor();
    assert.equal(await page.getByText("Set up your teacher account").count(), 0, "a student doesn't see the teacher setup");
    assert.deepEqual(app.errors, []);
    await app.close();
  }
  ok("with the tester link the welcome asks “I'm a student / I'm a teacher”; a student goes on to the first steps");

  // --- the server's rules for a teacher sign-up ---
  {
    const base = { email: "kid@school.test", password: "a long enough password", nickname: "K", avatar: 0 };
    const codeOf = (r) => r.error && r.error.code;
    assert.equal(codeOf(await post("/api/auth/signup", { ...base, ageBand: "13-17", guardian: true, teacher: true, terms: true })), "ADULT");
    assert.equal(codeOf(await post("/api/auth/signup", { ...base, email: "noterms@school.test", ageBand: "26+", teacher: true })), "TERMS");
  }
  ok("the server refuses a teacher sign-up from 13–17, or without the teacher terms");

  // --- a teacher, on a laptop: one setup screen, then the email, then a class ---
  let code;
  const T = await open(LAPTOP);
  {
    const { page } = T;
    await page.getByRole("radio", { name: /^I'm a teacher/ }).click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("heading", { name: "Set up your teacher account" }).waitFor();
    for (const line of ["Free during the pilot. No ads, ever.", "We never sell or share student data.", "Students use nicknames. You see which lessons they finish, nothing else."]) await page.getByText(line).waitFor();
    const create = page.getByRole("button", { name: "Create account" });
    await page.getByLabel("Email").fill("ms.rivera@school.test");
    await page.getByLabel("Password").fill("a long teacher password");
    assert.ok(await create.isDisabled(), "not before the age and the terms");
    await page.getByRole("radio", { name: "26 or older" }).click();
    await page.getByRole("checkbox", { name: "I agree to the teacher terms" }).check();
    await page.getByRole("button", { name: "Read the teacher terms" }).click();
    await T.top().getByText("Never sells student information", { exact: false }).waitFor();
    await page.keyboard.press("Escape");
    assert.ok(RAW.test(await page.evaluate(() => document.body.innerText)) === false, "no raw text keys");
    await create.click();
    await page.getByRole("heading", { name: "Classes" }).waitFor();
    await page.getByText("Classroom mode isn't on for your account yet.", { exact: false }).waitFor();
    // The owner turns it on for this teacher (a tester).
    assert.deepEqual(await admin("/api/admin/flags", { flag: "classroom", email: "ms.rivera@school.test", on: true }), { status: 200, ok: true });
    await page.reload();
    await T.classes();
    await page.getByText("Confirm your email").waitFor();
    assert.equal(await page.getByRole("checkbox", { name: "I agree to the teacher terms" }).count(), 0, "the terms were accepted at sign-up");
    await page.waitForTimeout(300);
    const link = (/(http:\/\/\S+#verify=[\w-]+)/.exec(serverOut) || [])[1];
    assert.ok(link, "the confirmation email went out at sign-up (printed)");
    await page.goto(link);
    await page.reload();
    await T.classes();
    await page.getByLabel("Class name").fill("Period 3");
    await page.getByRole("button", { name: "Create class" }).click();
    code = (await page.getByLabel("Class code", { exact: true }).innerText()).trim();
    assert.match(code, /^[A-Z2-9]{6}$/);
    await page.getByText("Who finished which lessons").waitFor();
    assert.equal(await page.getByRole("button", { name: /Join a class/ }).count(), 0, "a teacher isn't offered “Join a class”");
    await T.tab("Learn");
    await page.getByText("Your classes").waitFor();
    assert.deepEqual(T.errors, []);
  }
  ok("a teacher signs up on one screen (age band, terms, no ads, no selling data), confirms their email, and makes a class from Today's “Your classes”");

  // --- a student, from “Have a class code?” at the start ---
  const S = await open(PHONE);
  {
    const { page, top } = S;
    await page.getByRole("button", { name: "Have a class code? Join a class" }).click();
    await top().getByRole("heading", { name: "Join a class" }).waitFor();
    await top().getByLabel("Class code").fill(code.toLowerCase());
    await top().getByRole("button", { name: "Continue" }).click();
    await top().getByText("Class: Period 3").waitFor();
    await top().getByLabel("Nickname for this class").fill("Ana");
    await top().getByRole("combobox").selectOption("13-17");
    await top().getByRole("button", { name: "Join class" }).click();
    await page.getByText("You joined Period 3").waitFor();
    await S.tab("Learn");
    await page.getByText("Your class: Period 3").waitFor();
    assert.deepEqual(S.errors, []);
  }
  ok("“Have a class code?” at the start opens the join screen over Today; the class then shows on Today");

  // --- the teacher's one list ---
  {
    for (const [nickname, lessons] of [["Beto", ["budget-1", "budget-2"]], ["Caro", ["budget-1", "save-1"]]]) {
      const m = await post("/api/class/join", { code, nickname, ageBand: "13-17" });
      await post("/api/class/report", { ...m, report: { lessons } });
    }
    const { page } = T;
    await T.classes();
    await page.getByText(/3 students ·/).click();
    const table = page.locator("table[data-progress]");
    await table.waitFor();
    const headers = await table.locator("thead th[scope=colgroup]").allInnerTexts();
    assert.deepEqual(headers, ["Budgeting", "Saving"], "only units someone has started");
    const row = (n) => table.getByRole("row").filter({ has: page.getByRole("rowheader", { name: n }) });
    assert.equal(await row("Beto").getByRole("cell", { name: /: finished$/ }).count(), 2);
    assert.equal(await row("Caro").getByRole("cell", { name: /: finished$/ }).count(), 2);
    assert.equal(await row("Ana").getByRole("cell", { name: /: finished$/ }).count(), 0);
    assert.equal(await page.getByText("Assign", { exact: true }).count(), 0);
    await page.getByRole("button", { name: "Class settings" }).click();
    await T.top().getByText("Taking new students").waitFor();
    await T.top().getByText("End the class", { exact: true }).first().waitFor();
    assert.deepEqual(T.errors, []);
  }
  ok("the teacher's one list: a tick per finished lesson under each unit someone started; the rest is in Class settings");
  await S.close();
  await T.close();
} finally {
  await browser.close();
  server.kill();
}
