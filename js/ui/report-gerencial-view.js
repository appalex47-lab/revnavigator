/**
 * report-gerencial-view.js — Dibujo de las láminas del formato Gerencial (Presentation Intelligence · Fase 4).
 * Solo presenta lo que ya construyó FP.reportGerencial; no calcula nada. Los colores salen de css/report.css.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v);
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const f = (k, v) => FP.reportBuilder.fmt(k, v);
  const cls = (g) => (!isNum(g) || g === 0 ? '' : g > 0 ? 'rp-pos' : 'rp-neg');
  const arrow = (g) => (!isNum(g) || g === 0 ? '' : g > 0 ? '▲ ' : '▼ ');
  const chip = (st) => { const s = st && FP.reportGerencial.STATUS[st]; return s ? `<span class="rp-sem rp-sem--${st}"><span aria-hidden="true">${s.mark}</span> ${esc(s.label)}</span>` : '<span class="rp-na">No disponible</span>'; };

  function scorecardBody(p) {
    const row = (r, tot) => `<tr${tot ? ' class="rp-total"' : ''}><th scope="row">${esc(r.label)}</th><td class="num">${esc(f('moneyC', r.actual))}</td><td class="num">${esc(f('moneyC', r.plan))}</td>
      <td class="num ${cls(r.gap)}">${isNum(r.gap) ? arrow(r.gap) + esc(f('smoneyC', r.gap)) : '—'}</td><td class="num ${cls(r.gapPct)}">${isNum(r.gapPct) ? esc(f('spct', r.gapPct)) : '—'}</td><td>${chip(r.status)}</td></tr>`;
    const c = p.counts, tile = (k, n) => `<div class="rp-sem-tile rp-sem-tile--${k}"><span class="rp-sem-tile__n">${n}</span><span class="rp-sem-tile__l">${chip(k)}</span></div>`;
    return `<div class="rp-op"><div class="rp-sem-tiles">${tile('ok', c.ok)}${tile('watch', c.watch)}${tile('alert', c.alert)}</div>
      <table class="rp-t rp-op__t"><caption class="sr-only">Cumplimiento de venta por canal</caption><thead><tr><th scope="col">Canal</th><th scope="col" class="num">Venta real</th><th scope="col" class="num">Plan a la fecha</th><th scope="col" class="num">Brecha</th><th scope="col" class="num">vs plan</th><th scope="col">Estado</th></tr></thead>
      <tbody>${p.rows.map((r) => row(r)).join('')}${p.total ? row(p.total, true) : ''}</tbody></table>
      <div class="rp-op__two">${p.review.length ? `<div class="rp-callout rp-callout--info"><strong>Qué revisar.</strong> ${p.review.map(esc).join(' ')}</div>` : '<div></div>'}<div>${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div></div>`;
  }
  FP.reportView.register('channelScorecard', { section: 'Cumplimiento por canal', body: scorecardBody, title: (p) => p.conclusion || null, noHeadline: true });
})(typeof window !== 'undefined' ? window : globalThis);
