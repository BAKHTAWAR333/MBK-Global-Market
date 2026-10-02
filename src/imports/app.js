/* MBK Global Market — trader frontend v3.0.1.
 *
 * All market data flows through the Markets API
 * (https://markets-api.faizankhichi.me) — the browser never names or
 * contacts an upstream provider directly. Charting uses
 * lightweight-charts from a CDN with a built-in canvas fallback, so a
 * graph always forms.
 */
"use strict";

/* ---------------- API base ---------------- */
const CANONICAL_API = "https://markets-api.faizankhichi.me";
function apiBase() {
  try {
    const q = new URLSearchParams(location.search).get("api");
    if (q && /^https?:\/\//i.test(q)) { try { localStorage.setItem("mktsApiBase", q.replace(/\/+$/, "")); } catch {} }
  } catch {}
  try {
    const saved = localStorage.getItem("mktsApiBase");
    if (saved) return saved;
  } catch {}
  // Deployed on the API domain itself: same origin keeps working even if
  // the domain ever changes. Anywhere else: the canonical API domain.
  try {
    if (location.protocol.startsWith("http") && location.host === "markets-api.faizankhichi.me") return location.origin;
  } catch {}
  return CANONICAL_API;
}
const API = apiBase();

/* ---------------- symbol universe ---------------- */
const PRESETS = [
  { group: "Crypto", items: [
    { code: "BTC", name: "Bitcoin", kind: "crypto" },
    { code: "ETH", name: "Ethereum", kind: "crypto" },
    { code: "SOL", name: "Solana", kind: "crypto" },
    { code: "BNB", name: "BNB", kind: "crypto" },
    { code: "XRP", name: "XRP", kind: "crypto" },
    { code: "DOGE", name: "Dogecoin", kind: "crypto" },
  ]},
];

/* ---------------- timeframes ----------------
 * Candles come from GET /api/markets/candles?symbol=BTC&interval=1d&limit=200
 * -> { candles: [{t,o,h,l,c,v}] } with t in unix seconds. */
const TF = {
  "1D": { interval: "15m", limit: 11196 },
  "1W": { interval: "1h", limit: 11168 },
  "1M": { interval: "4h", limit: 11186 },
  "3M": { interval: "1d", limit: 11193 },
  "6M": { interval: "1d", limit: 111186 },
  "1Y": { interval: "1d", limit: 11365 },
  "5Y": { interval: "1w", limit: 11260 },
};

/* ---------------- state ---------------- */
let sym = PRESETS[0].items[0]; // current symbol object
let tfKey = "1M";
let chartType = "candles";
let chart = null, candleSeries = null, lineSeries = null, volSeries = null;
let usedFallbackRenderer = false;
const symNames = {}; // symbol -> display name, learned from the market table

/* ---------------- helpers ---------------- */
const $ = (id) => document.getElementById(id);
const fmtN = (n, d = 2) =>
  n == null || !Number.isFinite(n) ? "—"
  : Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtBig = (n) => {
  if (n == null || !Number.isFinite(n)) return "—";
  const a = Math.abs(n);
  if (a >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (a >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (a >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (a >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return fmtN(n, n < 10 ? 4 : 2);
};

async function api(path) {
  const r = await fetch(API + path, { headers: { Accept: "application/json" } });
  let j = null;
  try { j = await r.json(); } catch { /* non-JSON */ }
  if (!r.ok) throw new Error((j && j.error) || ("HTTP " + r.status));
  return j;
}

function chartMsg(id, text) {
  const el = $(id);
  if (!text) { el.hidden = true; el.textContent = ""; return; }
  el.hidden = false; el.textContent = text;
}

/* Fallback canvas line renderer — used only if lightweight-charts CDN fails. */
function fallbackLine(containerId, points, color) {
  const wrap = $(containerId).parentElement;
  let cv = wrap.querySelector("canvas.fbk");
  if (!cv) {
    cv = document.createElement("canvas");
    cv.className = "fbk";
    cv.style.cssText = "width:100%;height:100%;display:block";
    wrap.appendChild(cv);
    $(containerId).style.display = "none";
  }
  const dpr = window.devicePixelRatio || 1;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  const g = cv.getContext("2d");
  g.scale(dpr, dpr);
  g.clearRect(0, 0, W, H);
  if (!points.length) return;
  const vs = points.map((p) => p.v ?? p.c);
  const lo = Math.min(...vs), hi = Math.max(...vs), pad = (hi - lo) * 0.08 || 1;
  const X = (i) => 8 + (i / Math.max(points.length - 1, 1)) * (W - 60);
  const Y = (v) => 14 + (1 - (v - lo + pad) / (hi - lo + 2 * pad)) * (H - 40);
  g.strokeStyle = "#e7e7e7"; g.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = 14 + (i / 4) * (H - 40);
    g.beginPath(); g.moveTo(8, y); g.lineTo(W - 52, y); g.stroke();
    g.fillStyle = "#9ca3af"; g.font = "10px Inter,sans-serif";
    g.fillText(fmtBig(hi - (i / 4) * (hi - lo)), W - 48, y + 3);
  }
  g.strokeStyle = color || "#E30613"; g.lineWidth = 2; g.beginPath();
  points.forEach((p, i) => { const v = p.v ?? p.c; i ? g.lineTo(X(i), Y(v)) : g.moveTo(X(i), Y(v)); });
  g.stroke();
  usedFallbackRenderer = true;
}

/* ---------------- chart (lightweight-charts) ---------------- */
function chartOptions() {
  return {
    layout: { background: { color: "#ffffff" }, textColor: "#6b7280", fontFamily: "Inter,sans-serif", fontSize: 11 },
    grid: { vertLines: { color: "#f1f1f1" }, horzLines: { color: "#f1f1f1" } },
    timeScale: { borderColor: "#e7e7e7", timeVisible: true, secondsVisible: false },
    rightPriceScale: { borderColor: "#e7e7e7" },
    crosshair: { vertLine: { color: "#c3c3c3" }, horzLine: { color: "#c3c3c3" } },
    // mobile-friendly gestures: pinch zooms the chart, horizontal drag
    // pans it, vertical drag scrolls the page (never traps the scroll)
    handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
    handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true, axisDoubleClickReset: true },
  };
}

/* Chart zoom buttons (+ / − / reset). */
function zoomChart(factor) {
  if (typeof chart === "undefined" || !chart) return;
  const ts = chart.timeScale();
  const r = ts.getVisibleLogicalRange();
  if (!r) return;
  const center = (r.from + r.to) / 2;
  const half = ((r.to - r.from) * factor) / 2;
  ts.setVisibleLogicalRange({ from: center - half, to: center + half });
}
function initZoomCtl() {
  const ctl = $("zoomCtl");
  ctl.querySelectorAll("button").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const z = b.dataset.z;
    if (z === "reset") { if (chart) chart.timeScale().fitContent(); }
    else zoomChart(z === "in" ? 0.75 : 1.33);
  }));
}

