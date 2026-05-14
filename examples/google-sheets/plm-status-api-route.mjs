/**
 * Example backend route for PLM Status.
 *
 * Works with:
 * - Express
 * - Vercel/Node serverless with small adjustments
 * - Any Node backend that supports Request/Response style handlers
 *
 * Required env:
 *   PLM_STATUS_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
 */

export async function getPlmStatus(req, res) {
  try {
    const appsScriptUrl = process.env.PLM_STATUS_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return res.status(500).json({
        ok: false,
        error: 'Missing PLM_STATUS_APPS_SCRIPT_URL',
      });
    }

    const upstream = await fetch(appsScriptUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: `Apps Script upstream failed with status ${upstream.status}`,
      });
    }

    const payload = await upstream.json();

    if (!payload?.ok) {
      return res.status(502).json({
        ok: false,
        error: payload?.error || 'Apps Script returned an invalid response',
      });
    }

    const rows = Array.isArray(payload.rows) ? payload.rows.map(mapPlmRow) : [];

    return res.status(200).json({
      ok: true,
      source: payload.source || 'google-sheet',
      sheetName: payload.sheetName || 'PLM Status',
      updatedAt: payload.updatedAt || new Date().toISOString(),
      count: rows.length,
      rows,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function writePlmStatus(req, res) {
  try {
    const appsScriptUrl = process.env.PLM_STATUS_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return res.status(500).json({
        ok: false,
        error: 'Missing PLM_STATUS_APPS_SCRIPT_URL',
      });
    }

    const action = req.body?.action;
    const rowId = req.body?.rowId;
    const data = req.body?.data;

    if (!action || !data) {
      return res.status(400).json({
        ok: false,
        error: 'Body must include action and data',
      });
    }

    const upstream = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        rowId,
        data,
      }),
    });

    if (!upstream.ok) {
      return res.status(502).json({
        ok: false,
        error: `Apps Script upstream failed with status ${upstream.status}`,
      });
    }

    const payload = await upstream.json();
    return res.status(payload.ok ? 200 : 502).json(payload);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function mapPlmRow(row) {
  return {
    id: row.id || '',
    plm: row.plm || '',
    symptom: row.symptom || '',
    group: row.group || '',
    pic: row.pic || '',
    status: row.status || '',
    model: row.model || '',
    requestDate: row.request_date || '',
    registerDate: row.register_date || '',
    confirmDate: row.confirm_date || '',
    channel: row.channel || '',
    remark: row.remark || '',
    raw: row,
  };
}

/**
 * Express example:
 *
 * import express from 'express';
 * import { getPlmStatus, writePlmStatus } from './plm-status-api-route.mjs';
 *
 * const app = express();
 * app.use(express.json());
 * app.get('/api/plm-status', getPlmStatus);
 * app.post('/api/plm-status', writePlmStatus);
 * app.listen(3001);
 */
