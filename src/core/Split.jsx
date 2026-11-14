// THE SETUP SPLIT — on a computer, the welcome screen, setup, sign-in and sign-up are two halves: the brand on the left
// (logo, tagline, one line on what Northvale does), the question on the right in a comfortable width. On a phone
// there is no left half: the screens are just the form, as they have always been. The same elements are used at
// every size (only the brand side comes and goes), so resizing the window never restarts setup.
import { Wordmark, BetaTag } from "./ui.jsx";

export default function Split({ t, phone, children }) {
  return (
    <div className={phone ? undefined : "nv-split"}>
      {!phone && (
        <aside className="nv-brand" style={{ "--head": "var(--onBrand)", "--low": "var(--onBrand)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Wordmark size={32} mark />
            <BetaTag label={t("common.beta")} />
          </div>
          <div>
            <p className="nv-disp" style={{ fontSize: 46, lineHeight: 1.06, margin: 0, color: "var(--onBrand)" }}>{t("brand.tagline")}</p>
            <p style={{ fontSize: 18, lineHeight: 1.5, margin: "18px 0 0", maxWidth: 420, color: "var(--onBrand)", opacity: 0.88 }}>{t("brand.line")}</p>
          </div>
          <p style={{ fontSize: 14, margin: 0, color: "var(--onBrand)", opacity: 0.85 }}>{t("brand.promise")}</p>
        </aside>
      )}
      <div className={phone ? undefined : "nv-formside"}>{children}</div>
    </div>
  );
}
