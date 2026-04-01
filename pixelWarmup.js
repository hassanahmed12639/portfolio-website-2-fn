const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
const xlsx = require('xlsx');

// --- API CREDENTIALS SECTION --------------------------------------------------
// Pass credential values through the `options` object when calling startWarmup().
// Example:
// {
//   meta: { pixelId: 'YOUR_PIXEL_ID', testEventCode: 'YOUR_TEST_EVENT_CODE' },
//   ga4: { measurementId: 'G-XXXXXXX', apiSecret: 'YOUR_API_SECRET' }
// }
// -----------------------------------------------------------------------------

const MANDATORY_FIELDS = ['email', 'phone', 'first_name', 'last_name'];
const OPTIONAL_FIELDS = [
  'form_name',
  'form_id',
  'lead_source',
  'page_category',
  'transaction_id',
  'value',
  'currency',
  'product_name',
  'category',
];

const pendingQueue = [];
const stats = {
  queued: 0,
  sent: [],
  failed: [],
  skipped: [],
};
const MAX_RETRIES = 3;
const QUEUE_POLL_MS = 3000;
let queueWorkerStarted = false;

function normalizeHeader(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] !== undefined ? values[index].trim() : '';
    });
    return record;
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex');
}

function sanitizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function sanitizePhone(value) {
  return String(value || '').trim().replace(/[^0-9+]/g, '');
}

function sanitizeValue(value) {
  return String(value || '').trim();
}

function recordMissingFields(record) {
  return MANDATORY_FIELDS.filter((field) => {
    const value = String(record[normalizeHeader(field)] || '').trim();
    return value.length === 0;
  });
}

function safeEventName(eventType) {
  return String(eventType || 'event')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

function buildGa4Payload(eventType, record) {
  const email = sanitizeEmail(record.email);
  const phone = sanitizePhone(record.phone);
  const clientId = hashSha256(email || phone || String(Date.now()));

  const eventParams = {
    debug_mode: true,
    first_name: sanitizeValue(record.first_name),
    last_name: sanitizeValue(record.last_name),
  };

  OPTIONAL_FIELDS.forEach((field) => {
    const value = record[normalizeHeader(field)];
    if (value !== undefined && String(value).trim().length > 0) {
      eventParams[field] = isNumericField(field) ? Number(value) : sanitizeValue(value);
    }
  });

  const payload = {
    client_id: clientId,
    events: [
      {
        name: safeEventName(eventType),
        params: eventParams,
      },
    ],
  };

  if (email || phone) {
    payload.user_properties = {};
    if (email) payload.user_properties.email = { value: email };
    if (phone) payload.user_properties.phone = { value: phone };
  }

  return payload;
}

function buildMetaPayload(eventType, record) {
  const email = sanitizeEmail(record.email);
  const phone = sanitizePhone(record.phone);

  const userData = {};
  if (email) userData.em = hashSha256(email);
  if (phone) userData.ph = hashSha256(phone);

  const customData = {
    first_name: sanitizeValue(record.first_name),
    last_name: sanitizeValue(record.last_name),
  };

  OPTIONAL_FIELDS.forEach((field) => {
    const value = record[normalizeHeader(field)];
    if (value !== undefined && String(value).trim().length > 0) {
      customData[field] = isNumericField(field) ? Number(value) : sanitizeValue(value);
    }
  });

  return {
    data: [
      {
        event_name: eventType,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://track.itshassanahmed.com/dashboard/pixel-warmup',
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  };
}

function isNumericField(field) {
  return ['budget', 'value'].includes(field);
}

async function sendGa4Event(ga4Config, eventType, record) {
  const endpoint = 'https://www.google-analytics.com/debug/mp/collect';
  const url = `${endpoint}?measurement_id=${encodeURIComponent(ga4Config.measurementId)}&api_secret=${encodeURIComponent(ga4Config.apiSecret)}`;
  const payload = buildGa4Payload(eventType, record);

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  if (response.status !== 200) {
    throw new Error(`GA4 request failed with status ${response.status}`);
  }
}

async function sendMetaEvent(metaConfig, eventType, record) {
  const endpoint = `https://graph.facebook.com/v17.0/${encodeURIComponent(metaConfig.pixelId)}/events`;
  const url = `${endpoint}?test_event_code=${encodeURIComponent(metaConfig.testEventCode)}`;
  const payload = buildMetaPayload(eventType, record);

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });

  if (response.status !== 200) {
    throw new Error(`Meta CAPI request failed with status ${response.status}`);
  }
}

function getRandomDelayMs() {
  return 60000 + Math.floor(Math.random() * 60000);
}

function enqueueTask(task) {
  pendingQueue.push(task);
  stats.queued += 1;
  if (!queueWorkerStarted) {
    queueWorkerStarted = true;
    startQueueWorker();
  }
}

function startQueueWorker() {
  setInterval(async () => {
    const now = Date.now();
    const dueTasks = pendingQueue.filter((task) => task.nextRun <= now);
    if (!dueTasks.length) return;

    for (const task of dueTasks) {
      try {
        await processTask(task);
        removeTask(task);
      } catch (error) {
        task.attempts += 1;
        task.lastError = error instanceof Error ? error.message : String(error);
        if (task.attempts > MAX_RETRIES) {
          stats.failed.push({ rowIndex: task.rowIndex, eventType: task.eventType, error: task.lastError });
          removeTask(task);
          console.error(`[pixelWarmup] Failed row ${task.rowIndex}: ${task.lastError}`);
        } else {
          task.nextRun = Date.now() + getRandomDelayMs();
          console.warn(`[pixelWarmup] Retry row ${task.rowIndex} in ${Math.round((task.nextRun - Date.now()) / 1000)}s: ${task.lastError}`);
        }
      }
    }
  }, QUEUE_POLL_MS);
}

function removeTask(task) {
  const index = pendingQueue.indexOf(task);
  if (index !== -1) pendingQueue.splice(index, 1);
}

async function processTask(task) {
  const { eventType, record, credentials, rowIndex } = task;

  if (credentials.ga4) {
    await sendGa4Event(credentials.ga4, eventType, record);
  }

  if (credentials.meta) {
    await sendMetaEvent(credentials.meta, eventType, record);
  }

  stats.sent.push({ rowIndex, eventType, timestamp: new Date().toISOString() });
  console.log(`[pixelWarmup] Row ${rowIndex} sent successfully (${eventType}).`);
}

function sheetRowsToRecords(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((header) => normalizeHeader(String(header || '')));
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] !== undefined ? String(row[index]).trim() : '';
    });
    return record;
  });
}

