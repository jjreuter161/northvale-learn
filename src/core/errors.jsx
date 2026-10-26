// ERROR REPORTS — when something breaks in the app, the message (and the
// first lines of where) goes to the server so it shows on the admin page
// (and, with a webhook set, in your chat). No personal data is included.
import { Component } from "react";

const VERSION = "1.1";
let sent = 0;
export function report(err, screen) {
  if (sent++ > 20) return; // a broken loop shouldn't flood the server
  const e = err instanceof Error ? err : new Error(String(err && err.message ? err.message : err));
  fetch("/api/errors", { method: "POST", headers: { "X-Northvale": "1", "Content-Type": "application/json" }, body: JSON.stringify({ message: e.message, stack: String(e.stack || "").slice(0, 1500), screen, version: VERSION }), keepalive: true }).catch(() => {});
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => report(e.error || e.message));
  window.addEventListener("unhandledrejection", (e) => report(e.reason));
}

// A screen that crashes shows a calm message instead of a blank page.
export class Boundary extends Component {
  state = { broken: false };
  static getDerivedStateFromError() {
    return { broken: true };
  }
  componentDidCatch(error) {
    report(error, this.props.screen);
  }
  componentDidUpdate(prev) {
    if (prev.screen !== this.props.screen && this.state.broken) this.setState({ broken: false });
  }
  render() {
    if (!this.state.broken) return this.props.children;
    return (
      <div style={{ padding: "40px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 650, margin: "0 0 8px" }}>{this.props.t("error.title")}</p>
        <p style={{ color: "var(--mid)", margin: "0 0 16px" }}>{this.props.t("error.body")}</p>
        <button onClick={() => location.reload()} style={{ border: "none", borderRadius: 12, padding: "12px 18px", background: "var(--brand)", color: "var(--onBrand)", fontWeight: 650, fontSize: 15, cursor: "pointer" }}>
          {this.props.t("error.reload")}
        </button>
      </div>
    );
  }
}
