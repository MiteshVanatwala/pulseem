/*
  Pulseem widget — the app inside the iframe.

  Screen flow:
      bubble → [identification] → chat → [marketing opt-in] → [feedback]

  Bracketed screens only appear when the widget config enables them. The parent
  page is reached only through postMessage; it never sees the DOM in here.

  Vanilla on purpose — no build step, so this file is what ships.
*/
(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var API_BASE = (params.get('apiBase') || '').replace(/\/$/, '');
  var SOCKET_URL = params.get('socketUrl') || '';
  // The customer's page URL, passed in by pulseem.js which runs there.
  var HOST_URL = params.get('pageUrl') || '';
  var WIDGET_ID = params.get('widgetId') || '';
  var SIDE = params.get('side') === 'left' ? 'left' : 'right';

  var el = {
    bubble: document.getElementById('bubble'),
    greeting: document.getElementById('greeting'),
    panel: document.getElementById('panel'),
    body: document.getElementById('body'),
    title: document.getElementById('head-title'),
    status: document.getElementById('head-status'),
    branding: document.getElementById('branding'),
    close: document.getElementById('close')
  };

  var state = {
    config: null,
    open: false,
    conversationId: null,
    visitorToken: null,
    identified: false,
    messages: [],
    sending: false,
    marketingShown: false,
    firstAgentReplySeen: false,
    socket: null,
    pollTimer: null
  };

  document.body.setAttribute('data-side', SIDE);

  // ── Parent bridge ────────────────────────────────────────────────────────

  function toParent(msg) {
    if (window.parent !== window) window.parent.postMessage(msg, '*');
  }

  window.addEventListener('message', function (event) {
    var data = event.data || {};
    if (data.type === 'pulseem:config' && data.config) applyConfig(data.config);
    else if (data.type === 'pulseem:autoOpen') openPanel();
    else if (data.type === 'pulseem:forceClose') closePanel(true);
  });

  // ── Config ───────────────────────────────────────────────────────────────

  function applyConfig(config) {
    if (state.config) return; // first one wins; the loader may send it twice
    state.config = config;

    if (config.primaryColor) {
      document.documentElement.style.setProperty('--brand', config.primaryColor);
      document.documentElement.style.setProperty('--brand-ink', readableInk(config.primaryColor));
    }
    el.title.textContent = config.name || 'Chat';
    el.branding.hidden = config.showBranding === false;

    if (config.greetingMessage) {
      el.greeting.textContent = config.greetingMessage;
      el.greeting.hidden = false;
      // Fades out on its own so it doesn't sit over the host page indefinitely.
      window.setTimeout(function () { el.greeting.hidden = true; }, 8000);
    }

    el.status.textContent = isWithinOfficeHours(config) ? '' : 'Away';
  }

  // Pick black or white text so the header stays legible on any brand colour.
  function readableInk(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex).trim());
    if (!m) return '#fff';
    var r = parseInt(m[1], 16), g = parseInt(m[2], 16), b = parseInt(m[3], 16);
    // Relative luminance, rounded to the usual 0.6 switch point.
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#16181d' : '#fff';
  }

  function isWithinOfficeHours(config) {
    if (!config.enableOfficeHours || !config.weeklySchedule) return true;
    var days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var now = new Date();
    var today = config.weeklySchedule[days[now.getDay()]];
    if (!today || !today.enabled) return false;
    var mins = now.getHours() * 60 + now.getMinutes();
    return mins >= toMinutes(today.startTime) && mins < toMinutes(today.endTime);
  }

  function toMinutes(hhmm) {
    var p = String(hhmm || '00:00').split(':');
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  // ── Open / close ─────────────────────────────────────────────────────────

  function openPanel() {
    if (state.open) return;
    state.open = true;
    el.bubble.hidden = true;
    el.greeting.hidden = true;
    el.panel.hidden = false;
    el.bubble.setAttribute('aria-expanded', 'true');
    toParent({ type: 'pulseem:open' });
    route();
  }

  function closePanel(skipFeedback) {
    var config = state.config || {};
    var wantsFeedback =
      !skipFeedback &&
      config.enableFeedback &&
      config.feedbackTiming === 'conversation_ends' &&
      state.conversationId &&
      !state.feedbackDone;

    if (wantsFeedback) { renderFeedback(); return; }

    state.open = false;
    el.panel.hidden = true;
    el.bubble.hidden = false;
    el.bubble.setAttribute('aria-expanded', 'false');
    toParent({ type: 'pulseem:close' });
  }

  el.bubble.addEventListener('click', openPanel);
  el.close.addEventListener('click', function () { closePanel(false); });

  // ── Routing between screens ──────────────────────────────────────────────

  function route() {
    var config = state.config || {};
    if (config.enableIdentification && !state.identified) renderIdentification();
    else if (!state.conversationId) startConversation({});
    else renderChat();
  }

  function setBody(html, isChat) {
    el.body.className = 'panel-body' + (isChat ? ' is-chat' : '');
    el.body.innerHTML = html;
  }

  // ── Identification ───────────────────────────────────────────────────────

  function renderIdentification() {
    var config = state.config;
    var fields = config.identificationFields || [];
    var html = '<p class="form-intro">Tell us a little about you so we can help.</p><form id="ident-form" novalidate>';

    fields.forEach(function (f) {
      var input = f.type === 'textarea'
        ? '<textarea id="f-' + esc(f.id) + '" name="' + esc(f.name) + '"></textarea>'
        : '<input id="f-' + esc(f.id) + '" name="' + esc(f.name) + '" type="' + inputType(f.type) + '">';
      html +=
        '<div class="field">' +
          '<label for="f-' + esc(f.id) + '">' + esc(f.label || f.name) +
            (f.required ? ' <span class="req">*</span>' : '') +
          '</label>' + input +
          '<div class="field-error" id="e-' + esc(f.id) + '" hidden></div>' +
        '</div>';
    });

    html += '<button type="submit" class="btn">Start chat</button></form>';
    setBody(html);

    document.getElementById('ident-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var values = {};
      var ok = true;

      fields.forEach(function (f) {
        var input = document.getElementById('f-' + f.id);
        var err = document.getElementById('e-' + f.id);
        var value = (input.value || '').trim();
        err.hidden = true;

        if (f.required && !value) { err.textContent = 'This field is required.'; err.hidden = false; ok = false; return; }
        if (value && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          err.textContent = 'Enter a valid email address.'; err.hidden = false; ok = false; return;
        }
        if (value) values[f.name] = value;
      });

      if (!ok) return;
      state.identified = true;
      startConversation(values);
    });
  }

  function inputType(t) {
    if (t === 'email') return 'email';
    if (t === 'phone') return 'tel';
    return 'text';
  }

  // ── Chat ─────────────────────────────────────────────────────────────────

  function renderChat() {
    setBody(
      '<div class="messages" id="messages"></div>' +
      '<div class="composer">' +
        '<textarea id="composer-input" rows="1" placeholder="Type your message..." aria-label="Message"></textarea>' +
        '<button id="composer-send" class="send-btn" type="button" aria-label="Send" disabled>' +
          '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">' +
            '<path fill="currentColor" d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>' +
        '</button>' +
      '</div>',
      true
    );

    if (!isWithinOfficeHours(state.config) && state.config.awayMessage) {
      pushMessage({ sender: 'system', content: state.config.awayMessage });
    }
    paintMessages();

    var input = document.getElementById('composer-input');
    var send = document.getElementById('composer-send');

    input.addEventListener('input', function () {
      send.disabled = !input.value.trim();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 96) + 'px';
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });
    send.addEventListener('click', submit);

    function submit() {
      var text = input.value.trim();
      if (!text || state.sending) return;
      input.value = '';
      input.style.height = 'auto';
      send.disabled = true;
      sendMessage(text);
    }
  }

  function pushMessage(msg) {
    state.messages.push(msg);
    if (msg.sender === 'agent' || msg.sender === 'ai') {
      if (!state.firstAgentReplySeen) {
        state.firstAgentReplySeen = true;
        maybeShowMarketing('after_first_response');
      }
    }
  }

  function paintMessages() {
    var box = document.getElementById('messages');
    if (!box) return;
    box.innerHTML = state.messages.map(function (m) {
      var cls = 'msg msg-' + (m.sender || 'agent');
      var meta = m.senderName ? '<span class="msg-meta">' + esc(m.senderName) + '</span>' : '';
      return '<div class="' + cls + '">' + esc(m.content) + meta + '</div>';
    }).join('');
    box.scrollTop = box.scrollHeight;
  }

  // ── Marketing opt-in ─────────────────────────────────────────────────────

  function maybeShowMarketing(timing) {
    var config = state.config || {};
    if (!config.enableMarketing || state.marketingShown) return;
    if (config.marketingTiming !== timing) return;
    state.marketingShown = true;
    renderMarketing();
  }

  function renderMarketing() {
    var wantsPhone = state.config.marketingRequestPhone;
    setBody(
      '<p class="form-intro">Want news and offers from us? Leave your details — you can unsubscribe any time.</p>' +
      '<form id="mk-form" novalidate>' +
        '<div class="field"><label for="mk-email">Email <span class="req">*</span></label>' +
        '<input id="mk-email" type="email"><div class="field-error" id="mk-err" hidden></div></div>' +
        (wantsPhone ? '<div class="field"><label for="mk-phone">Phone</label><input id="mk-phone" type="tel"></div>' : '') +
        '<button type="submit" class="btn">Sign me up</button>' +
        '<button type="button" id="mk-skip" class="btn btn-secondary">No thanks</button>' +
      '</form>'
    );

    document.getElementById('mk-skip').addEventListener('click', renderChat);
    document.getElementById('mk-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('mk-email').value.trim();
      var err = document.getElementById('mk-err');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        err.textContent = 'Enter a valid email address.'; err.hidden = false; return;
      }
      post('/api/WidgetPublic/MarketingOptIn', {
        conversationId: state.conversationId,
        visitorToken: state.visitorToken,
        email: email,
        phone: wantsPhone ? document.getElementById('mk-phone').value.trim() : ''
      }, function () { renderChat(); });
    });
  }

  // ── Feedback ─────────────────────────────────────────────────────────────

  function renderFeedback() {
    var config = state.config;
    var rating = 0;
    var chosen = [];

    var html = '<p class="form-intro">How did we do?</p><form id="fb-form">';
    if (config.enableStarRating) {
      html += '<div class="stars" id="stars">';
      for (var i = 1; i <= 5; i++) {
        html += '<button type="button" class="star" data-v="' + i + '" aria-label="' + i + ' stars">★</button>';
      }
      html += '</div>';
    }
    if (config.enablePredefinedTags && (config.predefinedTags || []).length) {
      html += '<div class="tags">' + config.predefinedTags.map(function (t) {
        return '<button type="button" class="tag" data-t="' + esc(t) + '">' + esc(t) + '</button>';
      }).join('') + '</div>';
    }
    if (config.enableFreeText) {
      html += '<div class="field"><label for="fb-text">Anything else?</label><textarea id="fb-text"></textarea></div>';
    }
    html += '<button type="submit" class="btn">Send feedback</button>' +
            '<button type="button" id="fb-skip" class="btn btn-secondary">Skip</button></form>';
    setBody(html);

    var stars = document.getElementById('stars');
    if (stars) {
      stars.addEventListener('click', function (e) {
        var btn = e.target.closest('.star');
        if (!btn) return;
        rating = parseInt(btn.getAttribute('data-v'), 10);
        Array.prototype.forEach.call(stars.children, function (s, i) {
          s.classList.toggle('on', i < rating);
        });
      });
    }

    var tagBox = el.body.querySelector('.tags');
    if (tagBox) {
      tagBox.addEventListener('click', function (e) {
        var btn = e.target.closest('.tag');
        if (!btn) return;
        var t = btn.getAttribute('data-t');
        var at = chosen.indexOf(t);
        if (at === -1) chosen.push(t); else chosen.splice(at, 1);
        btn.classList.toggle('on', at === -1);
      });
    }

    function finish() {
      state.feedbackDone = true;
      setBody('<p class="notice">Thanks for your feedback.</p>');
      window.setTimeout(function () { closePanel(true); }, 1400);
    }

    document.getElementById('fb-skip').addEventListener('click', function () {
      state.feedbackDone = true;
      closePanel(true);
    });

    document.getElementById('fb-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var textEl = document.getElementById('fb-text');
      post('/api/WidgetPublic/SubmitFeedback', {
        conversationId: state.conversationId,
        visitorToken: state.visitorToken,
        rating: rating,
        tags: chosen,
        text: textEl ? textEl.value.trim() : ''
      }, finish, finish); // a failed submit must still let the visitor leave
    });
  }

  // ── API ──────────────────────────────────────────────────────────────────

  function post(path, payload, done, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', API_BASE + path, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      var body = null;
      try { body = JSON.parse(xhr.responseText); } catch (e) { /* leave null */ }
      if (xhr.status >= 200 && xhr.status < 300) done(unwrap(body));
      else if (fail) fail(body);
    };
    xhr.onerror = function () { if (fail) fail(null); };
    xhr.send(JSON.stringify(payload));
  }

  // WebSiteAPI actions return the PulseemResponse envelope as a serialised string, so
  // Web API serialises it again and the body is a JSON string containing JSON:
  //     "{\"StatusCode\":200,\"Data\":{...}}"
  // One JSON.parse yields a string, whose .Data is undefined — so this returned the
  // string itself, `data.conversationId` came out undefined, and startConversation
  // fell into failScreen() even though the request had succeeded with 200. That is
  // what "We could not start the chat right now" was actually reporting.
  //
  // pulseem.js parses the same envelope and carries the same fix.
  function unwrap(body) {
    if (!body) return null;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return null;
      }
      if (!body) return null;
    }
    if (body.Data !== undefined) return body.Data;
    if (body.data !== undefined) return body.data;
    return body;
  }

  function startConversation(fields) {
    setBody('<p class="notice">Starting chat…</p>');
    post('/api/WidgetPublic/StartConversation', {
      widgetId: WIDGET_ID,
      // Handed down by the loader, which runs on the customer's page. Inside the
      // iframe document.referrer is empty under a strict referrer policy, so this
      // fell back to location.href — the iframe's own URL — and the agent inbox
      // showed "/widget/v1/app/index.html" instead of the visitor's actual page.
      pageUrl: HOST_URL || document.referrer || location.href,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      fields: fields || {}
    }, function (data) {
      if (!data || !data.conversationId) { failScreen(); return; }
      state.conversationId = data.conversationId;
      state.visitorToken = data.visitorToken || null;
      renderChat();
      maybeShowMarketing('immediately');
      connectRealtime();
    }, failScreen);
  }

  function failScreen() {
    setBody('<p class="notice">We could not start the chat right now. Please try again later.</p>');
  }

  function sendMessage(text) {
    state.sending = true;
    pushMessage({ sender: 'visitor', content: text });
    paintMessages();

    post('/api/WidgetPublic/SendMessage', {
      conversationId: state.conversationId,
      visitorToken: state.visitorToken,
      content: text
    }, function () {
      state.sending = false;
    }, function () {
      state.sending = false;
      pushMessage({ sender: 'system', content: 'Message not delivered. Check your connection and try again.' });
      paintMessages();
    });
  }

  // ── Realtime ─────────────────────────────────────────────────────────────
  // Socket.io when the service is reachable, polling otherwise, so the widget
  // still works if the realtime service is down.

  function connectRealtime() {
    if (!SOCKET_URL) { startPolling(); return; }

    var script = document.createElement('script');
    script.src = SOCKET_URL.replace(/\/$/, '') + '/socket.io/socket.io.js';
    script.onload = function () {
      try {
        var socket = window.io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        state.socket = socket;
        socket.on('connect', function () {
          socket.emit('visitor:join', {
            conversationId: state.conversationId,
            token: state.visitorToken
          });
        });
        socket.on('message:new', function (payload) {
          var m = (payload && payload.message) || {};
          if (m.sender === 'visitor') return; // our own message echoed back
          pushMessage({ sender: m.sender || 'agent', senderName: m.senderName, content: m.content || '' });
          paintMessages();
        });
        socket.on('connect_error', startPolling);
      } catch (e) {
        startPolling();
      }
    };
    script.onerror = startPolling;
    document.head.appendChild(script);
  }

  function startPolling() {
    if (state.pollTimer) return;
    state.pollTimer = window.setInterval(function () {
      if (!state.conversationId) return;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', API_BASE + '/api/WidgetPublic/GetMessages/' + encodeURIComponent(state.conversationId) +
        '?token=' + encodeURIComponent(state.visitorToken || ''), true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4 || xhr.status < 200 || xhr.status >= 300) return;
        var list;
        try { list = unwrap(JSON.parse(xhr.responseText)); } catch (e) { return; }
        if (!Array.isArray(list)) return;
        // Only append what we have not already shown.
        var known = state.messages.length;
        if (list.length > known) {
          list.slice(known).forEach(function (m) {
            pushMessage({ sender: m.sender || 'agent', senderName: m.senderName, content: m.content || '' });
          });
          paintMessages();
        }
      };
      xhr.send();
    }, 5000);
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // If the loader never delivers a config (e.g. opened directly), fetch it so the
  // app is still testable standalone.
  window.setTimeout(function () {
    if (state.config || !API_BASE || !WIDGET_ID) return;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + '/api/Widget/GetByWidgetId/' + encodeURIComponent(WIDGET_ID), true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status >= 200 && xhr.status < 300) {
        try { applyConfig(unwrap(JSON.parse(xhr.responseText))); } catch (e) { /* ignore */ }
      }
    };
    xhr.send();
  }, 300);
})();
