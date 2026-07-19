import React, { useReducer, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  defaultState, buildLink, measureTextFactory, isTok, parseTierGraphUrl,
} from './tierGraphCore';
import TierGraphStage from './TierGraphStage';
import TierGraphEditorPanel from './TierGraphEditorPanel';

/* ----------------------------- reducer ----------------------------- */
const clone = (g) => JSON.parse(JSON.stringify(g));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function reducer(state, action) {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selected: action.selected };
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };
    case 'SET_BG_FIELD': {
      const g = clone(state.graph);
      let val = action.val;
      if (action.key === 'width' || action.key === 'height') {
        const num = Number(val);
        const rounded = isNaN(num) ? (action.key === 'width' ? 640 : 420) : Math.round(num);
        val = action.key === 'width' ? clamp(rounded, 320, 1400) : clamp(rounded, 320, 900);
      } else if (action.key === 'axisMax') {
        const num = Number(val);
        val = isNaN(num) ? 0 : Math.max(0, num);
      }
      g[action.key] = val;
      return { ...state, graph: g };
    }
    case 'SET_TIER_COUNT': {
      const g = clone(state.graph);
      const n = clamp(action.n, 1, 4);
      const d = defaultState();
      while (g.tiers.length < n) g.tiers.push(JSON.parse(JSON.stringify(d.tiers[g.tiers.length % 4])));
      g.tierCountActive = n; // array never shrinks — edits to tiers 3-4 survive
      return { ...state, graph: g, selected: null };
    }
    case 'SET_TIER_FIELD': {
      const g = clone(state.graph);
      g.tiers[action.i][action.key] = action.val;
      return { ...state, graph: g };
    }
    case 'SET_TIER_HIGHLIGHT': {
      const g = clone(state.graph);
      g.tiers.forEach((tr) => { tr.highlight = false; }); // exclusive
      g.tiers[action.i].highlight = action.val;
      return { ...state, graph: g };
    }
    case 'SET_BOX_FIELD': {
      const g = clone(state.graph);
      g.tiers[action.i].box[action.key] = action.val;
      return { ...state, graph: g };
    }
    case 'SET_HERE_FIELD': {
      const g = clone(state.graph);
      g.here[action.key] = action.val;
      return { ...state, graph: g };
    }
    case 'SET_GEO': {
      const g = clone(state.graph);
      const geo = { t: String(action.geo.t), s: action.geo.s };
      if (isTok(geo.t) && !geo.s) geo.s = 100000;
      if (action.path === 'here') g.here.value = geo;
      else g.tiers[action.path].amount = geo;
      return { ...state, graph: g };
    }
    case 'IMPORT_JSON':
      if (!action.obj || action.obj.version !== 4) return state; // caller shows invalidFile
      return { ...state, graph: action.obj, selected: null };
    case 'RESET_DEFAULT':
      return { ...state, graph: defaultState(), selected: null };
    default:
      return state;
  }
}

/* ----------------------------- component ----------------------------- */
/**
 * TierGraphDialog — full design dialog content (rendered as BaseDialog children).
 * Props: { onClose, onInsert(url, width):Promise, mergeData, t, isRTL, classes }
 */
