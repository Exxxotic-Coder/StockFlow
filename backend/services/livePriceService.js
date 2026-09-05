function yahooSymbol(symbol) {
  return `${symbol.replace(/&/g, "%26")}.NS`;
}

async function fetchPrice(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol(symbol)}?interval=1d&range=1d`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Yahoo ${symbol} ${response.status}`);
  const data = await response.json();
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
  if (!price || price <= 0) throw new Error(`Yahoo returned no price for ${symbol}`);
  return price;
}

async function getLivePrices(symbols, cache, cacheTtl) {
  const prices = {};
  const now = Date.now();
  await Promise.allSettled(symbols.map(async (symbol) => {
    if (cache[symbol] && now - cache[symbol].ts < cacheTtl) {
      prices[symbol] = cache[symbol].price;
      return;
    }
    try {
      const price = await fetchPrice(symbol);
      prices[symbol] = price;
      cache[symbol] = { price, ts: now };
    } catch (error) {
      console.warn(`Live price unavailable for ${symbol}: ${error.message}`);
    }
  }));
  return prices;
}

module.exports = { fetchPrice, getLivePrices };