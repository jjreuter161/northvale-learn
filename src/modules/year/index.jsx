// YOUR MONEY YEAR — one year of money decisions, a month at a time, in the
// Practice tab. The module is small: a row on Practice and a screen that
// loads (Year.jsx, then the months' text in content.js) only when opened, so
// the app starts as fast as before. The math is engine.js (tested).
import { Suspense, lazy } from "react";
import { registerModule } from "../../core/registry.js";
import { addStrings } from "../../core/i18n.js";
import { useSlice } from "../../core/store.js";
import { ListRow, Loading } from "../../core/ui.jsx";
import { MONTHS } from "./engine.js";

const S = (en, es) => ({ en, es });
addStrings({
  "yr.nav": S("Your Money Year", "Tu Año de Dinero"),
  "yr.title": S("Your Money Year", "Tu Año de Dinero"),
  "yr.row.sub": S("12 months, 12 choices. Example numbers.", "12 meses, 12 decisiones. Números de ejemplo."),
  "yr.row.resume": S("Continue: month {n} of 12", "Seguir: mes {n} de 12"),
});

const Year = lazy(() => import("./Year.jsx"));
const DEFAULTS = { run: null, history: [] };

function Row({ t, go }) {
  const slice = useSlice("year", DEFAULTS);
  const run = slice.run;
  const sub = run && run.month < MONTHS ? t("yr.row.resume", { n: run.month + 1 }) : t("yr.row.sub");
  return <ListRow icon="compass" title={t("yr.title")} sub={sub} onClick={() => go("year")} />;
}

function Screen(ctx) {
  return (
    <Suspense fallback={<Loading label={ctx.t("yr.title")} size={32} />}>
      <Year {...ctx} />
    </Suspense>
  );
}

registerModule({
  id: "year",
  nav: { tab: "practice", label: "yr.nav" },
  practice: { order: 1.5, Row },
  Screen,
});