async function loadCsvFile(csvFilePath) {
  const absolutePath = path.resolve(csvFilePath);
  const ext = path.extname(absolutePath).toLowerCase();

  if (ext === '.xlsv' || ext === '.xlsx') {
    const workbook = xlsx.readFile(absolutePath, { cellDates: true, raw: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) return [];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    return sheetRowsToRecords(rows);
  }

  const content = await fs.promises.readFile(absolutePath, 'utf8');
  return parseCsv(content);
}

/**
 * startWarmup(eventType, csvFilePath, options)
 *
 * eventType: Lead | Purchase | FormStart | FormComplete | etc.
 * csvFilePath: path to local CSV file
 * options: {
 *   credentials: {
 *     ga4?: { measurementId: string; apiSecret: string },
 *     meta?: { pixelId: string; testEventCode: string }
 *   }
 * }
 */
async function startWarmup(eventType, csvFilePath, options = {}) {
  if (!eventType || typeof eventType !== 'string') {
    throw new Error('eventType is required and must be a string');
  }

  if (!csvFilePath || typeof csvFilePath !== 'string') {
    throw new Error('csvFilePath is required and must be a string');
  }

  const credentials = options.credentials || {};
  if (!credentials.ga4 && !credentials.meta) {
    throw new Error('At least one of GA4 or Meta credentials is required');
  }

  if (credentials.ga4) {
    const { measurementId, apiSecret } = credentials.ga4;
    if (!measurementId || !apiSecret) {
      throw new Error('GA4 credentials require measurementId and apiSecret');
    }
  }

  if (credentials.meta) {
    const { pixelId, testEventCode } = credentials.meta;
    if (!pixelId || !testEventCode) {
      throw new Error('Meta credentials require pixelId and testEventCode');
    }
  }

  const records = await loadCsvFile(csvFilePath);
  if (!records.length) {
    throw new Error('CSV file contains no records');
  }

  let skippedRows = 0;

  records.forEach((record, index) => {
    const rowIndex = index + 2;
    const missing = recordMissingFields(record);
    if (missing.length) {
      skippedRows += 1;
      stats.skipped.push({ rowIndex, missing, rawRecord: record });
      console.warn(`[pixelWarmup] Skipped row ${rowIndex}: missing mandatory fields: ${missing.join(', ')}`);
      return;
    }

    const task = {
      rowIndex,
      eventType,
      record: {
        ...record,
        email: sanitizeEmail(record.email),
        phone: sanitizePhone(record.phone),
        first_name: sanitizeValue(record.first_name),
        last_name: sanitizeValue(record.last_name),
      },
      credentials,
      attempts: 0,
      nextRun: Date.now() + getRandomDelayMs(),
    };

    enqueueTask(task);
  });

  return {
    status: 'started',
    eventType,
    csvFilePath: path.resolve(csvFilePath),
    queued: pendingQueue.length,
    skipped: skippedRows,
    stats,
  };
}

module.exports = {
  startWarmup,
  stats,
  MANDATORY_FIELDS,
  OPTIONAL_FIELDS,
};
