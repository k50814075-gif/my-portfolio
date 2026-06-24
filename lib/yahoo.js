'use strict';

const QUOTE_HOSTS = [
  'https://query1.finance.yahoo.com/v8/finance/chart/',
  'https://query2.finance.yahoo.com/v8/finance/chart/'
];

const SEARCH_HOSTS = [
  'https://query2.finance.yahoo.com/v1/finance/search',
  'https://query1.finance.yahoo.com/v1/finance/search'
];

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
  'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36';

function withTimeout(ms = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, done: () => clearTimeout(timer) };
}

function cleanSymbol(value) {
  return String(value || '').trim().toUpperCase();
}

function isValidSymbol(symbol) {
  return /^[A-Z0-9.^=+\-]{1,24}$/.test(symbol);
}

async function requestJson(url) {
  const timeout = withTimeout();
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/json,text/plain,*/*',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow',
      signal: timeout.signal
    });

    if (!response.ok) {
      throw new Error(`Yahoo HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    timeout.done();
  }
}

async function requestFirst(urls) {
  let lastError;
  for (const url of urls) {
    try {
      return await requestJson(url);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Yahoo request failed');
}

async function fetchQuote(symbolInput) {
  const symbol = cleanSymbol(symbolInput);
  if (!isValidSymbol(symbol)) throw new Error('Invalid symbol');

  const query =
    `${encodeURIComponent(symbol)}` +
    '?interval=1m&range=1d&includePrePost=true&events=div%2Csplits';

  const payload = await requestFirst(
    QUOTE_HOSTS.map(base => `${base}${query}`)
  );

  const result = payload?.chart?.result?.[0];
  const yahooError = payload?.chart?.error;

  if (yahooError) {
    throw new Error(
      yahooError.description || yahooError.code || 'Yahoo quote error'
    );
  }

  if (!result?.meta) throw new Error('No quote data');

  const meta = result.meta;
  const price = Number(
    meta.regularMarketPrice ??
    meta.previousClose ??
    meta.chartPreviousClose
  );
  const previousClose = Number(
    meta.previousClose ??
    meta.chartPreviousClose ??
    price
  );

  if (!Number.isFinite(price)) throw new Error('Invalid quote price');

  const change = price - previousClose;
  const changePercent = previousClose ? (change / previousClose) * 100 : 0;

  return {
    symbol,
    name: meta.longName || meta.shortName || symbol,
    shortName: meta.shortName || meta.longName || symbol,
    price,
    previousClose,
    change,
    changePercent,
    currency: meta.currency || '',
    exchange: meta.fullExchangeName || meta.exchangeName || '',
    marketState: meta.marketState || '',
    marketTime: meta.regularMarketTime
      ? new Date(meta.regularMarketTime * 1000).toISOString()
      : null,
    timezone: meta.exchangeTimezoneName || meta.timezone || '',
    source: 'Yahoo Finance'
  };
}

async function fetchQuotes(symbolInputs) {
  const symbols = [
    ...new Set(symbolInputs.map(cleanSymbol).filter(isValidSymbol))
  ].slice(0, 30);

  const results = await Promise.allSettled(symbols.map(fetchQuote));
  const quotes = [];
  const errors = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      quotes.push(result.value);
    } else {
      errors.push({
        symbol: symbols[index],
        message: result.reason?.message || 'Quote request failed'
      });
    }
  });

  return {
    quotes,
    errors,
    fetchedAt: new Date().toISOString(),
    source: 'Yahoo Finance'
  };
}

async function searchSymbols(queryInput) {
  const query = String(queryInput || '').trim().slice(0, 80);
  if (!query) return [];

  const suffix =
    `?q=${encodeURIComponent(query)}` +
    '&quotesCount=10&newsCount=0&enableFuzzyQuery=true' +
    '&quotesQueryId=tss_match_phrase_query';

  const payload = await requestFirst(
    SEARCH_HOSTS.map(base => `${base}${suffix}`)
  );

  const allowed = new Set([
    'EQUITY',
    'ETF',
    'MUTUALFUND',
    'INDEX',
    'CURRENCY',
    'CRYPTOCURRENCY'
  ]);

  return (payload?.quotes || [])
    .filter(item => item.symbol && allowed.has(item.quoteType || 'EQUITY'))
    .slice(0, 10)
    .map(item => ({
      symbol: cleanSymbol(item.symbol),
      name: item.longname || item.shortname || item.symbol,
      shortName: item.shortname || item.longname || item.symbol,
      exchange: item.exchDisp || item.exchange || '',
      quoteType: item.quoteType || '',
      currency: item.currency || ''
    }));
}

module.exports = { fetchQuotes, searchSymbols };
