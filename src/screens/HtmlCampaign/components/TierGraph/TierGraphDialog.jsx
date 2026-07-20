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

  // always open with the LAST graph (persisted in localStorage); importing a link replaces it.
  const init = () => {
    let graph = defaultState();
    try {
      const raw = typeof localStorage !== 'undefined' && localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === 4) graph = parsed;
      }
    } catch (e) { /* localStorage blocked/full — fall back to defaults */ }
    return { graph, selected: null };
  };
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const { graph, selected } = state;

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

  // debounced persistence to localStorage on EVERY change — never let it break the UI.
  useEffect(() => {
    const id = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(graph)); } catch (e) { /* noop */ }
    }, 500);
    return () => clearTimeout(id);
  }, [graph, storageKey]);

  const [inserting, setInserting] = useState(false);
  const [msg, setMsg] = useState(null);            // footer message { kind:'error'|'warn', text }
  const [defaultAcked, setDefaultAcked] = useState(false); // "add anyway" ack for an unchanged graph
  const [importOpen, setImportOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [importError, setImportError] = useState(null);

  const { url } = buildLink(graph);
  const cfgPart = url.split('cfg=')[1];
  const cfgLen = cfgPart ? cfgPart.split('&')[0].length : 0;
  const tooLong = cfgLen > 4096 || url.length > 6000;

  const isDefaultGraph = () => JSON.stringify(graph) === JSON.stringify(defaultState());

  const onInlineAmountEdit = (index, newText) => {
    const cur = graph.tiers[index].amount;
    dispatch({ type: 'SET_GEO', path: index, geo: { t: newText, s: cur.s } });
  };

  const handleInsert = async () => {
    setMsg(null);
    if (tooLong) { setMsg({ kind: 'error', text: t('campaigns.tierGraph.urlTooLong') }); return; }
    // validation: warn once if nothing was customized (maybe they forgot to edit the sample)
    if (isDefaultGraph() && !defaultAcked) {
      setDefaultAcked(true);
      setMsg({ kind: 'warn', text: t('campaigns.tierGraph.defaultUnchangedWarn') });
      return;
    }
    setInserting(true);
    try {
      await onInsert(url, graph.width);
    } catch (e) {
      setInserting(false);
      // append the real failure detail — turns the opaque "failed" into a diagnosable message.
      const detail = e && (e.message || String(e));
      setMsg({ kind: 'error', text: t('campaigns.tierGraph.insertError') + (detail ? ' — ' + detail : '') });
      return;
    }
    onClose(); // success — close the dialog (no setState after this)
  };

  // "import image" — load an existing graph back from its image link (inverse of buildLink).
  const handleImportOpen = () => { setLinkInput(''); setImportError(null); setImportOpen(true); };
  const handleImportConfirm = () => {
    const parsed = parseTierGraphUrl(linkInput);
    if (!parsed || parsed.version !== 4) {
      setImportError(t('campaigns.tierGraph.invalidFile'));
      return;
    }
    dispatch({ type: 'IMPORT_JSON', obj: parsed });
    setDefaultAcked(false);
    setMsg(null);
    setImportOpen(false);
  };

  const btn = {
    border: 0, borderRadius: 8, padding: '7px 13px', fontWeight: 700, cursor: 'pointer',
    background: '#f3f4f8', color: '#1f2430', fontSize: 12.5,
  };
  const primaryBtn = { ...btn, background: '#1565d8', color: '#fff', padding: '9px 22px', fontSize: 14 };
  const segBtn = (on) => ({ border: 0, background: on ? '#4f46e5' : '#fff', color: on ? '#fff' : '#6b7280', padding: '5px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 13 });

  return (
    <div style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', flex: '1 1 auto', minHeight: 0, maxHeight: '100%' }}>
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
        <button type="button" style={btn} onClick={handleImportOpen}>{t('campaigns.tierGraph.importImage')}</button>
        <button type="button" style={btn} onClick={() => dispatch({ type: 'RESET_DEFAULT' })}>{t('campaigns.tierGraph.loadSample')}</button>
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

      {/* footer: messages + actions */}
      <div style={{ borderTop: '1px solid #e2e6ee', padding: '12px 16px', background: '#fbfcfe' }}>
        {msg ? <div style={{ marginBottom: 8, fontSize: 12.5, textAlign: 'center', color: msg.kind === 'error' ? '#b42318' : '#b54708' }}>{msg.text}</div> : null}
        {tooLong ? <div style={{ marginBottom: 8, fontSize: 12.5, textAlign: 'center', color: '#b42318' }}>{t('campaigns.tierGraph.urlTooLong')}</div> : null}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button type="button" style={{ ...btn, background: '#f3f4f8' }} onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" style={{ ...primaryBtn, opacity: inserting || tooLong ? 0.6 : 1 }} disabled={inserting || tooLong} onClick={handleInsert}>
            {t('campaigns.tierGraph.insertButton')}
          </button>
        </div>
      </div>

      {/* import-from-link popup */}
      {importOpen ? (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 30, background: 'rgba(17,21,29,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 15 }}
          onClick={() => setImportOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(540px, 92%)', background: '#fff', borderRadius: 14, boxShadow: '0 24px 70px rgba(0,0,0,.35)', padding: '24px 26px', direction: 'rtl' }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{t('campaigns.tierGraph.importImage')}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>{t('campaigns.tierGraph.importImageHint')}</div>
            <input
              autoFocus
              type="text"
              value={linkInput}
              onChange={(e) => { setLinkInput(e.target.value); setImportError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleImportConfirm(); if (e.key === 'Escape') setImportOpen(false); }}
              style={{ width: '100%', boxSizing: 'border-box', fontSize: 13, border: '1px solid #cfd6e0', borderRadius: 9, padding: '11px 12px', direction: 'ltr' }}
            />
            {importError ? <div style={{ color: '#b42318', fontSize: 12.5, marginTop: 8 }}>{importError}</div> : null}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', marginTop: 20 }}>
              <button type="button" style={{ ...primaryBtn, padding: '10px 24px' }} onClick={handleImportConfirm}>{t('campaigns.tierGraph.importImageConfirm')}</button>
              <button type="button" style={{ ...btn, padding: '10px 20px' }} onClick={() => setImportOpen(false)}>{t('common.cancel')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
