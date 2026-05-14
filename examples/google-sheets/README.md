# Google Sheet -> PLM Status Examples

This folder contains two working patterns for pulling PLM Status data from Google Sheet:

1. `plm-status-apps-script.gs`
   Exposes your Google Sheet as a JSON API using Google Apps Script and also accepts create or update requests.

2. `plm-status-api-route.mjs`
   A backend proxy route that fetches from the Apps Script endpoint and returns clean JSON for your frontend.

## Recommended flow

`Google Sheet -> Apps Script JSON -> Backend API Route -> React page`

This keeps the frontend simple and gives you one place to normalize or protect data later.

## Expected Google Sheet columns

The first row should be the header row and must match these names:

- `PLM`
- `Symptom`
- `Group`
- `PIC`
- `Status`
- `Model`
- `Request date`
- `Register date`
- `Confirm date`
- `Channel`
- `remark`

Use `Remark` with capital `R` if possible to match the required header list exactly.

## Step 1: Deploy Apps Script

1. Open your Google Sheet.
2. Go to `Extensions -> Apps Script`.
3. Replace the default code with the contents of `plm-status-apps-script.gs`.
4. Set `SHEET_NAME` in the script to your tab name.
5. Click `Deploy -> New deployment`.
6. Choose `Web app`.
7. Set access to a mode that fits your use case:
   - `Anyone`
   - `Anyone with Google account`
   - or your Google Workspace domain
8. Copy the Web App URL.

## Step 2: Use the backend route

Set this environment variable in your backend:

```env
PLM_STATUS_APPS_SCRIPT_URL=https://script.google.com/macros/s/your-deployment-id/exec
```

Then use the route in `plm-status-api-route.mjs`.

## Example frontend fetch

```ts
const response = await fetch('/api/plm-status');
const payload = await response.json();

console.log(payload.rows);
```

## Example create request

```ts
await fetch('/api/plm-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'create',
    data: {
      plm: 'PLM-001',
      symptom: 'Cannot sync BOM',
      group: 'System',
      pic: 'Michael Lee',
      status: 'In Progress',
      model: 'Galaxy A',
      request_date: '2026-05-04',
      register_date: '2026-05-04',
      confirm_date: '',
      channel: 'Email',
      remark: 'Created from web',
    },
  }),
});
```

## Example update request

```ts
await fetch('/api/plm-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'update',
    rowId: 'row-5',
    data: {
      status: 'Done',
      confirm_date: '2026-05-05',
      remark: 'Updated from web',
    },
  }),
});
```

## Realtime update options

Google Sheet is not truly realtime for web clients, so use one of these:

1. Poll every 30 to 60 seconds from the frontend.
2. Poll from the backend and cache for 15 to 30 seconds.
3. Use an Apps Script trigger to sync rows into Supabase or Postgres for near-realtime UI.

## Suggested response shape

```json
{
  "source": "google-sheet",
  "sheetName": "PLM Status",
  "updatedAt": "2026-05-04T13:00:00.000Z",
  "count": 2,
  "rows": [
    {
      "plm": "PLM-1001",
      "symptom": "Cannot sync BOM",
      "group": "System",
      "pic": "Michael Lee",
      "status": "In Progress",
      "model": "Galaxy A",
      "request_date": "2026-05-04",
      "register_date": "2026-05-04",
      "confirm_date": "",
      "channel": "Email",
      "remark": "Waiting for vendor confirmation"
    }
  ]
}
```
