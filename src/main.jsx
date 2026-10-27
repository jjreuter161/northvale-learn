// Which modules are in the app. Each registers itself with the core when
// imported; the order here doesn't matter (menu order comes from each
// module's nav.order). To add a module, import it here — see README.
import { createRoot } from "react-dom/client";
import App from "./core/App.jsx";
import "./modules/lessons/index.jsx";
import "./modules/portfolio/index.jsx";
import "./modules/goals/index.jsx";
import "./modules/missions/index.jsx";
import "./modules/news/index.jsx";
import "./modules/tutor/index.jsx";
import "./modules/classroom/index.jsx";
import "./modules/feedback/index.jsx";

createRoot(document.getElementById("root")).render(<App />);

// The service worker: offline use and reminders (also on this machine, to try them).
if ("serviceWorker" in navigator && (location.protocol === "https:" || ["localhost", "127.0.0.1"].includes(location.hostname))) navigator.serviceWorker.register("/sw.js").catch(() => {});
