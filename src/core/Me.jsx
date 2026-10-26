// ME — your level, streak, today's goal, this week, the weekly league, and
// badges. The league is real people only (signed-in learners on this
// server, grouped by week); with nobody else yet, it says so.
import { useEffect, useState } from "react";
import { useAppState } from "./store.js";
import { api } from "./api.js";
import { level, xpOn, weekXp, weekStart, addDays, dayKey, BADGES, MAX_FREEZES } from "./progress.js";
import { AVATARS, Card, Icon, Label, Progress, Ring, Title, Button } from "./ui.jsx";
import { allModules } from "./registry.js";

function League({ t, session, go }) {
  const [league, setLeague] = useState(null);
  const progress = useAppState((s) => s.progress);
  useEffect(() => {
    if (!session.user) return;
    let gone = false;
    api("/api/league")
      .then((r) => !gone && setLeague(r))
      .catch(() => !gone && setLeague({ error: true }));
    return () => {
      gone = true;
    };
  }, [session.user, progress.xp]);
  if (!session.user)
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
  if (!league) return <Card><span className="nv-pulse">…</span></Card>;
  if (league.error) return <Card><span style={{ color: "var(--mid)" }}>{t("league.error")}</span></Card>;
  const resets = Math.max(1, 7 - Math.round((new Date(`${dayKey()}T12:00:00`) - new Date(`${weekStart(dayKey())}T12:00:00`)) / 864e5));
  return (
    <Card pad={0}>
      <div style={{ padding: "12px 16px 8px", fontSize: 13, color: "var(--mid)" }}>{t("league.resets", { n: resets })}</div>
      {league.standings.map((r, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", background: r.you ? "var(--brandSoft)" : "transparent", borderTop: "1px solid var(--line)" }}>
          <span style={{ width: 22, textAlign: "center", fontWeight: 650, color: i < 3 ? "var(--ink)" : "var(--low)", fontVariantNumeric: "tabular-nums" }}>{i + 1}</span>
          <span style={{ width: 32, height: 32, borderRadius: 16, background: AVATARS[r.avatar % AVATARS.length] || AVATARS[0], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 650, fontSize: 14 }}>{(r.nickname || "?")[0].toUpperCase()}</span>
          <span style={{ flex: 1, fontWeight: r.you ? 650 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.you ? t("league.you", { name: r.nickname || t("league.anon") }) : r.nickname || t("league.anon")}</span>
          <span style={{ fontWeight: 600, color: "var(--mid)", fontVariantNumeric: "tabular-nums" }}>{r.xp} XP</span>
        </div>
      ))}
      {league.standings.length < 2 && <p style={{ fontSize: 14, color: "var(--mid)", padding: "8px 16px 14px", margin: 0, lineHeight: 1.45 }}>{t("league.alone")}</p>}
    </Card>
  );
}

export default function Me({ t, locale, session, go }) {
  const profile = useAppState((s) => s.profile);
  const progress = useAppState((s) => s.progress);
  const today = dayKey();
  const lv = level(progress.xp);
  const start = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const maxDay = Math.max(progress.dailyGoal, ...week.map((d) => xpOn(progress, d)));
  const dayLetter = (d) => new Date(`${d}T12:00:00`).toLocaleDateString(t("locale.tag"), { weekday: "narrow" });
  const name = profile.nickname || t("me.learner");

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
        <span style={{ width: 56, height: 56, borderRadius: 28, background: AVATARS[profile.avatar] || AVATARS[0], color: "#fff", fontSize: 24, fontWeight: 650, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{name[0].toUpperCase()}</span>
        <div style={{ minWidth: 0 }}>
          <Title>{name}</Title>
        </div>
      </div>

      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--brandSoft)", color: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>{lv.level}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 650 }}>{t("me.level", { n: lv.level })}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Progress value={lv.into} max={lv.need} color="var(--accent)" height={6} label={t("me.level", { n: lv.level })} />
              <span style={{ fontSize: 13, fontWeight: 650, color: "var(--mid)", whiteSpace: "nowrap" }}>{lv.into}/{lv.need}</span>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 }}>
        {[
          [<Icon key="f" name="flame" size={18} color="var(--mid)" />, progress.streak.count, t("me.streak")],
          [<Icon key="b" name="bolt" size={18} color="var(--mid)" />, progress.xp, t("me.total_xp")],
          [<Icon key="s" name="snow" size={18} color="var(--mid)" />, `${progress.freezes}/${MAX_FREEZES}`, t("me.freezes")],
        ].map(([icon, value, label]) => (
          <Card key={label} pad={14}>
            {icon}
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>{value}</div>
            <div style={{ fontSize: 13, color: "var(--mid)", fontWeight: 500 }}>{label}</div>
          </Card>
        ))}
      </div>

      <Label>{t("me.this_week")}</Label>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <Ring value={xpOn(progress, today)} max={progress.dailyGoal} size={56} stroke={5} color="var(--accent)" label={t("goal.aria", { xp: xpOn(progress, today), goal: progress.dailyGoal })}>
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
                <div title={`${xp} XP`} style={{ width: "100%", maxWidth: 28, height: `${Math.max(4, (xp / maxDay) * 70)}px`, borderRadius: 4, background: xp >= progress.dailyGoal ? "var(--accent)" : xp ? "var(--brand)" : "var(--surface2)", opacity: d > today ? 0.4 : 1 }} />
                <span style={{ fontSize: 12, fontWeight: 650, color: d === today ? "var(--ink)" : "var(--low)" }}>{dayLetter(d)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {allModules()
        .filter((m) => m.MeCard)
        .map((m) => (
          <m.MeCard key={m.id} t={t} locale={locale} go={go} />
        ))}

      <Label>{t("league.title")}</Label>
      <League t={t} session={session} go={go} />

      <Label>{t("me.badges")}</Label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 10 }}>
        {BADGES.map((b) => {
          const got = progress.badges[b.id];
          return (
            <div key={b.id} title={t(`badge.${b.id}.how`)} style={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, padding: "14px 8px", textAlign: "center", opacity: got ? 1 : 0.6 }}>
              <div style={{ width: 40, height: 40, margin: "0 auto", borderRadius: 20, background: got ? "var(--brandSoft)" : "var(--surface2)", color: got ? "var(--brand)" : "var(--low)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={got ? b.icon : "lock"} size={18} color="currentColor" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 650, marginTop: 6, lineHeight: 1.2 }}>{t(`badge.${b.id}`)}</div>
              <div style={{ fontSize: 12, color: "var(--mid)", marginTop: 4, lineHeight: 1.3 }}>{got ? t("badge.got") : t(`badge.${b.id}.how`)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
