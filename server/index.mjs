import express from 'express';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getPlmStatus, writePlmStatus } from '../examples/google-sheets/plm-status-api-route.mjs';

loadEnvFile();

const app = express();
const port = Number(process.env.PLM_STATUS_API_PORT || 3001);

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'plm-status-api',
    appsScriptConfigured: Boolean(process.env.PLM_STATUS_APPS_SCRIPT_URL),
  });
});

app.get('/api/plm-status', getPlmStatus);
app.post('/api/plm-status', writePlmStatus);

app.listen(port, () => {
  console.log(`PLM Status API running at http://localhost:${port}`);
});

function loadEnvFile() {
  const envPath = resolve(process.cwd(), '.env');
  if (!existsSync(envPath)) return;

  const source = readFileSync(envPath, 'utf8');
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && !(key in process.env)) {
      process.env[key] = value;
    }
  }
}
