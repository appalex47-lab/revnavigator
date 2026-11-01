/**
 * report-directivo-view.js — Dibujo de las láminas del formato Directivo (Presentation Intelligence · Fase 6). Solo presenta lo que construyó
 * FP.reportDirectivo; no calcula nada. Colores y tamaños salen de css/report.css.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v), f = (k, v) => FP.reportBuilder.fmt(k, v), isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const tagCls = (t) => (t && /estim/i.test(JSON.stringify(t)) ? 'est' : 'obs');
  const label = (t) => { const s = typeof t === 'string' ? t : (t && (t.label || t.text || t.name)) || ''; return s; };

  function verdictBody(p) {
    const big = p.kpis.map((k) => `<div class="rp-vd__k"><div class="rp-vd__l"><span>${esc(k.label)}</span>${k.tag ? `<span class="rp-tag rp-tag--${tagCls(k.tag)}">${esc(label(k.tag) || (tagCls(k.tag) === 'est' ? 'Estimado' : 'Observado'))}</span>` : ''}</div>
      <div class="rp-vd__v">${isNum(k.value) ? esc(f(k.kind, k.value)) : '<span class="rp-na">No disponible</span>'}</div><div class="rp-vd__s">${k.sub ? esc(k.sub) : '&nbsp;'}</div></div>`).join('');
    return `<div class="rp-op"><div class="rp-vd">${big}</div>${p.caution.length ? `<div class="rp-callout rp-callout--warn"><strong>Antes de decidir.</strong> ${p.caution.map(esc).join(' ')}</div>` : ''}
      <div class="rp-op__notes">${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }
  function riskBody(p) {
    const c = p.counts, S = FP.reportGerencial.STATUS, chip = (k, n) => `<span class="rp-sem rp-sem--${k}"><span aria-hidden="true">${S[k].mark}</span> ${n} ${esc(S[k].label.toLowerCase())}</span>`;
    const list = (rows, cls) => rows.length ? rows.map((r) => `<div class="rp-dir"><span>${esc(r.label)}</span><b class="${cls}">${esc(f('smoneyC', r.gap))}${isNum(r.gapPct) ? ` · ${esc(f('spct', r.gapPct))}` : ''}</b></div>`).join('') : '<p class="rp-small">Ninguno.</p>';
    return `<div class="rp-op"><div class="rp-dir__chips">${chip('ok', c.ok)}${chip('watch', c.watch)}${chip('alert', c.alert)}</div>
      ${p.total ? `<div class="rp-dir rp-dir--tot"><span>${esc(p.total.label)}</span><b class="${p.total.gap < 0 ? 'rp-neg' : 'rp-pos'}">${esc(f('smoneyC', p.total.gap))}${isNum(p.total.gapPct) ? ` · ${esc(f('spct', p.total.gapPct))}` : ''}</b></div>` : ''}
      <div class="rp-dir__cols"><div><h3 class="rp-dir__h">Quién resta</h3>${list(p.subtract, 'rp-neg')}</div><div><h3 class="rp-dir__h">Quién suma</h3>${list(p.add, 'rp-pos')}</div></div>
      <div class="rp-op__notes">${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }
  const title = (p) => p.conclusion || null;
  FP.reportView.register('verdict', { section: 'Veredicto', body: verdictBody, title, noHeadline: true });
  FP.reportView.register('riskOpp', { section: 'Riesgo y oportunidad', body: riskBody, title, noHeadline: true });
})(typeof window !== 'undefined' ? window : globalThis);
