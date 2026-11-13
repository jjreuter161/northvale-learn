// ME — your level, streak and this week; the weekly league (after 3
// learning days); then rows for achievements, skills, inviting a friend,
// classes, Settings, feedback and the legal pages. Each row opens its own
// page (me with { section }). The league is real people only: this week's
// group of signed-in learners, your friends (through invite links), or
// your class — the learner picks. With nobody else yet, it says so.
import { useEffect, useState } from "react";
import { useAppState } from "./store.js";
import { api } from "./api.js";
import { level, xpOn, weekXp, weekStart, addDays, dayKey, BADGES, MAX_FREEZES } from "./progress.js";
import { AVATARS, Badge, Card, Icon, Label, List, ListRow, Loading, Progress, Ring, StreakStar, Title, Button, Segmented, toast } from "./ui.jsx";
import { allModules, getModule, service } from "./registry.js";
import { setLeague as saveLeague } from "./session.js";
import { InviteCard, FriendOffer } from "./invites.jsx";
import { openShare } from "./share.jsx";

function League({ t, session, go }) {
  const [league, setLeague] = useState(null);
  const [reload, setReload] = useState(0);
  const progress = useAppState((s) => s.progress);
  const inClass = !!service("classroom", "inClass")();
  const modes = [...(session.user ? ["everyone", "friends"] : []), ...(inClass ? ["class"] : [])];
  const mode = modes.includes(session.user && session.user.league) ? session.user.league : modes[0];
  useEffect(() => {
    if (!mode) return;
    let gone = false;
    setLeague(null);
    (mode === "class" ? service("classroom", "board")() : api(mode === "friends" ? "/api/league?with=friends" : "/api/league"))
      .then((r) => !gone && setLeague(r || { standings: [] }))
      .catch(() => !gone && setLeague({ error: true }));
    return () => {
      gone = true;
    };
  }, [mode, progress.xp, reload]);
  const unfriend = (r) => api("/api/friends", { method: "DELETE", body: { link: r.link } }).then(() => setReload((n) => n + 1), (e) => toast(e.message));
  const picker = modes.length > 1 && (
    <div style={{ marginBottom: 10 }}>
      <Segmented label={t("league.with")} value={mode} onChange={(v) => (session.user ? saveLeague(v).catch((e) => toast(e.message)) : null)} options={modes.map((m) => ({ value: m, label: t(`league.with.${m}`) }))} />
      {mode !== "everyone" && <p style={{ fontSize: 13, color: "var(--low)", margin: "8px 2px 0", lineHeight: 1.4 }}>{t("league.with.sub")}</p>}
    </div>
  );
  // The everyone league keeps 13–17 and 18+ apart (server/store.js).
  const teens = mode === "everyone" && session.user.ageBand === "13-17" && <p style={{ fontSize: 13, color: "var(--low)", margin: "0 2px 8px", lineHeight: 1.4 }}>{t("league.teens")}</p>;
  if (!mode)
    return (
      <Card>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Icon name="trophy" size={24} color="var(--mid)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650 }}>{t("league.join")}</div>
            <div style={{ fontSize: 14, color: "var(--mid)", lineHeight: 1.4 }}>{t("league.join.sub")}</div>
          </div>
        </div>
        <Button kind="secondary" size="md" full style={{ marginTop: 12 }} onClick={() => go("settings")}>
          {t("account.create")}
        </Button>
      </Card>
    );
  if (!league) return <>{picker}{teens}<Card><Loading label={t("common.loading")} /></Card></>;
  if (league.error) return <>{picker}{teens}<Card><span style={{ color: "var(--mid)" }}>{t("league.error")}</span></Card></>;
  const resets = Math.max(1, 7 - Math.round((new Date(`${dayKey()}T12:00:00`) - new Date(`${weekStart(dayKey())}T12:00:00`)) / 864e5));
  return (
    <>
    {picker}
    {teens}
    <Card pad={0}>
      <div style={{ padding: "12px 16px 8px", fontSize: 13, color: "var(--mid)" }}>{t("league.resets", { n: resets })}</div>
      {league.standings.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: r.you ? "var(--brandSoft)" : "transparent", borderTop: "1px solid var(--line)" }}>
          <span style={{ width: 22, textAlign: "center", fontWeight: 650, color: i < 3 ? "var(--ink)" : "var(--low)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
          <span style={{ width: 32, height: 32, borderRadius: 16, background: AVATARS[r.avatar % AVATARS.length] || AVATARS[0], color: "#F7F2E8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 650, fontSize: 14 }}>{(r.nickname || "?")[0].toUpperCase()}</span>
          <span style={{ flex: 1, fontWeight: r.you ? 650 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.you ? t("league.you", { name: r.nickname || t("league.anon") }) : r.nickname || t("league.anon")}</span>
          <span style={{ fontWeight: 600, color: "var(--mid)", fontVariantNumeric: "tabular-nums" }}>{r.xp} XP</span>
          {r.link && (
            <button onClick={() => unfriend(r)} aria-label={t("league.remove", { name: r.nickname || t("league.anon") })} style={{ border: "none", background: "transparent", color: "var(--low)", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Icon name="close" size={16} />
            </button>
          )}
        </div>
      ))}
      {league.standings.length < 2 && <p style={{ fontSize: 14, color: "var(--mid)", padding: "8px 16px 14px", margin: 0, lineHeight: 1.45 }}>{t(mode === "friends" ? "league.friends.none" : "league.alone")}</p>}
    </Card>
    </>
  );
}

// Open after 3 learning days — or already, for anyone in a class or with
// friends here (nothing anyone had disappears).
export const leagueOpen = (progress, session) => (progress.lessonDays || []).length >= 3 || !!service("classroom", "inClass")() || !!(session.user && session.user.league && session.user.league !== "everyone");

function Badges({ t, progress }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
      {BADGES.map((b) => {
        const got = progress.badges[b.id];
        const Tile = got ? "button" : "div";
        return (
          <Tile key={b.id} title={t(`badge.${b.id}.how`)} {...(got ? { onClick: () => openShare({ kind: "badge", name: t(`badge.${b.id}`) }), className: "nv-press" } : {})} style={{ background: "var(--surface)", border: "none", borderRadius: 24, boxShadow: "var(--lift)", padding: "14px 8px", textAlign: "center", color: "var(--ink)", font: "inherit", cursor: got ? "pointer" : "default" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Badge id={b.id} size={64} locked={!got} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 650, marginTop: 6, lineHeight: 1.2 }}>{t(`badge.${b.id}`)}</div>
            <div style={{ fontSize: 12, color: "var(--mid)", marginTop: 4, lineHeight: 1.3 }}>{got ? t("badge.got") : t(`badge.${b.id}.how`)}</div>
            {got && <span className="nv-sr"> · {t("share.button")}</span>}
          </Tile>
        );
      })}
    </div>
  );
}

export default function Me({ t, locale, session, go, route }) {
  const profile = useAppState((s) => s.profile);
  const progress = useAppState((s) => s.progress);
  const section = route && route.params.section;
  const today = dayKey();
  const lv = level(progress.xp);
  const start = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const maxDay = Math.max(progress.dailyGoal, ...week.map((d) => xpOn(progress, d)));
  const dayLetter = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(t("locale.tag"), { weekday: "narrow" });
  const name = profile.nickname || t("me.learner");
  const days = (progress.lessonDays || []).length;
  const invited = !!(useAppState((s) => s.growth) || {}).invite;
  const cards = allModules().filter((m) => m.MeCard);
  const classes = getModule("classroom");
  const showClasses = classes && classes.nav && classes.nav.show && classes.nav.show({ session });
  const got = BADGES.filter((b) => progress.badges[b.id]).length;

  if (section)
    return (
      <div>
        <Title>{t(`me.section.${section}`)}</Title>
        {section === "achievements" && <Badges t={t} progress={progress} />}
        {section === "skills" && cards.map((m) => <m.MeCard key={m.id} t={t} locale={locale} go={go} />)}
        {section === "invite" && <InviteCard t={t} session={session} />}
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "4px 0 16px" }}>
        <span style={{ width: 52, height: 52, borderRadius: 26, background: AVATARS[profile.avatar] || AVATARS[0], color: "#F7F2E8", fontSize: 22, fontWeight: 650, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{name[0].toUpperCase()}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="nv-disp" style={{ fontSize: 30, margin: 0, lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 650, color: "var(--mid)", whiteSpace: "nowrap" }}>{t("me.level", { n: lv.level })}</span>
            <Progress value={lv.into} max={lv.need} height={6} label={t("me.level", { n: lv.level })} />
            <span style={{ fontSize: 13, color: "var(--mid)", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>{lv.into}/{lv.need}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(86px, 1fr))", gap: 10 }}>
        {[
          ["streak", progress.streak.count, t("me.streak")],
          ["bolt", progress.xp, t("me.total_xp")],
          ["snow", `${progress.freezes}/${MAX_FREEZES}`, t("me.freezes")],
        ].map(([icon, value, label]) => (
          <Card key={label} pad={14}>
            {icon === "streak" ? <StreakStar count={progress.streak.count} size={20} /> : <Icon name={icon} size={18} color="var(--mid)" />}
            <div className="nv-disp" style={{ fontSize: 26, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--mid)", fontWeight: 500 }}>{label}</div>
          </Card>
        ))}
      </div>

      <Label>{t("me.this_week")}</Label>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <Ring value={xpOn(progress, today)} max={progress.dailyGoal} size={56} stroke={5} label={t("goal.aria", { xp: xpOn(progress, today), goal: progress.dailyGoal })}>
            <span style={{ fontSize: 13, fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>{Math.min(100, Math.round((xpOn(progress, today) / progress.dailyGoal) * 100))}%</span>
          </Ring>
          <div>
            <div style={{ fontWeight: 650 }}>{t("me.today", { xp: xpOn(progress, today), goal: progress.dailyGoal })}</div>
            <div style={{ fontSize: 14, color: "var(--mid)" }}>{t("me.week_total", { xp: weekXp(progress, today) })}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }} aria-label={t("me.this_week")}>
          {week.map((d) => {
            const xp = xpOn(progress, d);
            return (
              <div key={d} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end" }}>
                <div title={`${xp} XP`} style={{ width: "100%", maxWidth: 28, height: `${Math.max(4, (xp / maxDay) * 70)}px`, borderRadius: 4, background: xp ? "var(--accent)" : "var(--surface2)", opacity: d > today ? 0.4 : xp && xp < progress.dailyGoal ? 0.55 : 1 }} />
                <span style={{ fontSize: 12, fontWeight: 650, color: d === today ? "var(--ink)" : "var(--low)" }}>{dayLetter(d)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <FriendOffer t={t} session={session} />
      {leagueOpen(progress, session) && (
        <>
          <Label>{t("league.title")}</Label>
          <League t={t} session={session} go={go} />
        </>
      )}

      <List style={{ marginTop: 24 }}>
        <ListRow icon="trophy" title={t("me.section.achievements")} sub={t("me.badges.n", { n: got, total: BADGES.length })} onClick={() => go("me", { section: "achievements" })} />
        {cards.length > 0 && <ListRow icon="target" title={t("me.section.skills")} sub={t("me.skills.sub")} onClick={() => go("me", { section: "skills" })} />}
        {(days >= 3 || invited) && <ListRow icon="share" title={t("me.section.invite")} sub={t("me.invite.sub")} onClick={() => go("me", { section: "invite" })} />}
        {showClasses && <ListRow icon="users" title={t(classes.nav.label)} onClick={() => go("classroom")} />}
      </List>
      <List style={{ marginTop: 12 }}>
        <ListRow icon="settings" title={t("nav.settings")} onClick={() => go("settings")} />
        <ListRow icon="chat" title={t("fb.title")} onClick={() => service("feedback", "open")({})} />
        <ListRow icon="star" title={t("me.promise")} onClick={() => go("legal", { doc: "promise", from: "me" })} />
        <ListRow icon="shield" title={t("me.legal")} onClick={() => go("legal", { doc: "privacy", from: "me" })} />
      </List>
    </div>
  );
}
