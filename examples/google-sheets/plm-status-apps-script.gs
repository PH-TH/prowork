const SHEET_NAME = 'PLM Status';
const REQUIRED_HEADERS = [
  'PLM',
  'Symptom',
  'Group',
  'PIC',
  'Status',
  'Model',
  'Request date',
  'Register date',
  'Confirm date',
  'Channel',
  'Remark',
];

function doGet() {
  try {
    const sheet = getSheetOrThrow();
    const values = sheet.getDataRange().getDisplayValues();

    if (values.length < 2) {
      return jsonResponse({
        ok: true,
        source: 'google-sheet',
        sheetName: SHEET_NAME,
        updatedAt: new Date().toISOString(),
        count: 0,
        rows: [],
      });
    }

    const headers = values[0];
    validateHeaders(headers);

    const rows = values
      .slice(1)
      .filter((row) => row.some((cell) => String(cell).trim() !== ''))
      .map((row, index) => mapRow(headers, row, index + 2));

    return jsonResponse({
      ok: true,
      source: 'google-sheet',
      sheetName: SHEET_NAME,
      updatedAt: new Date().toISOString(),
      count: rows.length,
      rows,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = String(payload.action || '').toLowerCase();
    const data = payload.data || {};
    const rowId = payload.rowId || payload.id || '';

    if (!action) {
      throw new Error('Missing action. Use "create" or "update".');
    }

    const sheet = getSheetOrThrow();
    const values = sheet.getDataRange().getDisplayValues();
    const headers = values[0] || [];
    validateHeaders(headers);

    if (action === 'create') {
      const newRow = buildSheetRow(headers, data);
      sheet.appendRow(newRow);

      return jsonResponse({
        ok: true,
        action: 'create',
        message: 'Row created successfully.',
      });
    }

    if (action === 'update') {
      if (!rowId) throw new Error('Missing rowId for update.');

      const rowNumber = extractRowNumber(rowId);
      if (rowNumber < 2) throw new Error('Invalid rowId.');

      const currentRow = sheet.getRange(rowNumber, 1, 1, headers.length).getDisplayValues()[0];
      const nextRow = buildMergedSheetRow(headers, currentRow, data);
      sheet.getRange(rowNumber, 1, 1, headers.length).setValues([nextRow]);

      return jsonResponse({
        ok: true,
        action: 'update',
        rowId,
        message: 'Row updated successfully.',
      });
    }

    throw new Error(`Unsupported action "${action}".`);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: String(error),
    });
  }
}

function getSheetOrThrow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error(`Sheet "${SHEET_NAME}" not found.`);
  return sheet;
}

function validateHeaders(headers) {
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missing.length) {
    throw new Error(`Missing required headers: ${missing.join(', ')}`);
  }
}

function mapRow(headers, row, rowNumber) {
  const item = { id: `row-${rowNumber}` };

  headers.forEach((header, index) => {
    item[normalizeHeader(header)] = row[index] || '';
  });

  return item;
}

function buildSheetRow(headers, data) {
  return headers.map((header) => valueForHeader(header, data) || '');
}

function buildMergedSheetRow(headers, currentRow, updates) {
  return headers.map((header, index) => {
    const nextValue = valueForHeader(header, updates);
    return nextValue === undefined || nextValue === null || nextValue === '' ? currentRow[index] : nextValue;
  });
}

function valueForHeader(header, data) {
  const normalized = normalizeHeader(header);
  return data[header] ?? data[normalized];
}

function extractRowNumber(rowId) {
  const match = String(rowId).match(/^row-(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeHeader(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w]/g, '');
}
