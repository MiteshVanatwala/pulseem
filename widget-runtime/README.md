# Widget runtime — Phase A

The embeddable chat widget: the `pulseem.js` a customer pastes into their site, and
the chat app that runs inside the injected iframe.

Ships to the URL already baked into `EmbedCodeGenerator.tsx`:

```
https://cdn.pulseem.com/widget/v1/pulseem.js
```

No build step. Vanilla JS, so what is in `app/` is what deploys.

```
widget-runtime/
├── pulseem.js         what the customer pastes — fetches config, injects the iframe
├── app/
│   ├── index.html     iframe document
│   ├── widget.js      state machine, API calls, socket
│   └── widget.css     styles (scoped to the iframe)
├── demo/index.html    a pretend customer site carrying the snippet
└── dev-server.mjs     serves the files + mocks the backend
```

## Why a mock server

The visitor endpoints now exist in `WebSiteAPI` (`WidgetPublicController`), but
that project is ASP.NET Framework 4.8 and only builds on Windows — so it cannot
run on a Linux dev machine, and it has not been compiled yet.

`dev-server.mjs` mocks exactly the endpoints the widget calls, so the entire
visitor journey is testable in a browser today. Once the real controller is
deployed, only `apiBase` changes — the widget code should not.

---

## Local test flow

### 1. Start it

```bash
cd pulseem/widget-runtime
node dev-server.mjs
```

Then open **http://localhost:4300/demo/**

The terminal logs every request the widget makes, so you can watch the flow.

### 2. Walk the visitor journey

| # | Do this | Expect |
|---|---|---|
| 1 | Look at the page | Bubble bottom-right, in the widget's `primaryColor`; greeting bubble above it, fading after ~8s |
| 2 | Click the bubble | Iframe grows to a panel; header shows the widget name |
| 3 | Submit the form empty | Inline errors under **Your name** and **Email**; nothing sent |
| 4 | Enter `not-an-email` | "Enter a valid email address." |
| 5 | Fill it in properly, submit | `POST StartConversation` in the log; chat screen appears |
| 6 | Send a message | Appears right-aligned in the brand colour; `POST SendMessage` logged |
| 7 | Wait ~2.5s | Mock agent reply appears left-aligned |
| 8 | — | Marketing opt-in appears (config uses `after_first_response`) |
| 9 | Submit or skip it | Returns to chat |
| 10 | Close the panel | Feedback screen: stars, tags, free text |
| 11 | Rate and submit | "Thanks for your feedback", panel closes to the bubble |

### 3. Check what the backend received

```
http://localhost:4300/__state
```

Shows the conversation with its messages, identification fields, opt-in and
feedback — the local stand-in for querying `ServiceConversations` /
`ServiceMessages`.

### 4. Exercise config changes

Edit `WIDGET_CONFIG` in `dev-server.mjs`, restart, reload the demo page:

| Change | Expect |
|---|---|
| `position: 'bottom-left'` | Bubble and panel move to the left |
| `primaryColor: '#0b7285'` | Bubble, header, buttons and visitor messages all follow |
| `showBranding: false` | "Powered by Pulseem" footer disappears |
| `enableIdentification: false` | Chat starts immediately, no form |
| `autoOpen: true`, `autoOpenDelay: 2` | Panel opens itself after 2s |
| `enableOfficeHours: true` + all days `enabled: false` | Header shows **Away**; away message appears as a system line |
| `marketingTiming: 'immediately'` | Opt-in appears before the first reply |
| `status: 'paused'` | **No bubble at all** — paused widgets stay invisible |

### 5. Failure behaviour

Stop the dev server and reload the demo page. The page must look completely
normal — no bubble, no error banner, no layout shift. The only trace is a console
warning. A broken widget must never disrupt a customer's site.

---

## Testing against the real socket

Once the socket service is reachable and the visitor-token flow exists, set
`socketUrl` in `demo/index.html`:

```js
window.PulseemWidgetConfig = {
  apiBase:   'http://localhost:4300',
  assetBase: 'http://localhost:4300',
  socketUrl: 'https://<current-tunnel>.trycloudflare.com'
};
```

The widget loads the socket.io client from that origin, emits `visitor:join` with
the token from `StartConversation`, and appends `message:new` events. If the
socket cannot be reached it falls back to polling every 5s, so the widget keeps
working when the realtime service is down.

Verify the join landed:

```bash
curl -H "X-Status-Key: <key>" https://<tunnel>/status
```

`rooms.occupancy` should contain `conversation:<id>` with one member — that is
test **T-A6**.

---

## Phase A status

| Step | Status |
|---|---|
| A1 schema | **Done** — widget + conversation tables, plus `ServiceFeedback` and `ServiceMarketingConsent` in `Service_WidgetPublic_Deploy.sql` |
| A2 visitor API | **Written, not compiled** — `WidgetPublicController`, `WidgetPublicLogic`, `ServiceRealtimeNotifier`, 5 stored procedures. Needs a Visual Studio build to verify |
| A3 loader | **Done** — `pulseem.js`, verified locally |
| A4 iframe app | **Done** — verified locally end to end |
| A5 asset hosting | **Not started** — needs an HTTPS host serving `pulseem.js` and `app/` at the same path |

### Deploying A2

1. Run `Service_WidgetPublic_Deploy.sql` against the target database.
2. Fill the three `Web.config` keys — `Service.WidgetTokenSecret` must **differ**
   from the agent JWT secret, and must **match** `WIDGET_TOKEN_SECRET` in
   `pulseem-communication`.
3. Build in Visual Studio. The four new files are already registered in the
   `.csproj` files; without those entries .NET Framework silently omits them.
4. Point `apiBase` at the real API and re-run the walkthrough above.
