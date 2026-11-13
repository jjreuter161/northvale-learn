// SCREEN SIZE — which layout to draw: "phone" (under 600px wide: the one column and bottom tabs we've always
// had), "tablet" (600–1023: wider content, two columns where it helps), "desktop" (1024 and up: a sidebar
// instead of the bottom tabs) and "wide" (1180 and up: desktop plus a panel on Today). These are CSS pixels,
// so zooming a laptop browser to 200% (about 683px) lands on the tablet layout, as it should.
import { useEffect, useState } from "react";

const SIZES = [["(min-width: 1180px)", "wide"], ["(min-width: 1024px)", "desktop"], ["(min-width: 600px)", "tablet"]];
const now = () => (typeof matchMedia === "function" && (SIZES.find(([q]) => matchMedia(q).matches) || [])[1]) || "phone";

export const isDesk = (layout) => layout === "desktop" || layout === "wide";

export function useLayout() {
  const [layout, setLayout] = useState(now);
  useEffect(() => {
    const on = () => setLayout(now());
    const ms = SIZES.map(([q]) => matchMedia(q));
    ms.forEach((m) => m.addEventListener("change", on));
    on();
    return () => ms.forEach((m) => m.removeEventListener("change", on));
  }, []);
  return layout;
}
