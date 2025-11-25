const axios = require('axios');

module.exports = function (app) {
  app.get('/api/ics', async (req, res) => {
    try {
      const raw = String(req.query.url || '').trim();
      if (!raw) {
        res.status(400).send('missing url');
        return;
      }
      let u;
      try {
        u = new URL(raw);
      } catch {
        res.status(400).send('invalid url');
        return;
      }
      const hostOk = u.hostname.endsWith('.instructure.com');
      const pathOk = u.pathname.toLowerCase().startsWith('/feeds/calendars/');
      if (!hostOk || !pathOk) {
        res.status(403).send('forbidden');
        return;
      }
      const resp = await axios.get(u.toString(), {
        responseType: 'text',
        timeout: 10000,
        headers: { 'Accept': 'text/calendar, text/plain;q=0.9, */*;q=0.8' }
      });
      const text = typeof resp.data === 'string' ? resp.data : String(resp.data || '');
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.status(200).send(text);
    } catch (e) {
      res.status(502).send('upstream error');
    }
  });
};

