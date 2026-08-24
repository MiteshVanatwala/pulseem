// Token merge for email previews — shared by SmartSend (the "first client from the source"
// preview) and SendSearch (the per-recipient sent-email preview, WP-A).
//
// MOVED HERE from screens/SmartSend/components/SmartSendPreview.tsx:18-44 (step A1). The logic is
// byte-for-byte identical; only its home changed. It lives OUTSIDE screens/ deliberately: both
// consuming screens are owned by other work tracks, and a helper under helpers/Functions/ cannot
// collide with either. Nothing here imports React or MUI, so the v4/v5 rule does not apply.
//
// TWO TOKEN CLASSES (TierGraph handoff §9):
//   TEXT tokens  — replaced byte-for-byte in the body, HTML-escaped on the way in.
//   GRAPH tokens — live URL-ENCODED inside the pulseemmonitorgraph pN params, so they are handled
//                  per §ד2: decode pN -> replace -> re-encode. NEVER a raw-HTML replace, and `cfg`
//                  is never touched.
//
// EMPTY vs UNMAPPED (§7.2) — the distinction is deliberate and load-bearing:
//   a token WITH a value that happens to be empty  -> renders as an empty string
//   a token with NO entry in `values` at all       -> stays raw ##Token##, because nothing here
//                                                     can resolve it and pretending otherwise
//                                                     would be a lie about what was sent.
//   The SendSearch modal (A10) must therefore render raw ##..## as a neutral placeholder rather
//   than showing it to a Clal user as if it were content.

