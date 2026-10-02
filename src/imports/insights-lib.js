/* MBK Global Market — pure market-insight computations (no DOM).
 *
 * Loaded as a classic script before app.js in the browser
 * (exposes window.MBK_INSIGHTS) and required by the node unit
 * tests (module.exports). All inputs are the normalized coin rows
 * from /api/market; every value rendered is real feed data —
 * no synthetic or random numbers anywhere in this file. */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else if (root) root.MBK_INSIGHTS = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /** Top n gainers and top n losers by 24h % change.
   *  Rows without a finite 24h % are ignored (partial feeds still
   *  carry 24h %, so movers work on every provider). */
  function topMovers(rows, n) {
    n = n > 0 ? n : 5;
    var valid = (rows || []).filter(function (c) {
      return c && Number.isFinite(c.price_change_percentage_24h);
    });
    var desc = valid.slice().sort(function (a, b) {
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
    });
    return {
      gainers: desc.slice(0, n),
      losers: desc.slice(-n).reverse(),
    };
  }

  /** Market-cap shares of the top n coins, as {symbol, name, share}
   *  with shares summing to 100 across the returned slice.
   *  Returns [] when no market-cap data exists (e.g. the live-prices
   *  fallback), so the UI can show an honest empty state instead of
   *  inventing numbers. */
  function distShares(rows, n) {
    n = n > 0 ? n : 8;
    var valid = (rows || []).filter(function (c) {
      return c && Number.isFinite(c.market_cap_usd) && c.market_cap_usd > 0;
    });
    if (!valid.length) return [];
    var top = valid
      .slice()
      .sort(function (a, b) { return b.market_cap_usd - a.market_cap_usd; })
      .slice(0, n);
    var total = top.reduce(function (s, c) { return s + c.market_cap_usd; }, 0);
    if (!(total > 0)) return [];
    return top.map(function (c) {
      return {
        symbol: String(c.symbol || "").toUpperCase(),
        name: c.name || String(c.symbol || "").toUpperCase() || "—",
        share: (c.market_cap_usd / total) * 100,
      };
    });
  }

  return { topMovers: topMovers, distShares: distShares };
});
