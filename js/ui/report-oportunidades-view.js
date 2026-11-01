/**
 * report-oportunidades-view.js — Dibujo de la lámina «Oportunidades priorizadas» (Presentation Intelligence · Fase 5). Solo presenta lo que construyó
 * FP.reportOpportunities; no calcula nada.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v), f = (k, v) => FP.reportBuilder.fmt(k, v), isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const tag = (t, c) => `<span class="rp-tag rp-tag--${c}">${esc(t)}</span>`;
  const D = (iso) => (iso ? f('date', iso) : '—');

  function body(p) {
    const g = p.gaps.length ? `<table class="rp-t rp-op__t"><caption>Dónde está la brecha ${tag('Observado', 'obs')}</caption><thead><tr><th scope="col">Canal</th><th scope="col" class="num">Brecha vs plan</th><th scope="col" class="num">vs plan</th><th scope="col" class="num">Parte de la brecha</th></tr></thead><tbody>${p.gaps.map((r) => `<tr><th scope="row">${esc(r.label)}</th><td class="num rp-neg">▼ ${esc(f('smoneyC', r.gap))}</td><td class="num rp-neg">${isNum(r.gapPct) ? esc(f('spct', r.gapPct)) : '—'}</td><td class="num">${isNum(r.share) ? esc(f('pct', r.share)) : '—'}</td></tr>`).join('')}
      ${p.totalGap && p.gapsTotal > 1 ? `<tr class="rp-total"><th scope="row">Total digital</th><td class="num ${p.totalGap.gap < 0 ? 'rp-neg' : 'rp-pos'}">${esc(f('smoneyC', p.totalGap.gap))}</td><td class="num">${isNum(p.totalGap.gapPct) ? esc(f('spct', p.totalGap.gapPct)) : '—'}</td><td></td></tr>` : ''}</tbody></table>`
      : '<p class="rp-small">Ningún canal queda por debajo de su plan a la fecha.</p>';
    const a = p.actions.length ? `<table class="rp-t rp-op__t"><caption>Qué se puede recuperar ${tag('Estimado', 'est')}</caption><thead><tr><th scope="col">Acción</th><th scope="col">Canal</th><th scope="col">Responsable</th><th scope="col">Ventana</th><th scope="col">Urgencia</th><th scope="col">Evidencia</th><th scope="col" class="num">Impacto simulado</th></tr></thead><tbody>${p.actions.map((r) => `<tr><th scope="row">${r.warn ? '<span class="rp-warnmark" role="img" aria-label="Revisar supuestos" title="El impacto simulado supera la brecha del periodo">⚠</span> ' : ''}${esc(r.title)}</th><td>${esc(r.channel)}</td><td>${r.owner ? esc(r.owner) : '<span class="rp-na">Por asignar</span>'}</td><td>${esc(D(r.start))} → ${esc(D(r.end))}</td>
      <td>${r.priority && r.priority.urgency ? esc(r.priority.urgency) : '<span class="rp-na">n/d</span>'}</td><td>${r.priority && r.priority.evidence ? esc(r.priority.evidence) : '<span class="rp-na">n/d</span>'}</td><td class="num">${r.impact ? esc(f('smoneyC', r.impact.value)) : '<span class="rp-na">Sin escenario</span>'}</td></tr>`).join('')}</tbody></table>`
      : '<p class="rp-small">No hay acciones registradas en Recuperar para este periodo.</p>';
    return `<div class="rp-op"><div class="rp-op__blk">${g}</div><div class="rp-op__blk">${a}</div>${p.warning ? `<div class="rp-callout rp-callout--warn"><strong>Revisa los supuestos.</strong> ${esc(p.warning)}</div>` : ''}<div class="rp-op__notes">${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }
  FP.reportView.register('opportunities', { section: 'Oportunidades priorizadas', body, title: (p) => p.conclusion || null, noHeadline: true });
})(typeof window !== 'undefined' ? window : globalThis);
