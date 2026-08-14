#!/usr/bin/env node
/*
  Local dev server for the widget runtime.

  The real backend is ASP.NET Framework 4.8 and only builds on Windows, and the
  visitor endpoints (step A2) are not written yet — so this stands in for both.
  It serves the runtime files and mocks exactly the endpoints the widget calls,
  which means the whole visitor flow can be exercised in a browser today.

  Plain Node, no dependencies:

      node widget-runtime/dev-server.mjs
      open http://localhost:4300/demo/

  Mocked endpoints mirror the contract the widget expects, so when the real
  controller lands the widget should need no changes — only a different apiBase.
*/

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4300);

// When set, StartConversation mints a real HS256 visitor token instead of a stub,
// signed the way WidgetPublicLogic.IssueVisitorToken will sign it in production.
// Set this to the same value as WIDGET_TOKEN_SECRET in pulseem-communication and
// the widget can join a real conversation room on a locally running socket service.
const WIDGET_TOKEN_SECRET = process.env.WIDGET_TOKEN_SECRET || '';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

// Mirrors ServiceTokenSigner.Sign + WidgetPublicLogic claim shape, so what the
// socket receives here is byte-identical in structure to what the .NET API will send.
function mintVisitorToken(conversationId, accountId, ttlSeconds = 3600) {
  if (!WIDGET_TOKEN_SECRET) return 'mock-visitor-token.' + conversationId;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = b64url(JSON.stringify({
    conversationId, accountId, iat: now, exp: now + ttlSeconds,
  }));
  const sig = b64url(
    crypto.createHmac('sha256', WIDGET_TOKEN_SECRET).update(`${header}.${payload}`).digest(),
  );
  return `${header}.${payload}.${sig}`;
}

// Reply the fake agent sends back, so the inbound path is visible without an
// agent dashboard running.
const AUTO_REPLY_MS = 2500;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

/* ── In-memory store ─────────────────────────────────────────────────────── */

const conversations = new Map(); // conversationId -> { messages: [], fields, feedback, optIn }

// Stands in for the SubAccountId the real API resolves from the widget's GUID.
// Must match the accountId an agent connects with, or they land in different rooms.
const MOCK_ACCOUNT_ID = Number(process.env.MOCK_ACCOUNT_ID || 999999);

const WIDGET_CONFIG = {
  widgetId: '11111111-2222-3333-4444-555555555555',
  status: 'active',
  name: 'Pulseem Support',
  websiteUrl: 'http://localhost:4300',
  position: 'bottom-right',
  primaryColor: '#c2185b',
  greetingMessage: 'Hi! Any questions? We usually reply in a few minutes.',
  showBranding: true,

  autoOpen: false,
  autoOpenDelay: 5,
  enableAi: false,
  enableOfficeHours: false,
  timezone: 'UTC',
  emailRouting: '',
  awayMessage: 'We are currently offline. Leave a message and we will reply by email.',
  weeklySchedule: {
    monday:    { enabled: true,  startTime: '09:00', endTime: '17:00' },
    tuesday:   { enabled: true,  startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true,  startTime: '09:00', endTime: '17:00' },
    thursday:  { enabled: true,  startTime: '09:00', endTime: '17:00' },
    friday:    { enabled: true,  startTime: '09:00', endTime: '17:00' },
    saturday:  { enabled: false, startTime: '09:00', endTime: '17:00' },
    sunday:    { enabled: false, startTime: '09:00', endTime: '17:00' }
  },

  enableIdentification: true,
  identificationFields: [
    { id: 'f1', name: 'fullName', label: 'Your name',  type: 'text',  required: true },
    { id: 'f2', name: 'email',    label: 'Email',      type: 'email', required: true },
    { id: 'f3', name: 'phone',    label: 'Phone',      type: 'phone', required: false }
  ],

  enableFeedback: true,
  feedbackTiming: 'conversation_ends',
  feedbackDelaySeconds: 10,
  enableStarRating: true,
  enableFreeText: true,
  enablePredefinedTags: true,
  predefinedTags: ['Helpful', 'Fast', 'Knew the answer'],
  feedbackRouting: 'all_agents',

  enableMarketing: true,
  marketingTiming: 'after_first_response',
  marketingRequestPhone: true
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const log = (...a) => console.log('  ', ...a);

function send(res, status, body, type = MIME['.json']) {
  const payload = type === MIME['.json'] ? JSON.stringify(body) : body;
  res.writeHead(status, {
    'Content-Type': type,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

// The real API wraps everything in PulseemResponse — mirror it so the widget's
// unwrap() is exercised here exactly as it will be in production.
const wrap = (data) => ({ StatusCode: 200, Message: 'OK', Data: data });

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
  });
}

function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';

  const full = path.join(ROOT, rel);
  // Never serve outside the runtime directory.
  if (!full.startsWith(ROOT)) return send(res, 403, { error: 'Forbidden' });

  fs.readFile(full, (err, buf) => {
    if (err) return send(res, 404, { error: 'Not found: ' + rel });
    send(res, 200, buf, MIME[path.extname(full)] || 'application/octet-stream');
  });
}

