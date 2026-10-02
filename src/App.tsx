import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from "react";
import { createBrowserRouter, Link, NavLink, Outlet, RouterProvider, useLocation, useNavigate, useSearchParams } from "react-router";

const API = "https://api.coinlore.net/api/tickers/";
const SIZE = 100;
const CONTACT = "https://wa.me/923200276941";
const WEBSITE_CONTACT = "https://wa.me/923062664430";
const validPair = (value: string) => /^[A-Z0-9_]+:[A-Z0-9_.!/-]+$/.test(value);

function WebsiteEnquiryDialog({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  const [readyLink, setReadyLink] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const text = (name: string) => String(fields.get(name) ?? "").trim();
    for (const name of ["name", "details"]) {
      const field = event.currentTarget.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement;
      if (text(name).length < (name === "details" ? 10 : 1)) { field.setCustomValidity(name === "details" ? "Please describe your project in at least 10 characters." : "Please enter your name."); field.reportValidity(); return; }
    }
    const message = ["Website enquiry — MBK Global Market", "", `Name: ${text("name")}`, `WhatsApp / phone: ${text("phone")}`, `Email: ${text("email") || "Not provided"}`, `Website type: ${text("websiteType")}`, "", "Project details:", text("details")].join("\n");
    const url = `${WEBSITE_CONTACT}?text=${encodeURIComponent(message)}`;
    setReadyLink(url);
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const inputClass = "mt-2 min-h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
  return <dialog ref={dialogRef} aria-labelledby="website-enquiry-title" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border-0 bg-white p-0 text-neutral-900 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm">
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-700">WEBSITE ENQUIRY</span><h2 id="website-enquiry-title" className="mt-3 font-[Manrope] text-2xl font-medium">Need a website like this?</h2></div><button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close website enquiry form" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100"><Icon name="close"/></button></div>
      <p className="mt-3 text-sm leading-6 text-neutral-600">Portfolio ho ya business website—apni requirements batayein, hum bana denge.</p>
      <form onSubmit={submit} onChange={() => setReadyLink("")} onInput={event => { const field = event.target; if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) field.setCustomValidity(""); }} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-neutral-600">Your name<input name="name" required maxLength={100} autoComplete="name" placeholder="Full name" className={inputClass}/></label><label className="text-xs font-semibold text-neutral-600">WhatsApp / phone<input name="phone" type="tel" required pattern={"[+0-9\\s\\(\\)\\-]{7,20}"} minLength={7} title="Enter a phone number with 7–20 characters; digits, +, spaces, brackets and hyphens are accepted." maxLength={20} autoComplete="tel" placeholder="03xx xxxxxxx" className={inputClass}/></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-neutral-600">Website type<select name="websiteType" required defaultValue="" className={inputClass}><option value="" disabled>Select a type</option><option>Portfolio</option><option>Business website</option><option>Online store</option><option>Landing page</option><option>Other / not sure</option></select></label><label className="text-xs font-semibold text-neutral-600">Email <span className="font-normal">(optional)</span><input name="email" type="email" maxLength={150} autoComplete="email" placeholder="you@example.com" className={inputClass}/></label></div>
        <label className="block text-xs font-semibold text-neutral-600">What would you like to build?<textarea name="details" required minLength={10} maxLength={1500} rows={3} placeholder="Pages, features, design ideas, and any deadline…" className={inputClass + " resize-y py-3"}/></label>
        <button type="submit" className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900"><span className="flex items-center gap-2"><Icon name="chat" size={16}/> Continue on WhatsApp</span><span aria-hidden="true">↗</span></button>
        <p className="text-[11px] leading-5 text-neutral-500">All form details open as a WhatsApp message to 03062664430. Review it and press Send. No enquiry data is saved on this website.</p>
        {readyLink && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs leading-6 text-emerald-900">Message ready. If WhatsApp did not open, <a href={readyLink} target="_blank" rel="noopener noreferrer" className="font-semibold underline">open your prepared message here</a>.</p>}
      </form>
    </div>
  </dialog>;
}

function CoursesPage() {
  const tracks = [
    { name: "Regular Group", label: "BUILD YOUR FOUNDATION", copy: "Understand the essentials before taking your next step in the market.", topics: ["Forex & crypto fundamentals", "Technical analysis basics", "Risk & trading psychology"] },
    { name: "Premium Group", label: "REFINE YOUR APPROACH", copy: "Bring structure to your analysis with a more focused learning experience.", topics: ["Advanced market analysis", "Guided chart practice", "Personal learning support"] },
  ];
  return <section className="py-10 sm:py-14">
    <div className="grid items-end gap-6 border-b border-neutral-200 pb-8 lg:grid-cols-[1.25fr_1fr]">
      <div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-emerald-600">MBK TRADING EDUCATION</span>
        <h1 className="mt-4 max-w-2xl font-[Manrope] text-4xl font-medium leading-[1.12] text-neutral-950 sm:text-5xl">Learn the market.<br/><span className="text-emerald-700">Trade with discipline.</span></h1>
      </div>
      <p className="max-w-md text-sm leading-7 text-neutral-600 lg:justify-self-end">Forex & crypto education. Charts, risk management, and a clear trading process.</p>
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      {tracks.map((track, index) => <article key={track.name} className={`relative flex flex-col overflow-hidden rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 motion-reduce:transform-none sm:p-9 ${index === 1 ? "border-neutral-900 bg-neutral-950 text-white" : "border-neutral-200 bg-white text-neutral-950"}`}>
        <div className="flex items-center justify-between gap-4"><span className={`text-[10px] font-semibold tracking-[0.16em] ${index === 1 ? "text-emerald-300" : "text-emerald-700"}`}>{track.label}</span><span aria-hidden="true" className={`font-mono text-3xl font-light ${index === 1 ? "text-neutral-600" : "text-neutral-300"}`}>0{index + 1}</span></div>
        <h2 className="mt-7 font-[Manrope] text-3xl font-medium">{track.name}</h2>
        <p className={`mt-3 max-w-sm text-sm leading-7 ${index === 1 ? "text-neutral-400" : "text-neutral-500"}`}>{track.copy}</p>
        <ul className={`my-6 space-y-3 border-t pt-6 text-sm ${index === 1 ? "border-white/10 text-neutral-300" : "border-neutral-100 text-neutral-600"}`}>{track.topics.map(topic => <li key={topic} className="flex items-center gap-3"><span aria-hidden="true" className={index === 1 ? "text-emerald-300" : "text-emerald-600"}>✓</span>{topic}</li>)}</ul>
        <a href={CONTACT + "?text=" + encodeURIComponent(`Hi MBK, I would like details about the ${track.name} and the next available batch.`)} target="_blank" rel="noopener noreferrer" className={`mt-auto flex min-h-12 items-center justify-between gap-3 rounded-lg px-5 text-sm font-semibold transition ${index === 1 ? "bg-emerald-800 text-white hover:bg-emerald-700" : "bg-neutral-100 text-neutral-900 hover:bg-emerald-50"}`}><span className="flex items-center gap-2"><Icon name="chat" size={17}/> Enquire on WhatsApp</span><span aria-hidden="true">↗</span></a>
      </article>)}
    </div>

    <section aria-labelledby="course-faq-heading" className="mt-10 grid gap-6 border-t border-neutral-200 pt-8 lg:grid-cols-[.65fr_1.35fr]">
      <div><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-700">COURSE FAQ</span><h2 id="course-faq-heading" className="mt-3 font-[Manrope] text-2xl font-medium text-neutral-900 sm:text-3xl">Before you join.</h2><p className="mt-3 max-w-xs text-sm leading-7 text-neutral-600">A few answers to help you choose your next step.</p><a href={CONTACT + "?text=" + encodeURIComponent("Hi MBK, I have a question about the trading courses.")} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-emerald-800"><Icon name="chat" size={15}/> Ask on WhatsApp ↗</a></div>
      <div className="divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white px-5 sm:px-6">
        {[
          ["Which group should I choose?", "Regular covers the foundations. Premium focuses on advanced analysis and guided practice. Contact MBK to discuss your experience."],
          ["Can I start as a beginner?", "The Regular Group covers market fundamentals and technical analysis basics. Share your experience on WhatsApp to confirm whether it fits your starting point."],
          ["What topics are covered?", "Regular focuses on forex and crypto fundamentals, technical analysis, risk management, and trading psychology. Premium focuses on advanced analysis, guided chart practice, and personal learning support."],
          ["How do I join?", "Message 03200276941 on WhatsApp for the next batch, learning format, and enrolment details."],
          ["When does the next batch start?", "Batch dates and availability are confirmed directly on WhatsApp. Ask about your preferred group before making plans."],
          ["Are sessions online or in person?", "Contact MBK to confirm the delivery format, session timings, and access requirements for the available batch."],
          ["How long is the course?", "Duration and session frequency depend on the group and batch. Request the current schedule and course outline before joining."],
          ["Are recordings or learning materials included?", "Ask which materials, recordings, and practice resources are included in your selected batch. Availability has not been confirmed on this website."],
          ["Do I need to trade with real money to learn?", "You can study charts and practise risk-management concepts without placing real-money trades. Confirm any account or software requirements for the group before joining."],
          ["Can I get help choosing a group?", "Yes—message your current experience and learning goals on WhatsApp to discuss the Regular and Premium options."],
          ["Does training guarantee profits?", "No. Trading involves risk. Education helps you understand analysis and risk management; it does not guarantee returns."],
        ].map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-sm font-semibold text-neutral-800 [&::-webkit-details-marker]:hidden"><span>{question}</span><span aria-hidden="true" className="shrink-0 text-lg font-normal text-emerald-700 transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span></summary><p className="max-w-2xl pb-4 text-sm leading-7 text-neutral-600">{answer}</p></details>)}
      </div>
    </section>
  </section>;
}