function chartSize() {
  const w = $("chartWrap");
  return { width: Math.max(50, w.clientWidth), height: Math.max(200, w.clientHeight || 460) };
}

function ensureChart() {
  if (chart || !window.LightweightCharts) return;
  const s = chartSize();
  chart = LightweightCharts.createChart($("chart"), { ...chartOptions(), width: s.width, height: s.height });
  candleSeries = chart.addCandlestickSeries({ upColor: "#16a34a", downColor: "#E30613", wickUpColor: "#16a34a", wickDownColor: "#E30613", borderVisible: false });
  lineSeries = chart.addLineSeries({ color: "#E30613", lineWidth: 2, priceLineVisible: false });
  volSeries = chart.addHistogramSeries({ priceScaleId: "", priceFormat: { type: "volume" } });
  chart.priceScale("").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
  new ResizeObserver(() => {
    const z = chartSize();
    chart.applyOptions({ width: z.width, height: z.height });
  }).observe($("chartWrap"));
}

function drawChart(candles) {
  if (!window.LightweightCharts) {
    fallbackLine("chart", candles.map((c) => ({ t: c.t, c: c.c })), "#E30613");
    return;
  }
  ensureChart();
  const data = candles.map((c) => ({ time: c.t, open: c.o, high: c.h, low: c.l, close: c.c }));
  candleSeries.setData(data);
  lineSeries.setData(data.map((d) => ({ time: d.time, value: d.close })));
  volSeries.setData(candles.map((c) => ({
    time: c.t, value: c.v || 0,
    color: c.c >= c.o ? "rgba(22,163,74,.45)" : "rgba(227,6,19,.45)",
  })));
  candleSeries.applyOptions({ visible: chartType === "candles" });
  lineSeries.applyOptions({ visible: chartType === "line" });
  chart.timeScale().fitContent();
}

