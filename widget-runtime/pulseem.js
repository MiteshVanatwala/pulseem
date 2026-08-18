/*
  Pulseem chat widget loader.
  Built to the URL already handed to customers by EmbedCodeGenerator.tsx:
      https://cdn.pulseem.com/widget/v1/pulseem.js

  Runs on somebody else's website, so it must not touch their globals, styles or
  network beyond its own iframe. Everything visual lives inside the iframe; this
  file only positions and resizes it.

  Vanilla ES5-compatible syntax on purpose — this executes on whatever browsers
  the customer's visitors bring, not the ones our dashboard supports.
*/
(function (window, document) {
  'use strict';

  // Two ways in, both supported.
  //
  // 1. The queue stub the embed snippet installs:
  //        pulseem('init', '<widgetId>')
  //    Calls can be made before this file finishes loading; they land in a queue
  //    we drain here. This is what EmbedCodeGenerator hands to customers.
  //
  // 2. Direct globals — window.PulseemWidgetID / window.PulseemWidgetConfig —
  //    used by the local demo page and by anyone overriding apiBase/assetBase.
  function readQueue() {
    var name = window.PulseemObject;
    var stub = name && window[name];
    var queued = (stub && stub.q) || [];
    var found = { widgetId: null, config: null };

    for (var i = 0; i < queued.length; i++) {
      var args = queued[i] || [];
      if (args[0] === 'init' && args[1]) found.widgetId = args[1];
      else if (args[0] === 'config' && args[1]) found.config = args[1];
    }
    return found;
  }

  // The directory this file was served from — the iframe and stylesheet live beside
// it. Read immediately: document.currentScript is null by the time async callbacks
// run, and the embed snippet loads this file with async=1.
var SELF_SRC = (function () {
  try {
    if (document.currentScript && document.currentScript.src) return document.currentScript.src;
    // Fallback for browsers/paths where currentScript is unavailable.
    var tags = document.getElementsByTagName('script');
    for (var i = tags.length - 1; i >= 0; i--) {
      if (tags[i].src && tags[i].src.indexOf('pulseem.js') !== -1) return tags[i].src;
    }
  } catch (e) {}
  return '';
})();

function scriptDir() {
  if (!SELF_SRC) return '';
  return SELF_SRC.replace(/[?#].*$/, '').replace(/\/[^/]*$/, '');
}

var queued = readQueue();
  var CONFIG = window.PulseemWidgetConfig || queued.config || {};
  var WIDGET_ID = window.PulseemWidgetID || CONFIG.widgetId || queued.widgetId;

  // Where to fetch config and post messages. Overridable so the widget can be
  // pointed at a local dev server without editing this file.
  var API_BASE = (CONFIG.apiBase || 'https://api.pulseem.com').replace(/\/$/, '');
  // Default to the directory this script was served from, so the same file works on
// stage, on production and behind any CDN without a rebuild. Hardcoding the
// production CDN meant a stage deploy silently pulled the iframe from production.
// document.currentScript is unavailable to async scripts once loading finishes, so
// it is captured at parse time above.
var ASSET_BASE = (CONFIG.assetBase || scriptDir() || 'https://cdn.pulseem.com/widget/v1').replace(/\/$/, '');
  var SOCKET_URL = CONFIG.socketUrl || '';

  var BUBBLE_SIZE = 60;
  var BUBBLE_MARGIN = 20;
  var PANEL_WIDTH = 384;
  var PANEL_HEIGHT = 620;

  if (!WIDGET_ID) {
    console.warn('[pulseem] No widget id. Set window.PulseemWidgetID before loading this script.');
    return;
  }

  // Guard against the snippet being pasted twice — a duplicate iframe would open
  // a second conversation for the same visitor.
  if (window.__pulseemWidgetLoaded) return;
  window.__pulseemWidgetLoaded = true;

  function request(path, done) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', API_BASE + path, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          done(null, JSON.parse(xhr.responseText));
        } catch (e) {
          done(new Error('Malformed config response'));
        }
      } else {
        done(new Error('Config request failed with status ' + xhr.status));
      }
    };
    xhr.onerror = function () { done(new Error('Config request could not reach ' + API_BASE)); };
    xhr.send();
  }

  // The backend wraps payloads in PulseemResponse { StatusCode, Message, Data }.
  // Accept both that and a bare object so a mock server can stay simple.
  function unwrap(body) {
    if (!body) return null;
    if (body.Data !== undefined) return body.Data;
    if (body.data !== undefined) return body.data;
    return body;
  }

  function buildFrame(config) {
    var frame = document.createElement('iframe');
    frame.id = 'pulseem-widget-frame';
    frame.title = 'Chat';
    frame.setAttribute('aria-label', 'Chat');
    frame.allowTransparency = 'true';

    var side = config.position === 'bottom-left' ? 'left' : 'right';

    var style = frame.style;
    style.position = 'fixed';
    style.bottom = BUBBLE_MARGIN + 'px';
    style[side] = BUBBLE_MARGIN + 'px';
    style.width = BUBBLE_SIZE + 'px';
    style.height = BUBBLE_SIZE + 'px';
    style.border = '0';
    style.zIndex = '2147483000';   // below the max, so a host modal can still win
    style.colorScheme = 'normal';  // don't inherit the host page's dark-mode form styling
    style.background = 'transparent';
    style.transition = 'width .18s ease, height .18s ease';

    // Config travels in the URL so the iframe renders correctly on first paint
    // rather than flashing unstyled while it waits for a postMessage.
    var params =
      'widgetId=' + encodeURIComponent(WIDGET_ID) +
      '&apiBase=' + encodeURIComponent(API_BASE) +
      '&side=' + encodeURIComponent(side) +
      (SOCKET_URL ? '&socketUrl=' + encodeURIComponent(SOCKET_URL) : '');

    frame.src = ASSET_BASE + '/app/index.html?' + params;
    return frame;
  }

  function start(config) {
    var frame = buildFrame(config);
    var side = config.position === 'bottom-left' ? 'left' : 'right';

    function mount() {
      document.body.appendChild(frame);

      // Hand the config over once the iframe is listening. Sending it here as
      // well as in the URL keeps the URL short and survives config changes.
      frame.addEventListener('load', function () {
        post({ type: 'pulseem:config', config: config, widgetId: WIDGET_ID });
      });
    }

    function post(msg) {
      if (frame.contentWindow) frame.contentWindow.postMessage(msg, '*');
    }

    function resize(open) {
      var s = frame.style;
      if (open) {
        // Never exceed the viewport — on a phone the panel is the whole screen.
        var w = Math.min(PANEL_WIDTH, window.innerWidth - BUBBLE_MARGIN * 2);
        var h = Math.min(PANEL_HEIGHT, window.innerHeight - BUBBLE_MARGIN * 2);
        s.width = Math.max(w, 280) + 'px';
        s.height = Math.max(h, 380) + 'px';
      } else {
        s.width = BUBBLE_SIZE + 'px';
        s.height = BUBBLE_SIZE + 'px';
      }
    }

    // Only listen to our own iframe — any page can postMessage at us.
    window.addEventListener('message', function (event) {
      if (!frame.contentWindow || event.source !== frame.contentWindow) return;
      var data = event.data || {};
      if (data.type === 'pulseem:open') resize(true);
      else if (data.type === 'pulseem:close') resize(false);
      else if (data.type === 'pulseem:size' && data.width && data.height) {
        frame.style.width = data.width + 'px';
        frame.style.height = data.height + 'px';
      }
    });

    // Keep the panel inside the viewport when the window changes.
    window.addEventListener('resize', function () {
      if (parseInt(frame.style.width, 10) > BUBBLE_SIZE) resize(true);
    });

    if (document.body) mount();
    else document.addEventListener('DOMContentLoaded', mount);

    if (config.autoOpen) {
      window.setTimeout(function () {
        resize(true);
        post({ type: 'pulseem:autoOpen' });
      }, (config.autoOpenDelay || 5) * 1000);
    }

    var api = {
      open: function () { resize(true); post({ type: 'pulseem:autoOpen' }); },
      close: function () { resize(false); post({ type: 'pulseem:forceClose' }); },
      side: side
    };

    // Expose a tiny API so a host page can drive the widget if it wants to.
    window.Pulseem = api;

    // Replace the queue stub with a live dispatcher, so calls made after load
    // work the same as the ones made before it.
    var name = window.PulseemObject;
    if (name) {
      window[name] = function (command) {
        if (command === 'open') api.open();
        else if (command === 'close') api.close();
        // 'init' after load is a no-op — the widget is already running.
      };
    }
  }

  request('/api/Widget/GetByWidgetId/' + encodeURIComponent(WIDGET_ID), function (err, body) {
    if (err) {
      // Stay silent on the page itself — a broken widget must never disrupt the
      // customer's site. The console message is for whoever installed it.
      console.warn('[pulseem] Widget could not load:', err.message);
      return;
    }
    var config = unwrap(body);
    if (!config) {
      console.warn('[pulseem] Widget config was empty for id ' + WIDGET_ID);
      return;
    }
    if (config.status && config.status !== 'active') {
      // Paused or draft widgets are configured but must not appear to visitors.
      return;
    }
    start(config);
  });
})(window, document);
