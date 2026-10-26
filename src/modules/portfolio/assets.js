// WHAT YOU CAN PRACTICE WITH — a small set of well-known examples, not
// recommendations. Three kinds, unlocked as you learn:
//   safe  — government T-bills (US) / CETES (Mexico)   after "Your first safe investment"
//   etf   — broad index funds                           after "A basket of companies"
//   stock — single companies                            after "Picking stocks is hard"
// Mexico sees its own (CETES, NAFTRAC, BMV companies) plus US-listed ones,
// which people in Mexico can buy through the SIC.
export const TYPES = ["safe", "etf", "stock"];
export const UNLOCKS = { safe: "compound-3", etf: "etf-1", stock: "risk-3" };

const A = (symbol, type, currency, name, short, extra = {}) => ({ symbol, type, currency, name, short, regions: ["US", "MX"], ...extra });
export const ASSETS = [
  A("SGOV", "safe", "USD", "iShares 0-3 Month Treasury Bond ETF", { en: "US government T-bills", es: "T-bills del gobierno de EE. UU." }),
  A("CETES28", "safe", "MXN", "CETES 28 días", { en: "Mexican government 28-day bills", es: "Préstamo al gobierno de México a 28 días" }, { regions: ["MX"], simulated: true }),
  A("VOO", "etf", "USD", "Vanguard S&P 500 ETF", { en: "500 big US companies", es: "500 grandes empresas de EE. UU." }),
  A("VTI", "etf", "USD", "Vanguard Total Stock Market ETF", { en: "The whole US stock market", es: "Toda la bolsa de EE. UU." }),
  A("VXUS", "etf", "USD", "Vanguard Total International Stock ETF", { en: "Companies outside the US", es: "Empresas fuera de EE. UU." }),
  A("BND", "etf", "USD", "Vanguard Total Bond Market ETF", { en: "US bonds — loans to governments and companies", es: "Bonos de EE. UU.: préstamos a gobiernos y empresas" }),
  A("NAFTRAC", "etf", "MXN", "iShares NAFTRAC", { en: "Big Mexican companies (S&P/BMV IPC)", es: "Grandes empresas mexicanas (S&P/BMV IPC)" }, { regions: ["MX"], exchange: "BMV" }),
  A("AAPL", "stock", "USD", "Apple", { en: "iPhone, Mac, services", es: "iPhone, Mac y servicios" }),
  A("NKE", "stock", "USD", "Nike", { en: "Sneakers and sportswear", es: "Tenis y ropa deportiva" }),
  A("KO", "stock", "USD", "Coca-Cola", { en: "Drinks", es: "Bebidas" }),
  A("DIS", "stock", "USD", "Disney", { en: "Movies, parks, streaming", es: "Películas, parques y streaming" }),
  A("NVDA", "stock", "USD", "NVIDIA", { en: "Chips for games and AI", es: "Chips para videojuegos e IA" }),
  A("MSFT", "stock", "USD", "Microsoft", { en: "Windows, Xbox, cloud", es: "Windows, Xbox y la nube" }),
  A("SPOT", "stock", "USD", "Spotify", { en: "Music streaming", es: "Streaming de música" }),
  A("WALMEX", "stock", "MXN", "Walmart de México", { en: "Stores (Walmart, Bodega Aurrera)", es: "Tiendas (Walmart, Bodega Aurrera)" }, { regions: ["MX"], exchange: "BMV" }),
  A("FEMSAUBD", "stock", "MXN", "FEMSA", { en: "OXXO stores and drinks", es: "Tiendas OXXO y bebidas" }, { regions: ["MX"], exchange: "BMV" }),
  A("BIMBOA", "stock", "MXN", "Grupo Bimbo", { en: "Bread and snacks", es: "Pan y botanas" }, { regions: ["MX"], exchange: "BMV" }),
  A("AMXB", "stock", "MXN", "América Móvil", { en: "Telcel and Claro phones", es: "Telcel y Claro" }, { regions: ["MX"], exchange: "BMV" }),
];
export const assetBySymbol = (s) => ASSETS.find((a) => a.symbol === s) || null;
export const assetsFor = (region) => ASSETS.filter((a) => a.regions.includes(region));