/* ---------------- data loading ---------------- */
async function loadCandles(s, key) {
  const tf = TF[key];
  // All chart data flows through the Markets API so the page never
  // names or contacts an upstream host directly.
  const r = await api(`/api/markets/candles?symbol=${encodeURIComponent(s.code)}&interval=${tf.interval}&limit=${tf.limit}`);
  if (!r || !Array.isArray(r.candles) || !r.candles.length) throw new Error("empty dataset");
  return { candles: r.candles, note: "", meta: null };
}

/* ---------------- render ---------------- */
function renderStats(candles, meta) {
  const last = candles[candles.length - 1];
  const first = candles[0];
  const hi = Math.max(...candles.map((c) => c.h));
  const lo = Math.min(...candles.map((c) => c.l));
  const vol = candles.reduce((a, c) => a + (c.v || 0), 0);
  const prev = meta && meta.prevClose != null ? meta.prevClose : first.o;
  const chg = last.c - prev;
  const chgPct = prev ? (chg / prev) * 100 : 0;
  const dec = last.c < 1000 ? 2 : last.c < 100000 ? 2 : 0;

  $("price").textContent = fmtN(last.c, dec);
  const chgEl = $("chg");
  chgEl.textContent = `${chg >= 0 ? "+" : ""}${fmtN(chg, dec)} (${chgPct >= 0 ? "+" : ""}${chgPct.toFixed(2)}%)`;
  chgEl.className = "chg " + (chg >= 0 ? "pos" : "neg");

  const rows = [
    ["Open", fmtN(first.o, dec)],
    ["High", fmtN(hi, dec)],
    ["Low", fmtN(lo, dec)],
    ["Prev close", fmtN(prev, dec)],
    ["Volume", fmtBig(vol)],
    ["Points", String(candles.length)],
  ];
  $("stats").innerHTML = rows.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
}

async function refreshChart() {
  chartMsg("chartMsg", "Loading chart…");
  $("fallbackNote").hidden = true;
  try {
    const { candles, note } = await loadCandles(sym, tfKey);
    if (!candles.length) throw new Error("empty dataset");
    $("symName").textContent = symNames[sym.code] || sym.name;
    $("symCode").textContent = sym.code;
    if (note) { $("fallbackNote").hidden = false; $("fallbackNote").textContent = note; }
    drawChart(candles);
    renderStats(candles, null);
    chartMsg("chartMsg", null);
    try { localStorage.setItem("fakm_sym", JSON.stringify(sym)); localStorage.setItem("fakm_tf", tfKey); } catch {}
  } catch (e) {
    chartMsg("chartMsg", "Could not load chart data right now (" + e.message + "). Try again in a minute.");
  }
}

/* ---------------- search ---------------- */
let searchTimer = null;
function initSearch() {
  const input = $("search"), box = $("results");
  input.addEventListener("input", () => {
    clearTimeout(searchTimer);
    const q = input.value.trim();
    if (q.length < 2) { box.hidden = true; return; }
    searchTimer = setTimeout(async () => {
      try {
        const r = await api("/api/markets/search?q=" + encodeURIComponent(q));
        const results = (r && r.results) || [];
        if (!results.length) { box.hidden = true; return; }
        box.innerHTML = results.map((x, i) =>
          `<button data-i="${i}"><b>${String(x.symbol || "").toUpperCase()}</b><span>${x.name || ""}${x.rank ? " · #" + x.rank : ""}</span></button>`
        ).join("");
        box.hidden = false;
        box.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
          const x = results[+b.dataset.i];
          const code = String(x.symbol || "").toUpperCase();
          sym = { code, name: x.name || code, kind: "crypto" };
          symNames[code] = x.name || code;
          box.hidden = true; input.value = "";
          document.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
          showChartView();
          refreshChart();
        }));
      } catch { box.hidden = true; }
    }, 300);
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".searchbox")) box.hidden = true; });
}

/* ---------------- mobile tabbed interface ----------------
 * On phones the page becomes a tabbed app: the bottom tab bar flips
 * body[data-mview] between the chart, market and insights sections.
 * Desktop never sets data-mview, so it renders exactly as before. */
