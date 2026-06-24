'use strict';
const { searchSymbols } = require('../lib/yahoo');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
  try {
    const query = Array.isArray(req.query?.q) ? req.query.q[0] : (req.query?.q || '');
    const results = await searchSymbols(query);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.statusCode = 200;
    return res.end(JSON.stringify({ results }));
  } catch (error) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: error.message || 'Yahoo search request failed' }));
  }
};
