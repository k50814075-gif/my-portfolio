'use strict';
const { fetchQuotes } = require('../lib/yahoo');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  try {
    const raw = Array.isArray(req.query?.symbols) ? req.query.symbols.join(',') : (req.query?.symbols || '');
    const symbols = String(raw).split(',').map(v => v.trim()).filter(Boolean);
    if (!symbols.length) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'symbols query is required' }));
    }
    const data = await fetchQuotes(symbols);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=300');
    res.statusCode = 200;
    return res.end(JSON.stringify(data));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: error.message || 'Yahoo quote request failed' }));
  }
};