const mobileMQ = window.matchMedia("(max-width:760px)");
let setMobileView = null;
function initMobileTabs() {
  const bar = $("tabbar");
  const go = (v) => {
    document.body.dataset.mview = v;
    bar.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.view === v));
    try { localStorage.setItem("fakm_mview", v); } catch {}
    if (v === "chart" && typeof chart !== "undefined" && chart && window.LightweightCharts) {
      requestAnimationFrame(() => { const z = chartSize(); chart.applyOptions({ width: z.width, height: z.height }); });
    }
    window.scrollTo({ top: 0 });
  };
  setMobileView = go;
  bar.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => go(b.dataset.view)));
  const apply = () => {
    if (!mobileMQ.matches) { document.body.removeAttribute("data-mview"); return; }
    let v = "chart";
    try { v = localStorage.getItem("fakm_mview") || "chart"; } catch {}
    if (!bar.querySelector('button[data-view="' + v + '"]')) v = "chart";
    go(v);
  };
  if (mobileMQ.addEventListener) mobileMQ.addEventListener("change", apply);
  apply();
}
function showChartView() {
  if (setMobileView && mobileMQ.matches) setMobileView("chart");
}

/* ---------------- chrome: chips + timeframe bar ---------------- */
function initChrome() {
  const chips = $("chips");
  chips.innerHTML = PRESETS.map((g) =>
    `<div class="chip-group"><span class="chip-label">${g.group}</span>` +
    g.items.map((s, i) => `<button class="chip" data-g="${g.group}" data-i="${i}">${s.code}</button>`).join("") + `</div>`
  ).join("");
  chips.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
    const s = PRESETS.find((g) => g.group === b.dataset.g).items[+b.dataset.i];
    sym = s;
    chips.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
    b.classList.add("on");
    refreshChart();
  }));
  const mark = () => chips.querySelectorAll(".chip").forEach((b) => {
    const s = PRESETS.find((g) => g.group === b.dataset.g).items[+b.dataset.i];
    b.classList.toggle("on", s.code === sym.code && s.group !== undefined);
  });

  const tfBar = $("tfBar");
  tfBar.innerHTML = Object.keys(TF).map((k) => `<button data-tf="${k}" class="${k === tfKey ? "on" : ""}">${k}</button>`).join("");
  tfBar.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    tfKey = b.dataset.tf;
    tfBar.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    refreshChart();
  }));

  $("ctypeBar").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    chartType = b.dataset.ct;
    $("ctypeBar").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    refreshChart();
  }));
  mark();
  return mark;
}

/* ---------------- boot ---------------- */
async function boot() {
  initMobileTabs(); // no API dependency — tabs work even if the backend is down
  initZoomCtl();
  try {
    const v = await api("/api/version");
    if (!v || v.api !== "markets-api/v1") throw new Error("unexpected API");
  } catch (e) {
    chartMsg("chartMsg", "API unreachable — the Markets API isn't responding (" + e.message + "). Check your connection and reload.");
    return;
  }
  try {
    const s = JSON.parse(localStorage.getItem("fakm_sym") || "null");
    if (s && s.code) sym = s;
    const t = localStorage.getItem("fakm_tf");
    if (t && TF[t]) tfKey = t;
  } catch {}
  initChrome();
  initSearch();
  refreshChart();
}

document.addEventListener("DOMContentLoaded", () => boot());

/* ---------------- market overview ---------------- */
const mkt = { page: 1, maxPage: 4, sortKey: "rank", sortDir: 1, rows: [], updatedAt: 0, timer: null, query: "" };

const fmtPx = (p) => {
  if (p == null || !Number.isFinite(p)) return "—";
  if (p >= 1000) return fmtN(p, 2);
  if (p >= 1) return fmtN(p, p < 10 ? 4 : 2);
  return Number(p.toPrecision(4)).toString();
};
const fmtPct = (v) => {
  if (v == null || !Number.isFinite(v)) return '<span class="muted">—</span>';
  const cls = v >= 0 ? "pos" : "neg";
  return `<span class="${cls}">${v >= 0 ? "+" : ""}${v.toFixed(2)}%</span>`;
};

