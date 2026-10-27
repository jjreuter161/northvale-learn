// INVITES — a personal link (…/?invite=CODE) the learner shares
// themselves: no contact lists, nothing sent for them. When someone who
// came through a link finishes their first lesson, both get a streak
// freeze (the inviter's waits here until their app picks it up). The
// invited person is counted only under a random ID made for this (not
// their usage-stats ID or account), so invites can't link the two.
// FRIENDS — two accounts linked through an invite link, for the friends
// league. Either one can remove the link; deleting an account removes all.
import { randomBytes, timingSafeEqual } from "node:crypto";
import { store } from "./store.js";
import { sha256 } from "./auth.js";
import { allowed } from "./insights.js";
import { dayKey } from "../src/core/progress.js";

const MAX_REWARDS = 20; // per invite link
const MAX_FRIENDS = 100;
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail = (status, message) => Object.assign(new Error(message), { status });
const invites = () => store.section("invites", () => ({}));
const links = () => store.section("friends", () => ({}));
const own = (o, k) => (Object.hasOwn(o, String(k)) ? o[String(k)] : null);
const sameHash = (a, b) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const mine = (code, key) => {
  const inv = own(invites(), code);
  return inv && sameHash(inv.keyHash, sha256(String(key || ""))) ? inv : null;
};

// The device's link: the one it has (signed in now → the account owns it,
// for the friends league), or a new one.
export function ensure({ code, key }, user, ip) {
  const inv = mine(code, key);
  if (inv) {
    if (user && !inv.owner) (inv.owner = user.id), store.changed();
    return { code };
  }
  if (!allowed(`invite:${ip}`, 20)) throw fail(429, "Too many invite links from here. Try again later.");
  const fresh = randomBytes(6).toString("base64url");
  const secret = randomBytes(24).toString("base64url");
  invites()[fresh] = { keyHash: sha256(secret), owner: user ? user.id : null, created: dayKey(), opened: [], joined: [], pending: 0, rewarded: 0 };
  store.changed();
  return { code: fresh, key: secret };
}

// Someone opened a link (counted once per person).
export function opened(code, by, ip) {
  if (!allowed(`invopen:${ip}`, 60)) return { ok: true };
  const inv = own(invites(), code);
  if (inv && ID.test(String(by)) && !inv.opened.includes(by)) {
    inv.opened = [...inv.opened, by].slice(-1000);
    store.changed();
  }
  return { ok: true };
}
// …and finished their first lesson: a freeze for them now, one waiting
// for the inviter.
export function joined(code, by, ip) {
  if (!allowed(`invjoin:${ip}`, 30)) return { reward: false };
  const inv = own(invites(), code);
  if (!inv || !ID.test(String(by)) || inv.joined.includes(by)) return { reward: false };
  inv.joined = [...inv.joined, by].slice(-1000);
  const reward = inv.pending + inv.rewarded < MAX_REWARDS;
  if (reward) inv.pending++;
  store.changed();
  return { reward };
}
// The inviter's app picks up what's waiting.
export function claim(code, key) {
  const inv = mine(code, key);
  if (!inv) throw fail(404, "That invite link isn't there.");
  const rewards = inv.pending;
  inv.rewarded += rewards;
  inv.pending = 0;
  store.changed();
  return { rewards, joined: inv.joined.length };
}
// "Delete my data": the link stops working.
export function forget(code, key) {
  if (mine(code, key)) delete invites()[code];
  store.changed();
  return { ok: true };
}

// ---- friends ------------------------------------------------------------------

export const friendsOf = (userId) =>
  Object.entries(links())
    .filter(([, pair]) => pair.includes(userId))
    .map(([id, pair]) => ({ id, userId: pair[0] === userId ? pair[1] : pair[0] }))
    .filter((f) => store.userById(f.userId));

export function befriend(user, code) {
  const inv = own(invites(), code);
  if (!inv || !inv.owner || !store.userById(inv.owner)) throw fail(404, "That friend doesn't have an account yet, so there's no friends league to join.");
  if (inv.owner === user.id) throw fail(400, "That's your own link.");
  const mineNow = friendsOf(user.id);
  if (mineNow.some((f) => f.userId === inv.owner)) return { ok: true };
  if (mineNow.length >= MAX_FRIENDS || friendsOf(inv.owner).length >= MAX_FRIENDS) throw fail(400, "That's the most friends a league can have.");
  links()[randomBytes(9).toString("base64url")] = [user.id, inv.owner];
  store.changed();
  return { ok: true };
}
export function unfriend(user, id) {
  const pair = own(links(), id);
  if (pair && pair.includes(user.id)) delete links()[id];
  store.changed();
  return { ok: true };
}

// An account deleted: its friend links go, and its invite links forget it.
export function dropUser(userId) {
  for (const [id, pair] of Object.entries(links())) if (pair.includes(userId)) delete links()[id];
  for (const inv of Object.values(invites())) if (inv.owner === userId) inv.owner = null;
  store.changed();
}

export function stats() {
  const list = Object.values(invites());
  return { links: list.length, opened: list.reduce((t, i) => t + i.opened.length, 0), joined: list.reduce((t, i) => t + i.joined.length, 0), rewarded: list.reduce((t, i) => t + i.rewarded + i.pending, 0), friendLinks: Object.keys(links()).length };
}