/* ── Server ──────────────────────────────────────────────────────────────── */

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  if (req.method === 'OPTIONS') return send(res, 204, '');

  // Public widget config — the real one is [AllowAnonymous] and already exists.
  if (p.startsWith('/api/Widget/GetByWidgetId/')) {
    log('GET  config');
    return send(res, 200, wrap(WIDGET_CONFIG));
  }

  // ── Visitor endpoints (step A2 — not yet built in WebSiteAPI) ──────────
  if (p === '/api/WidgetPublic/StartConversation' && req.method === 'POST') {
    const body = await readBody(req);
    const conversationId = crypto.randomUUID();
    conversations.set(conversationId, { messages: [], fields: body.fields || {} });
    log('POST StartConversation →', conversationId.slice(0, 8), JSON.stringify(body.fields || {}),
        WIDGET_TOKEN_SECRET ? '(real token)' : '(stub token)');
    return send(res, 200, wrap({
      conversationId,
      visitorToken: mintVisitorToken(conversationId, MOCK_ACCOUNT_ID)
    }));
  }

  if (p === '/api/WidgetPublic/SendMessage' && req.method === 'POST') {
    const body = await readBody(req);
    const convo = conversations.get(body.conversationId);
    if (!convo) return send(res, 404, { error: 'Conversation not found' });

    convo.messages.push({ sender: 'visitor', content: body.content, sentAt: new Date().toISOString() });
    log('POST SendMessage    →', JSON.stringify(body.content));

    // Stand in for an agent replying, so the inbound path is testable.
    setTimeout(() => {
      convo.messages.push({
        sender: 'agent',
        senderName: 'Mock Agent',
        content: 'Thanks — an agent would answer here. (auto-reply from dev-server)',
        sentAt: new Date().toISOString()
      });
    }, AUTO_REPLY_MS);

    return send(res, 200, wrap({ ok: true }));
  }

  if (p.startsWith('/api/WidgetPublic/GetMessages/')) {
    const id = p.split('/').pop();
    const convo = conversations.get(id);
    if (!convo) return send(res, 404, { error: 'Conversation not found' });
    return send(res, 200, wrap(convo.messages));
  }

  if (p === '/api/WidgetPublic/MarketingOptIn' && req.method === 'POST') {
    const body = await readBody(req);
    const convo = conversations.get(body.conversationId);
    if (convo) convo.optIn = { email: body.email, phone: body.phone };
    log('POST MarketingOptIn →', body.email, body.phone || '');
    return send(res, 200, wrap({ ok: true }));
  }

  if (p === '/api/WidgetPublic/SubmitFeedback' && req.method === 'POST') {
    const body = await readBody(req);
    const convo = conversations.get(body.conversationId);
    if (convo) convo.feedback = { rating: body.rating, tags: body.tags, text: body.text };
    log('POST SubmitFeedback →', body.rating + '★', (body.tags || []).join(', '), JSON.stringify(body.text || ''));
    return send(res, 200, wrap({ ok: true }));
  }

  // Inspect what the mock captured — the local stand-in for querying the DB.
  if (p === '/__state') {
    return send(res, 200, Object.fromEntries(conversations));
  }

  return serveStatic(req, res, p);
});

// A stale server from an earlier run is the usual cause here, and Node's default
// EADDRINUSE stack trace does not say how to fix it.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Port ${PORT} is already in use — most likely an earlier dev-server.\n`);
    console.error(`    stop it   pkill -f dev-server.mjs`);
    console.error(`    or move   PORT=4301 node dev-server.mjs`);
    console.error(`              (then update apiBase/assetBase in demo/index.html)\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`\n  Pulseem widget dev server\n`);
  console.log(`   demo page   http://localhost:${PORT}/demo/`);
  console.log(`   captured    http://localhost:${PORT}/__state`);
  console.log(`   widget id   ${WIDGET_CONFIG.widgetId}\n`);
  console.log(`  Request log:`);
});