/* Deterministic hue for a coin's identicon badge (0-359). */
function hashHue(s) {
  let h = 0;
  for (const ch of String(s || "?")) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
/* Coin badge: artwork is proxied through our own API origin
 * (/api/markets/icon?sym=BTC) so no upstream host ever leaks; if the
 * artwork fails, the letter identicon underneath remains. */
function coinBadge(symU, small) {
  const letter = String(symU || "?").replace(/[^A-Z0-9]/gi, "").slice(0, 1).toUpperCase() || "?";
  const img = `<img src="${API}/api/markets/icon?sym=${encodeURIComponent(symU)}" data-sym="${symU}" loading="lazy" alt="" onerror="iconFallback(this)">`;
  return `<span class="ident${small ? " sm" : ""}" style="--h:${hashHue(symU)}" aria-hidden="true">${img}<b>${letter}</b></span>`;
}
function iconFallback(el) {
  el.remove(); // no artwork -> letter badge shows through
}

/* Inline SVG sparkline from the API's 7d price array. Same footprint as
 * the reference's sparkline image so the layout matches pixel for pixel. */
function sparkSVG(points) {
  const W = 110, H = 32, P = 3;
  const lo = Math.min(...points), hi = Math.max(...points), span = (hi - lo) || 1;
  const n = points.length;
  const d = points.map((v, i) =>
    `${(P + (i / (n - 1)) * (W - 2 * P)).toFixed(1)},${(P + (1 - (v - lo) / span) * (H - 2 * P)).toFixed(1)}`
  ).join(" ");
  const up = points[n - 1] >= points[0];
  const col = up ? "#16a34a" : "#E30613";
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${d}" fill="none" stroke="${col}" stroke-width="1.6"/></svg>`;
}

function chartCoin(symU, name) {
  if (!symU) return;
  sym = { code: symU, name: name || symU, kind: "crypto" };
  symNames[symU] = name || symU;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("on"));
  showChartView();
  window.scrollTo({ top: 0, behavior: "smooth" });
  refreshChart();
}

function renderMarket() {
  // insights always run on the full page rows; the search box only
  // filters the table itself
  renderInsights(mkt.rows);
  const q = (mkt.query || "").trim().toLowerCase();
  const pool = q ? mkt.rows.filter((c) =>
    String(c.name || "").toLowerCase().includes(q) ||
    String(c.symbol || "").toLowerCase().includes(q)) : mkt.rows;
  const rows = [...pool].sort((a, b) => {
    const av = a[mkt.sortKey] ?? -Infinity, bv = b[mkt.sortKey] ?? -Infinity;
    return (av - bv) * mkt.sortDir;
  });
  $("mktBody").innerHTML = rows.map((c) => {
    const symU = String(c.symbol || "").toUpperCase();
    return `<tr data-sym="${symU}" data-name="${(c.name || "").replace(/"/g, "")}">
      <td class="muted">${c.rank ?? "—"}</td>
      <td><span class="coin-cell">${coinBadge(symU)}<span>${c.name || "—"} <span class="csym">${symU}</span></span></span></td>
      <td class="num"><b>${fmtPx(c.price_usd)}</b></td>
      <td class="num">${fmtPct(c.price_change_percentage_1h)}</td>
      <td class="num">${fmtPct(c.price_change_percentage_24h)}</td>
      <td class="num">${fmtPct(c.price_change_percentage_7d)}</td>
      <td class="num">${fmtPct(c.price_change_percentage_30d)}</td>
      <td class="num">${fmtBig(c.volume_24h_usd)}</td>
      <td class="num">${fmtBig(c.market_cap_usd)}</td>
      <td class="num">${fmtBig(c.fdv_usd)}</td>
      <td class="num">${c.sparkline && c.sparkline.length > 1 ? sparkSVG(c.sparkline) : "—"}</td>
    </tr>`;
  }).join("");
  $("mktBody").querySelectorAll("tr").forEach((tr) => tr.addEventListener("click", () => {
    chartCoin(tr.dataset.sym, tr.dataset.name || tr.dataset.sym);
  }));
  $("pgNum").textContent = "Page " + mkt.page;
  $("pgPrev").disabled = mkt.page <= 1;
  $("pgNext").disabled = mkt.page >= mkt.maxPage;
  const ago = Math.max(0, Math.round((Date.now() - mkt.updatedAt) / 1000));
  const qNow = (mkt.query || "").trim();
  const matchNote = qNow ? ` · ${rows.length} match${rows.length === 1 ? "" : "es"}` : "";
  $("mktUpdated").textContent = mkt.updatedAt
    ? `· updated ${ago}s ago${matchNote}`
    : matchNote;
}

