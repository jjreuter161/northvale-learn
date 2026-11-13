// CERTIFICATE TRACKS — groups of units; finishing every lesson in a track's
// units earns its certificate. Shared by the app and the server (which checks
// the finished lessons before it issues one). Every unit is in exactly one track.
import { T } from "../lessons/units/helpers.js";

export const TRACKS = [
  { id: "foundations", units: ["budget", "save", "banking", "paycheck", "credit"], title: T("Money Foundations", "Fundamentos del dinero"), blurb: T("Budgeting, saving, banking, your first paycheck and credit.", "Presupuesto, ahorro, bancos, tu primer sueldo y crédito.") },
  { id: "protect", units: ["scams", "taxes", "insurance", "psychology"], title: T("Protecting Your Money", "Cuida tu dinero"), blurb: T("Scams, taxes, insurance and the psychology behind money choices.", "Fraudes, impuestos, seguros y la psicología detrás de las decisiones de dinero.") },
  { id: "investing", units: ["compound", "stocks", "etf", "risk", "crypto"], title: T("Investing Basics", "Lo básico de invertir"), blurb: T("Compound interest, stocks, funds, risk and crypto.", "Interés compuesto, acciones, fondos, riesgo y cripto.") },
  { id: "future", units: ["retire", "earning", "news"], title: T("Your Money Future", "Tu futuro financiero"), blurb: T("Retirement, earning more and reading financial news.", "Retiro, ganar más y leer noticias financieras.") },
  { id: "borders", units: ["borders"], title: T("Money Across Borders", "Dinero entre fronteras"), blurb: T("Exchange rates, sending money, accounts and credit in two countries.", "Tipos de cambio, enviar dinero, cuentas y crédito en dos países.") },
];
export const trackById = (id) => TRACKS.find((t) => t.id === id) || null;
// The lesson ids a track needs, from a list of lessons ({ id, unit }).
export const lessonsOfTrack = (track, lessons) => lessons.filter((l) => track.units.includes(l.unit)).map((l) => l.id);