type Coin = {
  id: string; symbol: string; name: string; nameid?: string; rank: string; price_usd: string;
  percent_change_1h: string; percent_change_24h: string; percent_change_7d: string;
  market_cap_usd: string; volume24: number;
};
type Sort = "rank" | "name" | "price_usd" | "percent_change_24h" | "market_cap_usd";
type Filter = "all" | "top" | "gainers" | "losers" | "saved";

function coinMatchesQuery(coin: Coin, query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  const words = term.match(/[a-z0-9]+/g) ?? [];
  if (!words.length) return false;
  const searchable = `${coin.name} ${coin.symbol}`.toLowerCase();
  if (words.every(word => searchable.includes(word))) return true;
  const pair = term.replace(/^[a-z0-9_]+:/, "").replace(/[\s/$]/g, "");
  const base = pair.match(/^([a-z0-9]+?)(?:usdt|usdc|usd|eur)$/)?.[1];
  return base !== undefined && coin.symbol.toLowerCase() === base;
}

type DirectorySnapshot = { coins: Coin[]; received: number };
let searchCache: DirectorySnapshot | null = null;
let directoryRequest: Promise<DirectorySnapshot> | null = null;
let directoryProgress = { loaded: 0, total: 0 };
const directoryListeners = new Set<() => void>();
function getDirectory(): Promise<DirectorySnapshot> {
  if (searchCache && Date.now() - searchCache.received < 300000) return Promise.resolve(searchCache);
  if (directoryRequest) return directoryRequest;
  directoryRequest = (async () => {
    const controller = new AbortController();
    const fetchPage = async (start: number) => {
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(`${API}?start=${start}&limit=${SIZE}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`CoinLore directory request failed (${response.status}). Please retry.`);
        const result = await response.json();
        if (!Array.isArray(result.data) || result.data.some((coin: Coin) => !coin || typeof coin.id !== "string" || typeof coin.name !== "string" || typeof coin.symbol !== "string")) throw new Error("Invalid CoinLore directory response.");
        return result as { data: Coin[]; info: { coins_num: number } };
      } finally { clearTimeout(timeout); }
    };
    directoryProgress = { loaded: 0, total: 0 };
    directoryListeners.forEach(listener => listener());
    try {
      const first = await fetchPage(0);
      const count = numeric(first.info?.coins_num);
      if (count === null || !Number.isSafeInteger(count) || count < 0) throw new Error("Invalid directory size.");
      const byId = new Map(first.data.map(coin => [coin.id, coin]));
      directoryProgress = { loaded: byId.size, total: count };
      directoryListeners.forEach(listener => listener());
      let nextStart = SIZE;
      const worker = async () => {
        while (nextStart < count) {
          const start = nextStart; nextStart += SIZE;
          const result = await fetchPage(start);
          result.data.forEach(coin => byId.set(coin.id, coin));
          directoryProgress = { loaded: byId.size, total: count };
          directoryListeners.forEach(listener => listener());
        }
      };
      await Promise.all([worker(), worker(), worker()]);
      searchCache = { coins: [...byId.values()], received: Date.now() };
      return searchCache;
    } catch (reason) {
      controller.abort();
      throw new Error((reason as Error).name === "AbortError" ? "Directory loading timed out. Please retry." : (reason as Error).message);
    }
  })().finally(() => { directoryRequest = null; });
  return directoryRequest;
}

function useDirectorySearch(enabled: boolean) {
  const [snapshot, setSnapshot] = useState<DirectorySnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(directoryProgress);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const update = () => setProgress({ ...directoryProgress });
    directoryListeners.add(update);
    setLoading(true); setError("");
    const timer = setTimeout(() => {
      getDirectory().then(result => { if (!cancelled) setSnapshot(result); }).catch(reason => { if (!cancelled) setError((reason as Error).message); }).finally(() => { if (!cancelled) setLoading(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); directoryListeners.delete(update); };
  }, [enabled, retry]);
  return { snapshot, loading: enabled && (loading || (!snapshot && !error)), error, progress, reload: () => { searchCache = null; setRetry(value => value + 1); } };
}

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const icons: Record<string, React.ReactNode> = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/></>,
    activity: <path d="M3 12h4l2-7 4 14 2-7h6"/>,
    trend: <><path d="m3 17 6-6 4 4 8-9"/><path d="M16 6h5v5"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2 5.5"/><path d="M20 4v7h-7"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name]}</svg>;
}

function numeric(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  if (typeof value !== "number" && typeof value !== "string") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
function money(value: string | number | null | undefined, compact = false) {
  const n = numeric(value);
  if (n === null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    notation: compact && Math.abs(n) >= 1e6 ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : n < .01 ? 6 : n < 1 ? 4 : 2,
  }).format(n);
}
function Change({ value }: { value: string }) {
  const n = numeric(value);
  if (n === null) return <span className="muted">—</span>;
  return <span className={n >= 0 ? "change up" : "change down"}>{n >= 0 ? "+" : ""}{n.toFixed(2)}%</span>;
}
function Mark({ coin }: { coin: Coin }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [coin.nameid]);
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-white">
    {coin.nameid && !failed ? <img src={`https://www.coinlore.com/img/25x25/${encodeURIComponent(coin.nameid)}.png`} alt={`${coin.name} logo`} width={28} height={28} loading="lazy" decoding="async" onError={() => setFailed(true)} className="h-7 w-7 object-contain"/> :
      <span title="Logo unavailable from provider" aria-label={`${coin.name} logo unavailable`} className="text-neutral-400"><Icon name="layers" size={16}/></span>}
  </span>;
}

function LiveMarketChart({ symbol, notice }: { symbol: string | null; notice: string }) {
  const [interval, setInterval] = useState("60");
  const [activeSymbol, setActiveSymbol] = useState(symbol);
  const [loadedFrame, setLoadedFrame] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    setActiveSymbol(symbol);
  }, [symbol]);

  const params = new URLSearchParams({
    symbol: activeSymbol ?? "", interval, style: "1",
    theme: "light", locale: "en", timezone: "Etc/UTC",
    hide_top_toolbar: "false", hide_side_toolbar: "false", withdateranges: "false",
    allow_symbol_change: "true", save_image: "false", enable_publishing: "false",
    backgroundColor: "#ffffff",
  });
  const chartUrl = "https://s.tradingview.com/widgetembed/?" + params.toString();
  const frameKey = chartUrl + revision;

  return <section id="live-charts" aria-label="TradingView market chart" className="mb-12 scroll-mt-24 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_32px_#17171708]">
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-100 bg-neutral-50/60 p-3 sm:gap-4 sm:p-4">
      <div className="flex w-full items-center justify-between gap-1 rounded-xl border border-neutral-200 bg-white p-1 xl:w-auto" aria-label="Chart timeframe">
        {[["1", "1m"], ["15", "15m"], ["60", "1h"], ["240", "4h"], ["D", "1D"], ["W", "1W"]].map(([value, label]) => <button key={value} onClick={() => setInterval(value)} aria-pressed={interval === value}
          className={"min-h-10 flex-1 rounded-lg px-3 text-xs font-semibold transition " + (interval === value ? "bg-emerald-600 text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900")}>{label}</button>)}
      </div>
    </div>
    {notice && <p role="status" className="border-b border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800">{notice}</p>}
    <div className="relative h-[430px] sm:h-[540px] lg:h-[580px]">
      {!activeSymbol ? <div role="status" className="flex h-full items-center justify-center bg-neutral-50 px-6 text-center text-sm leading-relaxed text-neutral-500">{notice || "Select a market to open its chart."}</div> : <>
        {loadedFrame !== frameKey && <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center bg-neutral-50 text-sm text-neutral-500">Loading TradingView chart…</div>}
        <iframe key={frameKey} src={chartUrl} title={activeSymbol + " TradingView chart"} onLoad={() => setLoadedFrame(frameKey)} className="relative h-full w-full border-0" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>
      </>}
    </div>
  </section>;
}

function MarketWorkspace() {
  const websiteDialog = useRef<HTMLDialogElement | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHome = location.pathname === "/";
  const isCourses = location.pathname === "/courses";
  const isCharts = location.pathname === "/live-charts";
  const isMarketPage = isHome || location.pathname === "/coins";
  const limit = SIZE;
  const [chartSymbol, setChartSymbol] = useState<string | null>("BINANCE:BTCUSDT");
  const [chartNotice, setChartNotice] = useState("");
  const chartRequest = useRef<AbortController | null>(null);
  useEffect(() => () => chartRequest.current?.abort(), []);
  const requestId = useRef(0);
  const marketRequest = useRef<AbortController | null>(null);
  useEffect(() => () => marketRequest.current?.abort(), []);
  const [coins, setCoins] = useState<Coin[]>([]);
  const requestedPage = Number(searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const [total, setTotal] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const isSearching = query.trim().length > 0;
  const directory = useDirectorySearch(isMarketPage && isSearching);
  const [resultPage, setResultPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<{ key: Sort; dir: 1 | -1 }>({ key: "rank", dir: 1 });
  useEffect(() => { setResultPage(1); }, [query, filter, sort]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState<Date | null>(null);
  const [menu, setMenu] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem("mbk-watchlist") ?? "[]");
      return Array.isArray(stored) ? [...new Set(stored.filter((id): id is string => typeof id === "string"))] : [];
    } catch { return []; }
  });
  const [storageNotice, setStorageNotice] = useState("");
  const [checked, setChecked] = useState<Date | null>(null);
  useEffect(() => {
    try { localStorage.setItem("mbk-watchlist", JSON.stringify(saved)); setStorageNotice(""); }
    catch { setStorageNotice("Watchlist is available for this session only; browser storage is disabled."); }
  }, [saved]);
  const toggleSaved = (id: string) => setSaved(current => current.includes(id) ? current.filter(value => value !== id) : [...current, id]);
  useEffect(() => {
    document.title = `${isCourses ? "Courses" : isCharts ? "Live charts" : isHome ? "Crypto markets" : "Coins"} | MBK Global Market`;
    const closeMenu = (event: KeyboardEvent) => { if (event.key === "Escape") setMenu(false); };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [isCourses, isCharts, isHome]);
  const pages = Math.max(1, Math.ceil((total ?? 0) / SIZE));
  useEffect(() => {
    if (location.pathname !== "/coins") return;
    const normalized = total === null ? page : Math.min(page, pages);
    if (requestedPage !== normalized) setSearchParams({ page: String(normalized) }, { replace: true });
  }, [location.pathname, requestedPage, page, pages, total, setSearchParams]);
  const urlSymbol = searchParams.get("symbol");
  useEffect(() => {
    if (!isCharts) { chartRequest.current?.abort(); return; }
    if (urlSymbol) {
      chartRequest.current?.abort();
      const pair = urlSymbol.toUpperCase();
      setChartSymbol(validPair(pair) ? pair : null);
      setChartNotice(validPair(pair) ? "" : "Invalid chart pair. Enter an exchange pair above.");
    }
  }, [isCharts, urlSymbol]);

  const load = useCallback(async (target: number, signal?: AbortSignal) => {
    const currentRequest = ++requestId.current;
    marketRequest.current?.abort();
    const controller = new AbortController();
    marketRequest.current = controller;
    const abort = () => controller.abort();
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) controller.abort();
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 15000);
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API}?start=${(target - 1) * limit}&limit=${limit}`, { signal: controller.signal });
      if (!response.ok) throw new Error();
      const result = await response.json();
      const count = numeric(result.info?.coins_num);
      if (!Array.isArray(result.data) || count === null || count < 0 || !Number.isInteger(count) || result.data.some((coin: Coin) => !coin || typeof coin.id !== "string" || typeof coin.name !== "string" || typeof coin.symbol !== "string")) throw new Error();
      if (signal?.aborted || currentRequest !== requestId.current) return;
      setCoins(result.data); setTotal(count);
      setChecked(new Date());
      const timestamp = numeric(result.info?.time);
      setUpdated(timestamp !== null && timestamp > 0 && Number.isFinite(new Date(timestamp * 1000).getTime()) ? new Date(timestamp * 1000) : null);
    } catch (reason) {
      if (currentRequest === requestId.current && !signal?.aborted && (timedOut || (reason as Error).name !== "AbortError")) setError(timedOut ? "CoinLore took too long to respond. Please try again." : "CoinLore data is unavailable or invalid. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
      if (!signal?.aborted && currentRequest === requestId.current) setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (!isMarketPage) { marketRequest.current?.abort(); setLoading(false); return; }
    const controller = new AbortController();
    load(isHome ? 1 : page, controller.signal);
    return () => controller.abort();
  }, [page, load, isHome, isMarketPage]);

  useEffect(() => {
    setMenu(false); setQuery(""); setFilter("all");
    if (!location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    else requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" }));
  }, [location.pathname, location.hash]);

  const allRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = (isSearching ? directory.snapshot?.coins ?? [] : coins).filter(c => coinMatchesQuery(c, q));
    if (filter === "top") result = result.filter(c => { const rank = numeric(c.rank); return rank !== null && rank > 0 && rank <= 100; });
    if (filter === "gainers") result = result.filter(c => { const change = numeric(c.percent_change_24h); return change !== null && change > 0; });
    if (filter === "losers") result = result.filter(c => { const change = numeric(c.percent_change_24h); return change !== null && change < 0; });
    if (filter === "saved") result = result.filter(c => saved.includes(c.id));
    return result.sort((a, b) => {
      const av = sort.key === "name" ? a.name : numeric(a[sort.key]);
      const bv = sort.key === "name" ? b.name : numeric(b[sort.key]);
      if (av === null) return bv === null ? 0 : 1;
      if (bv === null) return -1;
      const delta = typeof av === "string" ? av.localeCompare(String(bv)) : av - Number(bv);
      return delta * sort.dir;
    });
  }, [coins, filter, query, sort, saved, isSearching, directory.snapshot]);
  const resultPages = Math.max(1, Math.ceil(allRows.length / SIZE));
  const activeResultPage = Math.min(resultPage, resultPages);
  const rows = isSearching ? allRows.slice((activeResultPage - 1) * SIZE, activeResultPage * SIZE) : allRows;
  const displayLoading = isSearching ? directory.loading : loading;
  const displayError = isSearching ? directory.error : error;

  const stats = useMemo(() => {
    const sum = (key: "market_cap_usd" | "volume24") => !coins.length || coins.some(coin => numeric(coin[key]) === null) ? null : coins.reduce((sum, coin) => sum + numeric(coin[key])!, 0);
    const changes = coins.map(coin => numeric(coin.percent_change_24h)).filter((value): value is number => value !== null);
    return { cap: sum("market_cap_usd"), volume: sum("volume24"), breadth: changes.length ? `${Math.round(changes.filter(value => value > 0).length / changes.length * 100)}%` : "—" };
  }, [coins]);
  const pageList = useMemo(() => [...new Set([1, page - 2, page - 1, page, page + 1, page + 2, pages])].filter(n => n > 0 && n <= pages).sort((a, b) => a - b), [page, pages]);
  const go = (n: number) => {
    if (!Number.isFinite(n) || loading) return;
    const next = Math.max(1, Math.min(pages, Math.trunc(n)));
    if (next === page) return;
    setSearchParams({ page: String(next) }); setQuery("");
    document.getElementById("markets")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const sortBy = (key: Sort) => setSort(s => s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "rank" || key === "name" ? 1 : -1 });
  const sortDirection = (key: Sort) => sort.key === key ? (sort.dir === 1 ? "ascending" as const : "descending" as const) : "none" as const;
  const sortArrow = (key: Sort) => sort.key === key ? (sort.dir === 1 ? " ↑" : " ↓") : "";
  const showChart = async (coin: Coin) => {
    chartRequest.current?.abort();
    const controller = new AbortController();
    chartRequest.current = controller;
    setChartSymbol(null);
    setChartNotice(`Finding an exchange market for ${coin.name} (${coin.symbol})…`);
    navigate("/live-charts");
    const timeout = window.setTimeout(() => {
      if (chartRequest.current !== controller || controller.signal.aborted) return;
      controller.abort();
      setChartNotice("Exchange lookup timed out. Enter an exact exchange pair above or retry from the coin directory.");
    }, 15000);
    try {
      const response = await fetch(`https://api.coinlore.net/api/coin/markets/?id=${encodeURIComponent(coin.id)}`, { signal: controller.signal });
      if (!response.ok) throw new Error("Market lookup failed");
      const markets: unknown = await response.json();
      if (!Array.isArray(markets)) throw new Error("Invalid market response");
      const exchanges: Record<string, string> = {
        binance: "BINANCE", "coinbase pro": "COINBASE", coinbase: "COINBASE",
        kraken: "KRAKEN", kucoin: "KUCOIN", okex: "OKX", okx: "OKX",
        bybit: "BYBIT", bitstamp: "BITSTAMP", bitfinex: "BITFINEX",
        gemini: "GEMINI", mexc: "MEXC", "gate.io": "GATEIO",
      };
      const preference = ["BINANCE", "COINBASE", "KRAKEN", "KUCOIN", "OKX", "BYBIT"];
      const candidates = markets.flatMap(market => {
        if (!market || typeof market.name !== "string" || typeof market.base !== "string" || typeof market.quote !== "string") return [];
        const exchange = exchanges[market.name.trim().toLowerCase()];
        const base = market.base.toUpperCase();
        const quote = market.quote.toUpperCase();
        if (!exchange || base !== coin.symbol.toUpperCase() || !/^[A-Z0-9]+$/.test(base + quote) || !quote) return [];
        return [{ symbol: `${exchange}:${base}${quote}`, score: (quote === "USDT" || quote === "USD" ? 0 : 100) + (preference.includes(exchange) ? preference.indexOf(exchange) : 20), volume: numeric(market.volume_usd) ?? 0 }];
      }).sort((first, second) => first.score - second.score || second.volume - first.volume);
      if (controller.signal.aborted) return;
      if (!candidates.length) {
        setChartNotice(`No supported exchange chart was found for ${coin.name} (${coin.symbol}). You can search an exact TradingView pair above. No unrelated coin or dummy data is shown.`);
        return;
      }
      setChartSymbol(candidates[0].symbol);
      navigate(`/live-charts?${new URLSearchParams({ symbol: candidates[0].symbol })}`, { replace: true });
      setChartNotice(`${coin.name} (${coin.symbol}) · ${candidates[0].symbol} · Market listed by CoinLore. Chart coverage depends on TradingView.`);
    } catch {
      if (!controller.signal.aborted) setChartNotice(`Could not load exchange markets for ${coin.name}. Click its Chart button to retry, or search its exact exchange pair above.`);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  return <div className="app-shell">
    <a href="#top" aria-label="Skip to main content" className="sr-only">Skip to content</a>
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-[42px]">
        <Link to="/" aria-label="MBK Global Market home" className="shrink-0 font-[Manrope] text-base font-bold text-neutral-950 sm:text-lg">MBK <span className="font-medium text-emerald-700">Global Market</span></Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
          {[["/", "Home"], ["/coins", "Coins"], ["/live-charts", "Live charts"], ["/courses", "Courses"]].map(([path, label]) => <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => `flex min-h-11 items-center rounded-lg px-4 text-xs font-semibold transition ${isActive ? "bg-emerald-50 text-emerald-800" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-950"}`}>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-2"><button type="button" onClick={() => websiteDialog.current?.showModal()} className="hidden min-h-11 items-center gap-2 rounded-lg bg-neutral-950 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 sm:inline-flex">Need a website? ↗</button><button className="flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 md:hidden" onClick={() => setMenu(!menu)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mobile-navigation"><Icon name={menu ? "close" : "menu"}/></button></div>
      </div>
      {menu && <nav id="mobile-navigation" aria-label="Mobile navigation" className="grid grid-cols-2 gap-2 border-t border-neutral-100 p-4 md:hidden" onClick={() => setMenu(false)}>{[["/", "Home"], ["/coins", "Coins"], ["/live-charts", "Live charts"], ["/courses", "Courses"]].map(([path, label]) => <NavLink key={path} to={path} end={path === "/"} className={({ isActive }) => `flex min-h-12 items-center rounded-lg px-4 text-sm font-semibold ${isActive ? "bg-emerald-50 text-emerald-800" : "bg-neutral-50 text-neutral-600"}`}>{label}</NavLink>)}<button type="button" onClick={event => { event.stopPropagation(); setMenu(false); websiteDialog.current?.showModal(); }} className="col-span-2 flex min-h-12 items-center justify-between rounded-lg bg-neutral-950 px-4 text-sm font-semibold text-white">Need a website? <span aria-hidden="true">↗</span></button></nav>}
    </header>
    <WebsiteEnquiryDialog dialogRef={websiteDialog}/>

    <main id="top">
      {isHome && <section className="grid gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:py-14">
        <div className="min-w-0"><div className="mb-6 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500"><span className="h-px w-8 bg-emerald-700"/> THE MBK MARKET DESK</div><h1 className="max-w-2xl font-[Manrope] text-[clamp(2.8rem,5.8vw,5.5rem)] font-medium leading-[1.04] tracking-[-.02em] text-neutral-950">The market.<br/><span className="text-emerald-700">In perspective.</span></h1><p className="mt-6 max-w-sm text-sm leading-7 text-neutral-600">Follow crypto prices, compare performance, and open the charts that matter.</p><div className="mt-7 flex flex-wrap items-center gap-3"><a href="#markets" className="inline-flex min-h-12 items-center gap-7 rounded-lg bg-neutral-950 px-5 text-xs font-semibold text-white transition hover:bg-emerald-800">Explore the market <span aria-hidden="true">↓</span></a><Link to="/live-charts" className="inline-flex min-h-12 items-center gap-3 rounded-lg px-4 text-xs font-semibold text-neutral-700 hover:bg-white"><Icon name="activity" size={15}/> Open charts ↗</Link></div></div>
        <div className="overflow-hidden rounded-2xl bg-neutral-950 text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-7"><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-neutral-400">Market leaders</span><span className="text-[10px] text-neutral-400">Price / 24h</span></div>
          <div aria-busy={loading} className="min-h-56 px-6 sm:px-7">
            {loading ? <div role="status" className="flex min-h-56 items-center justify-center text-xs text-neutral-400">Fetching CoinLore prices…</div> : error ? <div role="status" className="flex min-h-56 items-center justify-center text-xs text-neutral-400">Market data unavailable</div> : coins.slice(0, 3).map(coin => <div key={coin.id} className="flex items-center justify-between gap-4 border-b border-white/10 py-5 last:border-b-0"><div className="flex min-w-0 items-center gap-3"><Mark coin={coin}/><div className="min-w-0"><p className="truncate text-sm font-semibold">{coin.name}</p><p className="mt-1 text-[10px] text-neutral-400">{coin.symbol}</p></div></div><div className="shrink-0 text-right"><p className="font-mono text-sm font-medium">{money(coin.price_usd)}</p><p className={`mt-1 font-mono text-[11px] ${numeric(coin.percent_change_24h) === null ? "text-neutral-400" : Number(coin.percent_change_24h) >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{numeric(coin.percent_change_24h) === null ? "—" : `${Number(coin.percent_change_24h) >= 0 ? "+" : ""}${Number(coin.percent_change_24h).toFixed(2)}%`}</p></div></div>)}
          </div><div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-4 text-[10px] text-neutral-400 sm:px-7"><span>Source: CoinLore · USD</span><span>{checked && !error ? `Checked ${checked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Awaiting prices"}</span></div>
        </div>
      </section>}
      {isCharts && <section className="flex flex-wrap items-end justify-between gap-5 border-b border-neutral-200 pt-9 pb-7 sm:pt-12"><div><span className="text-[10px] font-semibold uppercase tracking-[.16em] text-emerald-700">CHART WORKSPACE</span><h1 className="mt-3 font-[Manrope] text-3xl font-medium text-neutral-950 sm:text-4xl">A closer look at the market.</h1></div><p className="max-w-xs text-xs leading-6 text-neutral-500">Search a coin or exchange pair.<br/>Choose your view and timeframe.</p></section>}

      {location.pathname === "/coins" && <section className="overview" id="overview">
        {[
          ["globe", "blue", "Listed assets", total?.toLocaleString() ?? "—", total === null ? "Awaiting API response" : `Across ${pages} pages`],
          ["layers", "violet", "Page market cap", loading || error ? "—" : money(stats.cap, true), "Calculated from page data"],
          ["activity", "cyan", "Page 24h volume", loading || error ? "—" : money(stats.volume, true), "Calculated from page data"],
          ["trend", "green", "Market breadth", loading || error ? "—" : stats.breadth, "Gainers among reported changes"],
        ].map(x => <article className="stat-card" key={x[2]}><span className={`stat-icon ${x[1]}`}><Icon name={x[0]}/></span><div><span>{x[2]}</span><strong>{x[3]}</strong><small>{x[4]}</small></div></article>)}
      </section>}

      {isCharts && <div className="pt-8">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[["Bitcoin", "BINANCE:BTCUSDT"], ["Ethereum", "BINANCE:ETHUSDT"], ["Solana", "BINANCE:SOLUSDT"], ["Gold / USD", "OANDA:XAUUSD"]].map(([name, symbol]) => <button key={symbol} onClick={() => { chartRequest.current?.abort(); setChartSymbol(symbol); setChartNotice(""); setSearchParams({ symbol }); }} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:shadow-sm"><span><strong className="block text-sm text-neutral-900">{name}</strong><small className="mt-1 block text-[10px] text-neutral-400">{symbol}</small></span><span className="text-emerald-600">↗</span></button>)}
        </div>
        <LiveMarketChart symbol={chartSymbol} notice={chartNotice}/>
        <Link to="/coins" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">← Browse all coins</Link>
      </div>}

      {isMarketPage && <section id="markets" className="scroll-mt-24">
        <div className="section-heading"><div><h2>{isSearching ? "Directory search results" : isHome ? "Market overview" : "All cryptocurrencies"}</h2><p>{isSearching ? "Full CoinLore directory · 100 results per page" : isHome ? "Top 100 · CoinLore" : "100 coins per page · CoinLore"}</p></div>
          <button className="refresh" onClick={() => isSearching ? directory.reload() : load(isHome ? 1 : page)} disabled={displayLoading}><Icon name="refresh"/><span>{displayLoading ? "Refreshing" : "Refresh data"}</span></button></div>
        <div className="toolbar">
          <form role="search" aria-label="Search all CoinLore coins" className="search" onSubmit={event => { event.preventDefault(); setFilter("all"); }}><Icon name="search"/><input type="search" autoComplete="off" aria-label="Coin name, symbol, or pair across the full directory" value={query} onChange={event => { setQuery(event.target.value); setFilter("all"); }} placeholder="Search all coins: name or symbol"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><Icon name="close" size={14}/></button>}<button type="submit" className="min-h-11 shrink-0 !px-2 !text-xs !font-semibold !text-emerald-700">Search</button></form>
          <div className="filters" aria-label="Market filters">{(["all", "top", "gainers", "losers", "saved"] as Filter[]).map(f => <button key={f} aria-pressed={filter === f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>{f === "all" ? "All assets" : f === "top" ? "Top 100" : f === "saved" ? "Watchlist" : f[0].toUpperCase() + f.slice(1)}</button>)}</div>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
          <p role="status">{isSearching ? directory.loading ? `Loading full CoinLore directory… ${directory.progress.loaded.toLocaleString()} / ${directory.progress.total.toLocaleString() || "—"}` : directory.error ? "Directory search unavailable" : `${allRows.length.toLocaleString()} matches across ${directory.snapshot?.coins.length.toLocaleString() ?? "—"} API coins · Search snapshot ${directory.snapshot ? new Date(directory.snapshot.received).toLocaleTimeString() : "—"}` : loading ? "Updating market data…" : error ? "Data unavailable" : `${rows.length} coins${checked ? ` · Checked ${checked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`}{filter === "saved" ? " · Watchlist" : ""}</p>
          <label className="flex items-center gap-2">Sort by <select aria-label="Sort coins" value={`${sort.key}:${sort.dir}`} onChange={event => { const [key, direction] = event.target.value.split(":"); setSort({ key: key as Sort, dir: Number(direction) as 1 | -1 }); }} className="min-h-11 rounded-lg border border-neutral-200 bg-white px-3 text-neutral-800">
            <option value="rank:1">Rank ↑</option><option value="rank:-1">Rank ↓</option><option value="name:1">Name A–Z</option><option value="name:-1">Name Z–A</option><option value="price_usd:-1">Price high–low</option><option value="price_usd:1">Price low–high</option><option value="percent_change_24h:-1">24h best first</option><option value="percent_change_24h:1">24h worst first</option><option value="market_cap_usd:-1">Market cap high–low</option><option value="market_cap_usd:1">Market cap low–high</option>
          </select></label>
        </div>
        {storageNotice && <p role="status" className="mb-3 text-xs text-neutral-600">{storageNotice}</p>}

        <div className="table-card" aria-busy={displayLoading}>
          {displayError ? <div className="state"><span><Icon name="activity" size={25}/></span><h3>Market data unavailable</h3><p>{displayError}</p><button onClick={() => isSearching ? directory.reload() : load(isHome ? 1 : page)}>Try again</button></div> :
          <div className="table-scroll"><table><thead><tr>
            <th aria-sort={sortDirection("rank")}><button onClick={() => sortBy("rank")}>#{sortArrow("rank")}</button></th><th aria-sort={sortDirection("name")}><button onClick={() => sortBy("name")}>Asset{sortArrow("name")}</button></th>
            <th className="right" aria-sort={sortDirection("price_usd")}><button onClick={() => sortBy("price_usd")}>Price{sortArrow("price_usd")}</button></th><th className="right">1h</th>
            <th className="right" aria-sort={sortDirection("percent_change_24h")}><button onClick={() => sortBy("percent_change_24h")}>24h{sortArrow("percent_change_24h")}</button></th><th className="right">7d</th>
            <th className="right">24h volume</th><th className="right" aria-sort={sortDirection("market_cap_usd")}><button onClick={() => sortBy("market_cap_usd")}>Market cap{sortArrow("market_cap_usd")}</button></th>
          </tr></thead><tbody>
            {displayLoading ? Array.from({ length: 8 }, (_, i) => <tr className="skeleton" key={i}><td colSpan={8}><span/></td></tr>) :
            rows.map(c => <tr key={c.id}><td className="rank">{c.rank ?? "—"}</td><td><div className="coin-name"><Mark coin={c}/><div><strong>{c.name}</strong><span className="flex flex-wrap items-center gap-1">{c.symbol} <button aria-label={`Find ${c.name} chart`} onClick={() => showChart(c)} className="min-h-11 rounded border sm:min-h-8 border-emerald-100 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100">Chart ↗</button><button aria-label={`${saved.includes(c.id) ? "Remove" : "Save"} ${c.name} ${saved.includes(c.id) ? "from" : "to"} watchlist`} aria-pressed={saved.includes(c.id)} onClick={() => toggleSaved(c.id)} className={`flex h-11 w-11 items-center sm:h-8 sm:w-8 justify-center rounded border text-lg ${saved.includes(c.id) ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-neutral-200 text-neutral-500 hover:bg-neutral-100"}`}><span aria-hidden="true">{saved.includes(c.id) ? "★" : "☆"}</span></button></span></div></div>
              <details className="mobile-metrics mt-3">
                <summary className="cursor-pointer text-xs font-semibold text-neutral-500">More market details</summary>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3 whitespace-normal text-xs">
                  <div><dt className="mb-1 text-neutral-400">1h change</dt><dd><Change value={c.percent_change_1h}/></dd></div>
                  <div><dt className="mb-1 text-neutral-400">7d change</dt><dd><Change value={c.percent_change_7d}/></dd></div>
                  <div><dt className="mb-1 text-neutral-400">24h volume</dt><dd className="font-semibold text-neutral-700">{money(c.volume24, true)}</dd></div>
                  <div><dt className="mb-1 text-neutral-400">Market cap</dt><dd className="font-semibold text-neutral-700">{money(c.market_cap_usd, true)}</dd></div>
                </dl>
              </details>
            </td>
              <td className="right price">{money(c.price_usd)}</td><td className="right"><Change value={c.percent_change_1h}/></td><td className="right"><Change value={c.percent_change_24h}/></td>
              <td className="right"><Change value={c.percent_change_7d}/></td><td className="right">{money(c.volume24, true)}</td><td className="right">{money(c.market_cap_usd, true)}</td></tr>)}
          </tbody></table>{!displayLoading && !rows.length && <div className="empty"><Icon name="search" size={24}/><strong>{filter === "saved" ? "No matching saved coins" : "No assets found"}</strong><span>{filter === "saved" ? "Use the star beside a coin to save it." : "Try a different name, symbol, or filter."}</span><button onClick={() => { setQuery(""); setFilter("all"); }} className="mt-3 min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">Show all coins</button></div>}</div>}
          {isSearching && !displayLoading && !displayError && <nav aria-label="Search results pagination" className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-white p-4"><button disabled={activeResultPage === 1} onClick={() => setResultPage(activeResultPage - 1)} className="min-h-11 rounded-lg border border-neutral-200 px-4 text-xs font-semibold disabled:opacity-40">← Previous results</button><span className="text-xs text-neutral-600">Page {activeResultPage} of {resultPages} · {allRows.length.toLocaleString()} matches</span><button disabled={activeResultPage >= resultPages} onClick={() => setResultPage(activeResultPage + 1)} className="min-h-11 rounded-lg bg-emerald-800 px-4 text-xs font-semibold text-white disabled:opacity-40">Next results →</button></nav>}
          {!isHome && !isSearching && <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4 sm:mt-0 sm:rounded-none sm:border-x-0 sm:border-b-0 sm:p-6">
            <div className="mb-5 grid gap-5 rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 sm:p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center">
              <div className="flex items-center gap-4" aria-live="polite">
                <span aria-hidden="true" className="flex h-12 min-w-12 items-center justify-center rounded-xl border border-emerald-100 bg-white px-2 text-lg font-bold tabular-nums text-emerald-600 shadow-sm">{String(page).padStart(2, "0")}</span>
                <div>
                  <p className="mb-1 text-[9px] font-bold tracking-[0.16em] text-neutral-400">YOUR MARKET WORKSPACE</p>
                  <p className="text-base font-bold text-neutral-900">Page {page} <span className="font-normal text-neutral-400">of {total === null ? "—" : pages}</span></p>
                  <p className="mt-1 text-xs text-neutral-500">{loading ? "Fetching provider data…" : error ? "Data unavailable" : `${rows.length} assets on this page`}</p>
                </div>
              </div>
              <div className="lg:border-l lg:border-neutral-200 lg:pl-5">
                <div className="mb-2 flex items-center justify-between gap-4 text-[11px]">
                  <span className="font-semibold text-neutral-600">Directory progress</span>
                  <span className="tabular-nums text-neutral-400">{total === null ? "—" : `${page} / ${pages} pages`}</span>
                </div>
                <progress value={total === null ? 0 : page} max={pages} aria-label="Market directory page progress" className="block h-1.5 w-full overflow-hidden rounded-full appearance-none [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-neutral-200 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-emerald-600 [&::-moz-progress-bar]:bg-emerald-600"/>
                {updated && <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">CoinLore snapshot · {updated.toLocaleString()}</p>}
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-500">Go to page
                <input key={page} aria-label="Go to page number" disabled={loading || total === null} className="h-11 w-16 rounded-lg border border-neutral-200 text-center text-neutral-800 outline-none focus:border-emerald-500 disabled:opacity-50" type="number" min="1" max={pages} step="1" defaultValue={page} onBlur={e => { const next = Math.max(1, Math.min(pages, Math.trunc(+e.target.value || page))); e.target.value = String(next); go(next); }} onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); }}/>
              </label>
            </div>
            <nav aria-label="Market directory pagination" className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center justify-center gap-1 lg:order-2">
                {pageList.map((n, index) => <span key={n} className="flex items-center gap-1">
                  {index > 0 && n - pageList[index - 1] > 1 && <span className="px-1 text-neutral-400" aria-hidden="true">…</span>}
                  <button aria-label={`Page ${n}`} aria-current={n === page ? "page" : undefined} disabled={loading} onClick={() => go(n)} className={`h-11 min-w-9 rounded-lg px-2 text-xs font-semibold transition disabled:cursor-not-allowed sm:min-w-11 ${n === page ? "bg-neutral-900 text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"}`}>{n}</button>
                </span>)}
              </div>
              <button onClick={() => go(page - 1)} disabled={loading || page === 1} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40 lg:order-1"><span aria-hidden="true">←</span> Previous page</button>
              <button onClick={() => go(page + 1)} disabled={loading || total === null || page >= pages} className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none lg:order-3">Next page <span aria-hidden="true">→</span></button>
            </nav>
          </div>}
        </div>
        {isHome && <div className="mt-6 flex flex-col items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-center sm:flex-row sm:justify-between sm:text-left"><p className="text-xs leading-6 text-neutral-500">{updated ? `CoinLore snapshot · ${updated.toLocaleString()}` : "Market data is provided by CoinLore."}</p><Link to="/coins" className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-emerald-800 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900">See all coins <span aria-hidden="true">→</span></Link></div>}
      </section>}
      {isCourses && <CoursesPage/>}
      <Outlet/>
    </main>
    <footer id="about" className="compact-footer">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start gap-4 px-5 py-8 text-left sm:px-8 lg:px-[42px]">
        <Link to="/" className="text-base font-bold text-neutral-900">MBK <span className="text-emerald-600">Global Market</span></Link>
        <p className="text-xs leading-6 text-neutral-500">Data: CoinLore · Charts: TradingView<br/>For information only. Exchange coverage may vary.</p>
        <div className="flex flex-wrap justify-start gap-x-5 gap-y-2 text-xs text-neutral-500">
          <span>© {new Date().getFullYear()} MBK Global Market</span>
          <span>Created by <strong className="font-semibold text-neutral-700">MBK Global Market</strong></span>
        </div>
        <a href="tel:+923200276941" className="text-xs font-semibold tabular-nums text-neutral-600 hover:text-emerald-600">Contact · 03200276941</a>
        <a href={CONTACT} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-emerald-600"><Icon name="chat" size={14}/> Official WhatsApp contact ↗</a>
      </div>
    </footer>
  </div>;
}

function EmptyRoute() { return null; }

function NotFoundPage() {
  useEffect(() => { document.title = "Page not found | MBK Global Market"; }, []);
  return <section className="py-20 text-center"><span className="font-mono text-sm text-emerald-700">404</span><h1 className="mt-4 text-3xl font-semibold text-neutral-950">Page not found</h1><p className="mt-3 text-sm text-neutral-600">The link may be incorrect or the page has moved.</p><Link to="/" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-neutral-950 px-5 text-sm font-semibold text-white hover:bg-emerald-700">Back to market →</Link></section>;
}

const router = createBrowserRouter([{
  path: "/",
  Component: MarketWorkspace,
  children: [
    { index: true, Component: EmptyRoute },
    { path: "courses", Component: EmptyRoute },
    { path: "coins", Component: EmptyRoute },
    { path: "live-charts", Component: EmptyRoute },
    { path: "*", Component: NotFoundPage },
  ],
}], { basename: new URL(import.meta.env.BASE_URL, window.location.origin).pathname.replace(/\/$/, "") || "/" });

export default function App() { return <RouterProvider router={router}/>; }