/* ---------------- market insights ----------------
 * Market distribution doughnut + top gainers/losers, all computed
 * from the real loaded table rows via window.MBK_INSIGHTS. Nothing
 * here is synthesized: when the feed has no market caps the
 * distribution shows an honest empty state instead. */
const DIST_COLORS = ["#E30613", "#161616", "#4b5563", "#9ca3af", "#d1d5db", "#991b1b", "#6b7280", "#e5e7eb"];
let lastInsightsSig = "";

function moverRow(c) {
  const symU = String(c.symbol || "").toUpperCase();
  const pct = c.price_change_percentage_24h;
  return `<div class="mover" data-sym="${symU}" data-name="${(c.name || "").replace(/"/g, "")}" role="button" tabindex="0" title="Chart ${symU}">
    <span class="mv-coin">${coinBadge(symU, true)}<span>${c.name || "—"} <span class="csym">${symU}</span></span></span>
    <span class="mv-px">${fmtPx(c.price_usd)}</span>
    <span class="mv-chg ${pct >= 0 ? "pos" : "neg"}">${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%</span>
  </div>`;
}

function drawDoughnut(canvas, shares) {
  const dpr = window.devicePixelRatio || 1;
  const boxW = canvas.parentElement ? canvas.parentElement.getBoundingClientRect().width : 220;
  const size = Math.max(120, Math.min(210, Math.floor(boxW * 0.45) || 160));
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = size + "px";
  canvas.style.height = size + "px";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, size, size);
  const cx = size / 2, cy = size / 2, R = size / 2 - 4, r = R * 0.62;
  let a = -Math.PI / 2;
  shares.forEach((s, i) => {
    const a2 = a + (s.share / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a, a2);
    ctx.arc(cx, cy, r, a2, a, true);
    ctx.closePath();
    ctx.fillStyle = DIST_COLORS[i % DIST_COLORS.length];
    ctx.fill();
    a = a2;
  });
  ctx.textAlign = "center";
  ctx.fillStyle = "#6b7280";
  ctx.font = "600 11px Inter, sans-serif";
  ctx.fillText("TOP " + shares.length, cx, cy - 3);
  ctx.fillStyle = "#111";
  ctx.font = "700 12px Inter, sans-serif";
  ctx.fillText("MKT CAP", cx, cy + 13);
}

function renderInsights(rows) {
  if (!$("insights")) return;
  const sig = mkt.page + ":" + rows.length + ":" + (mkt.updatedAt || 0);
  if (sig === lastInsightsSig) return;
  lastInsightsSig = sig;
  const lib = window.MBK_INSIGHTS;
  if (!lib) return;
  const { gainers, losers } = lib.topMovers(rows, 5);
  $("gainList").innerHTML = gainers.map(moverRow).join("") || '<div class="mover-empty">No data.</div>';
  $("lossList").innerHTML = losers.map(moverRow).join("") || '<div class="mover-empty">No data.</div>';
  document.querySelectorAll("#gainList .mover, #lossList .mover").forEach((el) => {
    el.addEventListener("click", () => chartCoin(el.dataset.sym, el.dataset.name || el.dataset.sym));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chartCoin(el.dataset.sym, el.dataset.name || el.dataset.sym); }
    });
  });
  const shares = lib.distShares(rows, 8);
  $("distEmpty").hidden = shares.length > 0;
  $("distChart").hidden = !shares.length;
  $("distLegend").hidden = !shares.length;
  if (shares.length) {
    drawDoughnut($("distChart"), shares);
    $("distLegend").innerHTML = shares.map((s, i) =>
      `<li><span class="dot" style="background:${DIST_COLORS[i % DIST_COLORS.length]}"></span><span class="dl-name">${s.name} <span class="csym">${s.symbol}</span></span><span class="dl-pct">${s.share.toFixed(1)}%</span></li>`
    ).join("");
  }
}

