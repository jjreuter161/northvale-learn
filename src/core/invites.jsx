// INVITES — the learner's personal link (…/?invite=CODE), shared however
// they like: copied, or through the phone's own share sheet. Nothing is
// sent for them and no contacts are read. Someone who comes through it and
// finishes a first lesson gets a streak freeze, and so does the inviter
// (server/invites.js). With accounts on both sides, the link can also add
// them as friends for the friends league (only if the invited person says
// yes). Saved in state.growth:
//   invite     { code, key } — this learner's own link
//   invitedBy  the code they arrived with; isNew: they were new then
//   by         a random ID for counting them under that link, made only
//              for this (not their usage-stats ID or account)
//   joinedSent, friendAsked, friendsJoined
import { useEffect, useState } from "react";
import { getState, update, useAppState, on } from "./store.js";
import { addStrings, makeT } from "./i18n.js";
import { api } from "./api.js";
import { MAX_FREEZES } from "./progress.js";
import { Button, Card, Icon, toast } from "./ui.jsx";

const S = (en, es) => ({ en, es });
addStrings({
  "inv.title": S("Invite a friend", "Invita a alguien"),
  "inv.body": S("Send your link to a friend however you like. When they finish their first lesson, you each get a streak freeze.", "Manda tu enlace como quieras. Cuando tu amigo o amiga termine su primera lección, cada quien recibe un protector de racha."),
  "inv.get": S("Get my link", "Obtener mi enlace"),
  "inv.copy": S("Copy link", "Copiar enlace"),
  "inv.copied": S("Link copied", "Enlace copiado"),
  "inv.share": S("Share link", "Compartir enlace"),
  "inv.share.text": S("Learn money with me on Northvale Learn (practice money only):", "Aprende de dinero conmigo en Northvale Learn (solo dinero de práctica):"),
  "inv.joined": S("{n} {n|friend has|friends have} finished a first lesson through your link.", "{n} {n|persona terminó|personas terminaron} su primera lección con tu enlace."),
  "inv.offline": S("Your link appears when you're online.", "Tu enlace aparece cuando tengas conexión."),
  "inv.reward.you": S("You and the friend who invited you each got a streak freeze.", "Tú y quien te invitó recibieron un protector de racha cada quien."),
  "inv.reward.them": S("{n} {n|friend|friends} finished a first lesson through your link: a streak freeze for you.", "{n} {n|persona terminó|personas terminaron} su primera lección con tu enlace: un protector de racha para ti."),
  "inv.friend.title": S("Add the friend who invited you?", "¿Agregar a quien te invitó?"),
  "inv.friend.body": S("You'd join each other's friends league: you'll see each other's nickname and weekly XP, nothing else. Either of you can remove it.", "Entrarían a la liga de amigos del otro: verán su apodo y su XP de la semana, nada más. Cualquiera de los dos puede quitarlo."),
  "inv.friend.yes": S("Add friend", "Agregar"),
  "inv.friend.no": S("No thanks", "No, gracias"),
  "inv.friend.added": S("Added to your friends league", "Agregado a tu liga de amigos"),
});

const G = () => getState().growth || {};
const setGrowth = (patch) => update((s) => ({ ...s, growth: { ...(s.growth || {}), ...patch } }));
const tNow = () => makeT({ lang: getState().settings.lang, region: getState().settings.region, both: !!getState().settings.both });
const addFreezes = (n) => {
  const room = Math.max(0, MAX_FREEZES - getState().progress.freezes);
  if (room) update((s) => ({ ...s, progress: { ...s.progress, freezes: s.progress.freezes + Math.min(n, room) } }));
};

export const inviteUrl = () => (G().invite ? `${location.origin}/?invite=${G().invite.code}` : null);

// This device's link (kept by the account when signed in).
export async function ensureInvite() {
  const mine = G().invite || {};
  const r = await api("/api/invite", { method: "PUT", body: { code: mine.code, key: mine.key } });
  if (r.key) setGrowth({ invite: { code: r.code, key: r.key } });
}

// Opened from someone's link (?invite=CODE).
export function arrived(code) {
  if (!/^[\w-]{4,20}$/.test(code) || (G().invite && G().invite.code === code)) return;
  const isNew = !(getState().progress.counters.lessons > 0);
  const by = G().by || crypto.randomUUID();
  setGrowth({ invitedBy: code, isNew, by, friendAsked: false });
  api("/api/invite/open", { method: "POST", body: { code, by } }).catch(() => {});
}

