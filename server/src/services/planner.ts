import type { Express } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { assertSafeOrigin } from '../security.js';

import { bounded, endpoint, model, plannerReply } from './plannerReply.js';

export function addPlannerRoutes(app: Express, dataRoot: string) {
  const keyFile = join(dataRoot, 'groq-key');
  const getKey = async () => process.env.GROQ_API_KEY?.trim() || await readFile(keyFile, 'utf8').then(value => value.trim()).catch(() => '');
  app.get('/api/planner/status', async (_req, res) => {
    res.set('Cache-Control', 'no-store').json({ configured: Boolean(await getKey()) });
  });
  app.post('/api/planner/connect', async (req, res) => {
    assertSafeOrigin(req);
    const key = bounded(req.body?.key, 256);
    if (!/^gsk_[A-Za-z0-9_-]{12,252}$/.test(key)) { res.status(400).json({ error: 'Enter a valid Groq API key.' }); return; }
    try {
      const upstream = await fetch(endpoint + '/models/' + encodeURIComponent(model), {
        headers: { Authorization: 'Bearer ' + key }, redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      await upstream.body?.cancel();
      if (!upstream.ok) { res.status(502).json({ error: 'Groq could not verify the key for the planning model.' }); return; }
      await writeFile(keyFile, key, { mode: 0o600 });
      res.json({ configured: true });
    } catch { res.status(502).json({ error: 'Could not reach Groq. Try again.' }); }
  });
  app.post('/api/planner/reply', async (req, res) => {
    assertSafeOrigin(req);
    const key = await getKey();
    const response = await plannerReply(req.body, key);
    res.status(response.status).json(await response.json());
  });
}