function renderSkeleton() {
  $("mktBody").innerHTML = Array.from({ length: 8 }, () =>
    '<tr class="skel"><td colspan="11"><span></span></td></tr>').join("");
}

async function loadMarket() {
  const first = !mkt.rows.length;
  $("mktErr").hidden = true;
  if (first) renderSkeleton();
  else chartMsg("mktMsg", "Refreshing…");
  let r = null, lastErr = null;
  // one delayed retry so a transient rate-limit storm can't blank the
  // table on first paint
  for (let attempt = 0; attempt < 2 && !r; attempt++) {
    if (attempt > 0) await new Promise((res) => setTimeout(res, 4000));
    try {
      r = await api(`/api/markets/tickers?page=${mkt.page}`);
    } catch (e) {
      lastErr = e;
    }
  }
  if (r && Array.isArray(r.data)) {
    mkt.rows = r.data;
    mkt.updatedAt = Date.now();
    for (const c of mkt.rows) {
      const sU = String(c.symbol || "").toUpperCase();
      if (c.name) symNames[sU] = c.name;
    }
    chartMsg("mktMsg", null);
  } else if (first) {
    $("mktBody").innerHTML = "";
    $("mktErrTxt").textContent = "The Markets API is unreachable right now (" + (lastErr && lastErr.message) + ").";
    $("mktErr").hidden = false;
  } else {
    chartMsg("mktMsg", "Refresh failed (" + (lastErr && lastErr.message) + ") — showing last data.");
    setTimeout(() => { if (mkt.rows.length) chartMsg("mktMsg", null); }, 4000);
  }
  renderMarket();
}

/* ---------------- market-wide stats strip ---------------- */
function renderGlobalStrip(box, ic, g, fngCard) {
  const pct = (v) => {
    if (v == null || !Number.isFinite(v)) return "";
    const cls = v >= 0 ? "pos" : "neg";
    return ` <span class="${cls}">${v >= 0 ? "+" : ""}${v.toFixed(2)}%</span>`;
  };
  const stats = [
    { ic: ic('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z"/>'), k: "Total market cap", v: fmtBig(g.total_mcap_usd), s: pct(g.mcap_change_24h_pct) },
    { ic: ic('<path d="M4 20V12M10 20V6M16 20v-9M22 20H2"/>'), k: "24h volume", v: fmtBig(g.total_volume_24h_usd), s: "" },
    { ic: ic('<path d="M12 3v18M7 6.5c0-1 2.2-1.8 5-1.8s5 .8 5 1.8-2.2 1.9-5 1.9-5-.9-5-1.9zM7 12c0-1 2.2-1.8 5-1.8s5 .8 5 1.8-2.2 1.9-5 1.9-5-.9-5-1.9zM7 17.5c0-1 2.2-1.8 5-1.8s5 .8 5 1.8-2.2 1.9-5 1.9-5-.9-5-1.9z"/>'), k: "BTC dominance", v: g.btc_dominance_pct != null ? g.btc_dominance_pct.toFixed(2) + "%" : "—", s: "" },
    { ic: ic('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 010 7M21.5 20c-.5-2.7-2-4.6-4-5.4"/>'), k: "Coins tracked", v: g.coins_count != null ? fmtN(g.coins_count, 0) : "—", s: "" },
  ];
  box.innerHTML = stats.map((x) =>
    `<div class="gstat">${x.ic}<div><div class="k">${x.k}</div><div class="v">${x.v}${x.s}</div></div></div>`
  ).join("") + fngCard;
  box.hidden = false;
}

async function loadGlobalStats() {
  const box = $("mktStats");
  const ic = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">${p}</svg>`;
  const fngCardFor = (value, classification) => {
    const v = Math.min(100, Math.max(0, value));
    const zone = v <= 25 ? "neg" : v >= 55 ? "pos" : "warn";
    return `<div class="gstat">${ic('<path d="M12 3a9 9 0 019 9h-4a5 5 0 00-5-5V3z"/><path d="M12 12l4.5-4.5"/><circle cx="12" cy="12" r="1.6"/>')}<div><div class="k">Fear & Greed</div><div class="v">${value} <span class="${zone}">${classification || ""}</span><span class="fng-meter" aria-hidden="true"><i style="left:${v}%"></i></span></div></div></div>`;
  };
  // Fear & Greed is fully independent: its card renders even when the
  // global-stats feed is down, so the strip never blanks on one failure.
  let fngCard = "";
  try {
    const fng = await api("/api/markets/fear-greed");
    if (fng && Number.isFinite(fng.value)) fngCard = fngCardFor(fng.value, fng.classification);
  } catch { /* optional widget — the strip below renders without it */ }
  try {
    renderGlobalStrip(box, ic, await api("/api/markets/global"), fngCard);
  } catch {
    // Global feed down: keep the Fear & Greed card if we have it.
    if (fngCard) { box.innerHTML = fngCard; box.hidden = false; }
    else box.hidden = true;
  }
}