const GRAPH_URL_RE = /pulseemmonitorgraph[^"'\s>]*/g;
const GRAPH_PARAM_RE = /([?&;])(p\d+=)([^&"'\s>]*)/g;
// The editor sentinel that buildLink bakes into every saved tier-graph URL. While it survives,
// pulseemmonitorgraph.png treats the request as the EDITOR CANVAS and answers with the
// design-time sample instead of 0 for a value this recipient does not have. A preview whose job
// is to show what the recipient gets must therefore look like a recipient render, not the editor.
const GRAPH_EDITOR_SENTINEL_RE = new RegExp('([?&;])c=ClientIDReplaceFromEditor(?=[&;]|$)', 'g');
const TOKEN_RE = /##([^#]+)##/g;

// ── [NFFLAG] 2026-08-23 ──────────────────────────────────────────────────────────────────────
// `nf=1` tells pulseemmonitorgraph.png to PRINT a dyn slot's pN value as it received it instead of
// re-grouping it with "#,##0.###". Without it the renderer regroups unconditionally
// (PulseemHandler.cs StairFmt), so a column whose ShowThousandsSeparator is 0 still draws with
// commas and the preview disagrees with the delivered mail.
//
// OPT-IN, AND THAT IS THE WHOLE POINT. Absent ⇒ the renderer behaves exactly as it does today.
// Every graph URL already sitting in a delivered inbox lacks the key, so nothing already sent can
// change — the <img> is re-fetched on every open and there is no cache on that handler.
//
// THREE PRODUCERS MUST AGREE, in three languages, with nothing linking them:
//   this file                                        — the operator's SmartSend preview
//   PulseemSystem2\PulseemSystem\PreviewCampaign.aspx.cs   — the shareable/browser preview
//   EmailSender\...\DBProxyStandard.cs ReplaceGraphTokens  — the delivered mail
// A change to the key or to the placement rule below has to be made in all three.
//
// NEVER APPEND AT THE END. Here GRAPH_URL_RE does stop at a quote, so appending would be safe in
// THIS file — but the sender's SmartSendGraphUrlRegex deliberately over-matches past a closing `'`,
// and appending there lands outside the real URL and corrupts the markup. The three producers are
// kept identical in placement so they cannot drift.
//
// 🔴 INSERTED AFTER `gt=stairs`, NOT AFTER THE `?` — a bug fix, not a style choice. The first
// implementation spliced right after the `?`, producing `...png?nf=1&gt=stairs&cfg=...`. That form
// is fine here (the browser follows the HTML5 rule that an unterminated named reference followed by
// `=` is literal inside an attribute value) but it is NOT fine in the sender: an entity normaliser
// downstream of DBProxyStandard rewrote every bare `&` to `&amp;` and completed the bare `&gt` to
// `&gt;`, so delivered mail carried `?nf=1&gt;=stairs`, the client decoded it to `>`, the graph-type
// parameter was destroyed and the recipient got the fallback donut. Observed on stage 2026-08-23.
// `&nf` is not the prefix of any named character reference, so no encoder can complete it. This
// file matches the two C# producers so the shape cannot drift apart again.
//
// ONLY WHEN A TOKEN WAS ACTUALLY SUBSTITUTED. An unresolved ##Token## must reach the renderer
// untouched: it is what makes the renderer treat the slot as preview and draw its design-time
// sample. Flagging such a URL would assert "these values are already display-ready" about a value
// that is not a value at all.
//
// PRECONDITION, and it is NOT latched on this path. The flag asserts that the producer already
// applied the per-column display decision. Here that is true only because SQL script 26_ wraps
// dbo.DataSources_GetSampleValuesForMapping in dbo.fn_FormatDataSourceCell (run 2026-08-23).
// The sender has a runtime latch for its own equivalent (map.HasThousandsMetadata); React has
// none, so on a database without 26_ this preview would flag raw values. Verify 26_ before
// deploying this file to an environment.
const GRAPH_STAIRS = 'gt=stairs';
// NOT /g — used with .test(), and a global regex carries lastIndex between calls.
const GRAPH_NO_FORMAT_PRESENT_RE = /[?&;]nf=1(?=[&;"'\s>]|$)/;

const addGraphNoFormatFlag = (url: string) => {
    // Stairs only. The same handler renders pie/roundedbar from a different parameter set that
    // knows nothing about this key, and asserting a formatting contract at them means nothing.
    const gt = url.indexOf(GRAPH_STAIRS);
    if (gt < 0) return url;
    if (GRAPH_NO_FORMAT_PRESENT_RE.test(url)) return url;   // idempotent: never emit it twice
    // Mirror the separator already in use: buildLink emits a raw '&', but entity-encoded '&amp;'
    // occurs in stored campaign HTML, which is why GRAPH_PARAM_RE accepts ';' as a separator.
    const sep = url.indexOf('&amp;') >= 0 ? '&amp;' : '&';
    const at = gt + GRAPH_STAIRS.length;
    return url.slice(0, at) + sep + 'nf=1' + url.slice(at);
};

// WIDENED IN STEP A3 to cover " and '.
//
// `&` MUST stay first, or the ampersands of the later entities get double-escaped.
//
// WHY THE QUOTES MATTER — and why this is a real fix, not cosmetics:
// The merged string is written with `shadow.innerHTML`. In TEXT position the browser decodes the
// entity straight back to the character, so widening changes NOTHING visible — a value containing
// a quote still renders as a quote. The bug is in ATTRIBUTE position: a token inside
// `href="##Token##"` or `alt="##Token##"` whose value carries a straight `"` currently CLOSES the
// attribute early and corrupts the tag, silently mangling the preview and, worse, letting source
// data inject attributes. Escaping both quote characters closes that.
//
// Hebrew note: gershayim (״ U+05F4) and geresh (׳ U+05F3) are NOT ASCII quotes and are NOT
// escaped — Hebrew abbreviations like בע״מ are unaffected. Only ASCII " and ' are touched, which
// is what CSV/Excel exports actually carry (בע"מ typed with an ASCII quote, O'Brien, 12" screen).
//
// NOT affected: graph tokens. `replaceGraphTokens` substitutes the RAW value and re-encodes with
// encodeURIComponent — it never passes through escapeHtml, by design.
export const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// Replace graph tokens inside one pulseemmonitorgraph URL: decode each pN, substitute mapped
// tokens with the (URL-encoded) sample value, re-encode. Unmapped/absent → left as-is.
// Values here are NOT run through escapeHtml — they are URL-encoded instead, which is the correct
// escaping for this position.
export const replaceGraphTokens = (url: string, values: { [k: string]: string }) => {
    // [NFFLAG] Set only when a ##Token## was really replaced — see the note beside
    // addGraphNoFormatFlag for why an unresolved token must not be flagged.
    let substituted = false;
    const rewritten =
    // Strip the editor sentinel FIRST. Without this the preview lies in exactly the case it exists
    // to catch: a token that is mapped but empty, or not mapped at all, renders as the design-time
    // sample here while the same recipient's real mail renders 0 — and the operator approves the
    // send believing the graph is populated. The sender performs the identical rewrite for real
    // mail (DBProxyStandard, beside the "==ClientID==" replace); this is the preview equivalent.
    // Removed outright rather than set to a fake id, so nothing downstream can mistake it for a
    // real client.
    // The separator is put BACK when it is the leading "?", otherwise dropping it would turn
    // "...png?c=SENTINEL&gt=stairs" into "...png&gt=stairs" — a URL with no query string at all,
    // so the graph would not render rather than merely render wrong. No builder in the repo emits
    // c= first today (buildLink and global.js both start with gt=), but a later re-ordering must
    // not be able to break previews silently. "?&gt=..." is valid: the empty first pair is ignored.
    url.replace(GRAPH_EDITOR_SENTINEL_RE, (_m, sep) => (sep === '?' ? '?' : ''))
        .replace(GRAPH_PARAM_RE, (_m, sep, key, val) => {
        let decoded: string;
        try { decoded = decodeURIComponent(val); } catch { decoded = val; }
        const resolved = decoded.replace(TOKEN_RE, (raw, name) =>
            Object.prototype.hasOwnProperty.call(values, name) ? values[name] : raw);
        if (resolved !== decoded) substituted = true;   // [NFFLAG]
        return sep + key + encodeURIComponent(resolved);
    });
    return substituted ? addGraphNoFormatFlag(rewritten) : rewritten;   // [NFFLAG]
};

export const replaceTokensForPreview = (html: string, values: { [k: string]: string }) => {
    if (!html) return '';
    const safe = values || {};
    // Graph tokens first (inside the img src pN params), then raw text tokens in the body.
    let out = html.replace(GRAPH_URL_RE, (url) => replaceGraphTokens(url, safe));
    out = out.replace(TOKEN_RE, (raw, name) =>
        Object.prototype.hasOwnProperty.call(safe, name) ? escapeHtml(safe[name]) : raw);
    return out;
};

// Adapter for the SendSearch path (A8/A10). `dbo.DataSources_GetRowValuesForPreviewByClient`
// returns rows of { Token, Value, HasRow }; `replaceTokensForPreview` wants a plain map keyed on
// the token NAME.
//
// WHY THE STRIP: TOKEN_RE captures the name WITHOUT its delimiters (/##([^#]+)##/g), so a map
// keyed on a raw `Token` of "##AgentName##" would silently match nothing and every value would
// render as raw ##AgentName##. Whether that column stores the token with or without the ## is not
// provable from the schema, so this normalises both shapes instead of betting on one.
// UNVERIFIED: which shape CampaignDataSourceTokenMap.Token actually holds — confirm against real
// data during the A10 verification, and delete this note once it is known.
export const tokenValuesFromRows = (
    rows: { Token: string; Value: string }[] | null | undefined,
): { [k: string]: string } => {
    const map: { [k: string]: string } = {};
    (rows || []).forEach((r) => {
        if (!r || typeof r.Token !== 'string') return;
        const name = r.Token.replace(/^##/, '').replace(/##$/, '');
        if (!name) return;
        map[name] = r.Value == null ? '' : String(r.Value);
    });
    return map;
};