export default function TierGraphDialog({ onClose, onInsert, mergeData, t }) {
  const core = useSelector((s) => (s && s.core) || {});
  const userKey = core.userId || core.userID || core.subAccountId || core.SubAccountID || 'default';
  const storageKey = 'tierGraph_' + userKey;

  const init = () => {
    let graph = defaultState();
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 4) graph = parsed;
      }
    } catch (e) { /* localStorage blocked/full — fall back to defaults */ }
    return { graph, selected: null, activeTab: 'link' };
  };
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const { graph, selected, activeTab } = state;

  const md = Array.isArray(mergeData) ? mergeData : [];

  // measureText — re-created once fonts finish loading so widths stabilize.
  const [fontTick, setFontTick] = useState(0);
  useEffect(() => {
    let alive = true;
    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (alive) setFontTick((x) => x + 1); });
    }
    return () => { alive = false; };
  }, []);
  const measureText = useMemo(() => measureTextFactory(), [fontTick]); // eslint-disable-line react-hooks/exhaustive-deps

  // debounced persistence (per user) — never let a storage error break the UI.
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(graph)); } catch (e) { /* noop */ }
    }, 500);
    return () => clearTimeout(id);
  }, [graph, storageKey]);

  const [inserting, setInserting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState(null); // { kind:'error', text }
  const [linkInput, setLinkInput] = useState('');

  const { url, imgTag } = buildLink(graph);
  const cfgPart = url.split('cfg=')[1];
  const cfgLen = cfgPart ? cfgPart.split('&')[0].length : 0;
  const tooLong = cfgLen > 4096 || url.length > 6000;

  const onInlineAmountEdit = (index, newText) => {
    const cur = graph.tiers[index].amount;
    dispatch({ type: 'SET_GEO', path: index, geo: { t: newText, s: cur.s } });
  };

  const handleInsert = async () => {
    setMsg(null);
    if (tooLong) { setMsg({ kind: 'error', text: t('campaigns.tierGraph.urlTooLong') }); return; }
    setInserting(true);
    try {
      await onInsert(url, graph.width);
    } catch (e) {
      // keep the popup open, keep the state, surface the error
      setInserting(false);
      setMsg({ kind: 'error', text: t('campaigns.tierGraph.insertError') });
      return;
    }
    onClose(); // success — close the dialog (no setState after this)
  };

  const handleCopy = () => {
    try { if (navigator.clipboard) navigator.clipboard.writeText(url); } catch (e) { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  // #3 — load an existing graph back from its image link (inverse of buildLink).
  const handleLoadFromLink = () => {
    setMsg(null);
    const parsed = parseTierGraphUrl(linkInput);
    if (!parsed || parsed.version !== 4) {
      setMsg({ kind: 'error', text: t('campaigns.tierGraph.invalidFile') });
      return;
    }
    dispatch({ type: 'IMPORT_JSON', obj: parsed });
    setLinkInput('');
  };

  const btn = {
    border: 0, borderRadius: 8, padding: '7px 13px', fontWeight: 700, cursor: 'pointer',
    background: '#f3f4f8', color: '#1f2430', fontSize: 12.5,
  };
  const primaryBtn = { ...btn, background: '#1565d8', color: '#fff', padding: '9px 22px', fontSize: 14 };
  const segBtn = (on) => ({ border: 0, background: on ? '#4f46e5' : '#fff', color: on ? '#fff' : '#6b7280', padding: '5px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 13 });

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: 520 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '12px 16px', borderBottom: '1px solid #e2e6ee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontWeight: 500, fontSize: 12.5 }}>{t('campaigns.tierGraph.tiersCount')}</label>
          <div style={{ display: 'flex', border: '1px solid #e2e6ee', borderRadius: 8, overflow: 'hidden' }}>
            {[1, 2, 3, 4].map((num) => (
              <button key={num} type="button" style={segBtn(graph.tierCountActive === num)} onClick={() => dispatch({ type: 'SET_TIER_COUNT', n: num })}>{num}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12.5 }}>{t('campaigns.tierGraph.widthLabel')}</label>
          <input type="number" min={320} max={1400} step={10} value={graph.width} onChange={(e) => dispatch({ type: 'SET_BG_FIELD', key: 'width', val: parseFloat(e.target.value) || 640 })} style={{ width: 70, fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '5px 7px' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ fontSize: 12.5 }}>{t('campaigns.tierGraph.heightLabel')}</label>
          <input type="number" min={320} max={900} step={10} value={graph.height} onChange={(e) => dispatch({ type: 'SET_BG_FIELD', key: 'height', val: parseFloat(e.target.value) || 420 })} style={{ width: 70, fontSize: 13, border: '1px solid #e2e6ee', borderRadius: 7, padding: '5px 7px' }} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="text"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLoadFromLink(); }}
            placeholder={t('campaigns.tierGraph.loadFromLinkPlaceholder')}
            style={{ width: 180, fontSize: 12.5, border: '1px solid #e2e6ee', borderRadius: 7, padding: '6px 8px', direction: 'ltr' }}
          />
          <button type="button" style={btn} onClick={handleLoadFromLink}>{t('campaigns.tierGraph.loadFromLink')}</button>
        </div>
        <button type="button" style={btn} onClick={() => dispatch({ type: 'RESET_DEFAULT' })}>{t('campaigns.tierGraph.loadSample')}</button>
        <button type="button" style={btn} onClick={handleCopy}>{copied ? t('campaigns.tierGraph.copied') : t('campaigns.tierGraph.copyLink')}</button>
      </div>

      {/* body: stage + editor panel */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, flexDirection: 'row', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'auto', padding: 18, background: '#eef1f6', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: graph.width, boxShadow: '0 8px 30px rgba(0,0,0,.14)', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
            <TierGraphStage
              graph={graph}
              selected={selected}
              onSelect={(sel) => dispatch({ type: 'SELECT', selected: sel })}
              onInlineAmountEdit={onInlineAmountEdit}
              measureText={measureText}
            />
          </div>
        </div>
        <aside style={{ flex: '0 1 340px', minWidth: 300, boxSizing: 'border-box', borderInlineStart: '1px solid #e2e6ee', overflowY: 'auto', padding: 16, background: '#fff' }}>
          <TierGraphEditorPanel graph={graph} selected={selected} dispatch={dispatch} mergeData={md} t={t} />
        </aside>
      </div>

      {/* footer: tabs + output + add button */}
      <div style={{ borderTop: '1px solid #e2e6ee', padding: '10px 16px', background: '#fbfcfe' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 7 }}>
          <button type="button" onClick={() => dispatch({ type: 'SET_TAB', tab: 'link' })} style={{ ...btn, background: activeTab === 'link' ? '#e8f1fd' : '#f3f4f8', fontSize: 12.5 }}>{t('campaigns.tierGraph.linkTab')}</button>
          <button type="button" onClick={() => dispatch({ type: 'SET_TAB', tab: 'json' })} style={{ ...btn, background: activeTab === 'json' ? '#e8f1fd' : '#f3f4f8', fontSize: 12.5 }}>{t('campaigns.tierGraph.jsonTab')}</button>
        </div>
        <pre style={{ background: '#f2f5f9', border: '1px solid #e2e6ee', borderRadius: 8, padding: '8px 10px', maxHeight: 70, overflow: 'auto', fontSize: 11.5, direction: 'ltr', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0 }}>
          {activeTab === 'link' ? imgTag : JSON.stringify(graph, null, 2)}
        </pre>
        {msg ? <div style={{ marginTop: 6, fontSize: 12.5, color: msg.kind === 'error' ? '#b42318' : '#067647' }}>{msg.text}</div> : null}
        {tooLong ? <div style={{ marginTop: 6, fontSize: 12.5, color: '#b42318' }}>{t('campaigns.tierGraph.urlTooLong')}</div> : null}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 10 }}>
          <button type="button" style={{ ...btn, background: '#f3f4f8' }} onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" style={{ ...primaryBtn, opacity: inserting || tooLong ? 0.6 : 1 }} disabled={inserting || tooLong} onClick={handleInsert}>
            {t('campaigns.tierGraph.insertButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