function markSort() {
  document.querySelectorAll("#mktTable thead th[data-k]").forEach((th) => {
    if (th.dataset.k === mkt.sortKey) th.setAttribute("data-dir", mkt.sortDir === 1 ? "asc" : "desc");
    else th.removeAttribute("data-dir");
  });
}

function initMarket() {
  document.querySelectorAll("#mktTable thead th[data-k]").forEach((th) => th.addEventListener("click", () => {
    const k = th.dataset.k;
    if (mkt.sortKey === k) mkt.sortDir *= -1;
    else { mkt.sortKey = k; mkt.sortDir = k === "rank" ? 1 : -1; }
    markSort();
    renderMarket();
  }));
  markSort();
  $("pgPrev").addEventListener("click", () => { if (mkt.page > 1) { mkt.page--; mkt.query = ""; $("mktSearch").value = ""; loadMarket(); } });
  $("pgNext").addEventListener("click", () => { if (mkt.page < mkt.maxPage) { mkt.page++; mkt.query = ""; $("mktSearch").value = ""; loadMarket(); } });
  $("mktRetry").addEventListener("click", loadMarket);
  $("mktSearch").addEventListener("input", (e) => { mkt.query = e.target.value; renderMarket(); });
  loadMarket();
  loadGlobalStats();
  // auto-refresh every 60s while the tab is visible — "real-time" table
  mkt.timer = setInterval(() => { if (!document.hidden) loadMarket(); }, 60000);
  setInterval(() => { if (mkt.updatedAt) renderMarket(); }, 10000); // keep "Xs ago" fresh
}

/* ---------------- live chart polling ---------------- */
let liveTimer = null;
function stopLive() {
  if (liveTimer) { clearInterval(liveTimer); liveTimer = null; }
  $("liveBadge").hidden = true;
}
function startLive(s) {
  stopLive();
  if (!window.LightweightCharts || !chart) return;
  const tf = TF[tfKey];
  $("liveBadge").hidden = false;
  liveTimer = setInterval(async () => {
    if (document.hidden) return;
    try {
      // tick the last bar from the newest candles
      const r = await api(`/api/markets/candles?symbol=${encodeURIComponent(s.code)}&interval=${tf.interval}&limit=2`);
      const last = r && r.candles && r.candles[r.candles.length - 1];
      if (!last) return;
      const bar = { time: last.t, open: last.o, high: last.h, low: last.l, close: last.c };
      candleSeries.update(bar);
      lineSeries.update({ time: last.t, value: last.c });
      volSeries.update({ time: last.t, value: last.v || 0, color: last.c >= last.o ? "rgba(22,163,74,.45)" : "rgba(227,6,19,.45)" });
      // live price + 24h change from the latest market rows (no extra fetch)
      const row = (mkt.rows || []).find((x) => String(x.symbol || "").toUpperCase() === s.code);
      const px = row && Number.isFinite(row.price_usd) ? row.price_usd : last.c;
      const dec = px < 1000 ? 2 : 0;
      $("price").textContent = fmtN(px, dec);
      const cp = row && row.price_change_percentage_24h;
      if (Number.isFinite(cp)) {
        const chgEl = $("chg");
        chgEl.textContent = `${cp >= 0 ? "+" : ""}${cp.toFixed(2)}% (24h)`;
        chgEl.className = "chg " + (cp >= 0 ? "pos" : "neg");
      }
    } catch { /* next tick */ }
  }, 20000);
}

// hook live polling + market table into the boot sequence
const _origRefresh = refreshChart;
refreshChart = async function () {
  stopLive();
  await _origRefresh();
  startLive(sym);
};
const _origBoot = boot;
boot = async function () {
  await _origBoot();
  initMarket();
};