// A new learner who came through a link finishes their first lesson.
on("lesson.completed", () => {
  const g = G();
  if (!g.invitedBy || !g.isNew || g.joinedSent) return;
  setGrowth({ joinedSent: true });
  api("/api/invite/joined", { method: "POST", body: { code: g.invitedBy, by: g.by } }).then(
    (r) => r.reward && (addFreezes(1), toast(tNow()("inv.reward.you"), "good")),
    () => setGrowth({ joinedSent: false })
  );
});

// On opening the app: freezes waiting for the inviter.
export async function claimRewards(t) {
  const g = G();
  if (!g.invite) return;
  const r = await api("/api/invite/claim", { method: "POST", body: g.invite }).catch((e) => (e.status === 404 && setGrowth({ invite: null }), null));
  if (!r) return;
  if (r.joined !== g.friendsJoined) setGrowth({ friendsJoined: r.joined });
  if (r.rewards) (addFreezes(r.rewards), toast(t("inv.reward.them", { n: r.rewards }), "good"));
}

// "Delete my data": the link stops working.
export async function forgetInvite() {
  const g = G();
  if (g.invite) await api("/api/invite", { method: "DELETE", body: g.invite }).catch(() => {});
}

export function InviteCard({ t, session }) {
  const g = useAppState((s) => s.growth) || {};
  const [failed, setFailed] = useState(false);
  // A link made before signing in now belongs to the account too.
  useEffect(() => {
    if (g.invite && session.user) ensureInvite().catch(() => {});
  }, [session.user]);
  const url = g.invite ? `${location.origin}/?invite=${g.invite.code}` : null;
  return (
    <Card>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Icon name="users" size={24} color="var(--mid)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 650 }}>{t("inv.title")}</div>
          <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "2px 0 0" }}>{t("inv.body")}</p>
        </div>
      </div>
      {url ? (
        <>
          <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 12, background: "var(--surface2)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <Button size="md" kind="secondary" onClick={() => navigator.clipboard.writeText(url).then(() => toast(t("inv.copied"), "good"), () => {})}>
              <Icon name="copy" size={18} /> {t("inv.copy")}
            </Button>
            {navigator.share && (
              <Button size="md" kind="secondary" onClick={() => navigator.share({ text: t("inv.share.text"), url }).catch(() => {})}>
                <Icon name="share" size={18} /> {t("inv.share")}
              </Button>
            )}
          </div>
          {g.friendsJoined > 0 && <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{t("inv.joined", { n: g.friendsJoined })}</p>}
        </>
      ) : failed ? (
        <p style={{ fontSize: 14, color: "var(--mid)", margin: "10px 0 0" }}>{t("inv.offline")}</p>
      ) : (
        <Button size="md" kind="secondary" style={{ marginTop: 12 }} onClick={() => ensureInvite().catch(() => setFailed(true))}>
          {t("inv.get")}
        </Button>
      )}
    </Card>
  );
}

// Signed in, and came through a friend's link: join each other's friends
// league? Only if they say yes.
export function FriendOffer({ t, session, onAdded }) {
  const g = useAppState((s) => s.growth) || {};
  const [error, setError] = useState(null);
  if (!session.user || !g.invitedBy || g.friendAsked) return null;
  const add = () =>
    api("/api/friends", { method: "POST", body: { code: g.invitedBy } }).then(
      () => (setGrowth({ friendAsked: true }), toast(t("inv.friend.added"), "good"), onAdded && onAdded()),
      (e) => setError(e.message)
    );
  return (
    <Card style={{ marginBottom: 10 }}>
      <div style={{ fontWeight: 650 }}>{t("inv.friend.title")}</div>
      <p style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.45, margin: "4px 0 12px" }}>{error || t("inv.friend.body")}</p>
      <div style={{ display: "flex", gap: 8 }}>
        {!error && (
          <Button size="md" onClick={add}>
            {t("inv.friend.yes")}
          </Button>
        )}
        <Button size="md" kind="ghost" onClick={() => setGrowth({ friendAsked: true })}>
          {t("inv.friend.no")}
        </Button>
      </div>
    </Card>
  );
}
