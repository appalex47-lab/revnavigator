/**
 * report-escenarios-view.js — Dibujo de la lámina de Escenarios y de los anexos «Reglas y umbrales» y «Ediciones e IA» (Presentation Intelligence · Fase 8).
 * Solo presenta lo que construyó FP.reportScenarios (y las ediciones vigentes de la persona); no calcula nada.
 */
(function (root) {
  'use strict';
  const FP = (root.FP = root.FP || {});
  const esc = (v) => FP.ui.helpers.esc(v), f = (k, v) => FP.reportBuilder.fmt(k, v), isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const tag = (t, c) => `<span class="rp-tag rp-tag--${c}">${esc(t)}</span>`;
  const na = (t) => `<span class="rp-na">${esc(t)}</span>`;

  function scenariosBody(p) {
    const body = p.rows.map((r) => `<tr><th scope="row">${r.exceeds ? '<span class="rp-warnmark" role="img" aria-label="Revisar supuestos" title="El impacto simulado supera la brecha del periodo">⚠</span> ' : ''}${esc(r.name)}${r.change ? `<span class="rp-op__sub">${esc(r.change)}</span>` : ''}</th>
      <td>${esc(r.channel)}</td><td class="num">${r.impact === null ? na('Sin escenario') : `${esc(f('smoneyC', r.impact))} ${tag('Estimado', 'est')}`}</td><td class="num">${r.recovery ? esc(r.recovery) : '<span class="rp-na">—</span>'}</td>
      <td class="rp-sc__a"${r.assumptionFull && r.assumptionFull !== r.assumption ? ` title="${esc(r.assumptionFull)}"` : ''}>${r.assumption ? esc(r.assumption) : na('Sin supuestos guardados')}${r.warning ? `<span class="rp-op__sub rp-sc__w">Advertencia: ${esc(r.warning)}</span>` : ''}</td></tr>`).join('');
    const more = p.rows.some((r) => r.assumptionsTotal > 1 || r.warningsTotal > 1);
    return `<div class="rp-op"><table class="rp-t rp-op__t rp-sc"><caption class="sr-only">Escenarios guardados</caption><thead><tr><th scope="col">Escenario</th><th scope="col">Canal</th><th scope="col" class="num">Impacto simulado (venta)</th><th scope="col" class="num">% de la brecha</th><th scope="col">Supuesto principal</th></tr></thead><tbody>${body}</tbody></table>
      ${p.warning ? `<div class="rp-callout rp-callout--warn"><strong>Revisa los supuestos.</strong> ${esc(p.warning)}</div>` : ''}
      <div class="rp-op__notes">${more ? '<p class="rp-small">Supuestos completos en Recuperar.</p>' : ''}${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }

  function rulesBody(p) {
    const th = p.thresholds.length ? p.thresholds.map((t) => `<p class="rp-def"><b>${esc(t.label)}:</b> ${esc(f('pct', t.value))} ${tag(t.origin, t.origin === 'Valor provisional' ? 'obs' : 'est')}</p>`).join('') : '<p class="rp-small">Este formato no usa umbrales.</p>';
    return `<div class="rp-op"><div class="rp-sc__two"><div><h3 class="rp-vd__h">Umbrales en uso</h3>${th}<h3 class="rp-vd__h">Sellos</h3>${p.seals.map((s) => `<p class="rp-def">${tag(s.tag, s.tag === 'Estimado' ? 'est' : 'obs')} ${esc(s.what)}</p>`).join('')}</div>
      <div><h3 class="rp-vd__h">Límites</h3>${p.limits.map((l) => `<p class="rp-def">${esc(l)}</p>`).join('')}</div></div>
      ${voiceHtml(p.voice)}
      <div class="rp-op__notes">${p.notes.map((n) => `<p class="rp-small">${esc(n)}</p>`).join('')}</div></div>`;
  }
  /** Titulares escritos para este formato frente a los que se quedan con el del reporte actual (y por qué). */
  function voiceHtml(v) {
    if (!v || !v.length) return '';
    const own = v.filter((x) => x.source === 'voz'), rest = v.filter((x) => x.source !== 'voz');
    return `<p class="rp-def"><b>Titulares con la voz de este formato:</b> ${own.length} de ${v.length}${rest.length ? `. Conservan el titular del reporte actual: ${rest.map((x) => `${esc(x.title)} (falta ${esc(x.missing)})`).join('; ')}` : ''}.</p>`;
  }

  const one = (v, n) => FP.reportScenarios.oneLine(v, n);   // el texto completo está en la lámina editada
  function editsBody(p, x) {
    const edits = x.edits || {}, prefix = `${x.editProfile}|`, byId = new Map((x.report.pages || []).map((q) => [q.id, q]));
    const rows = Object.keys(edits).filter((k) => k.startsWith(prefix)).map((k) => { const id = k.slice(prefix.length), e = edits[k], pg = byId.get(id); return { title: pg ? pg.title : id, e }; }).filter((r) => r.e && (r.e.title || r.e.note || (r.e.hyp && r.e.hyp.length)));
    const body = rows.map((r) => `<tr><th scope="row">${esc(r.title)}</th><td>${r.e.title ? `Título: «${esc(one(r.e.title, 90))}»` : ''}${r.e.note ? `<span class="rp-op__sub">Nota: «${esc(one(r.e.note, 130))}»</span>` : ''}${!r.e.title && !r.e.note ? na('Ninguna') : ''}</td>
      <td>${r.e.hyp && r.e.hyp.length ? r.e.hyp.map((h) => `<span class="rp-sc__h">${esc(one(h, 110))}</span>`).join('') : na('Ninguna')}</td></tr>`).join('');
    return `<div class="rp-op"><table class="rp-t rp-op__t rp-sc"><caption class="sr-only">Ediciones y sugerencias de IA</caption><thead><tr><th scope="col">Lámina</th><th scope="col">Edición de la persona</th><th scope="col">Hipótesis de IA aceptada (por validar)</th></tr></thead><tbody>${body}</tbody></table>
      <div class="rp-op__notes"><p class="rp-small">Ninguna edición cambia una cifra calculada. Las hipótesis de IA son suposiciones a investigar, no hechos; se validaron para no traer cifras ajenas a la lámina ni lenguaje causal.</p></div></div>`;
  }

  FP.reportView.register('scenarios', { section: 'Escenarios de recuperación', body: scenariosBody, title: (p) => p.conclusion || null, noHeadline: true });
  FP.reportView.register('annexRules', { section: 'Anexo técnico · Reglas y umbrales', body: rulesBody, title: (p) => p.conclusion || null, noHeadline: true });
  FP.reportView.register('annexEdits', { section: 'Anexo técnico · Ediciones e IA', body: editsBody, title: (p) => p.conclusion || null, noHeadline: true });
})(typeof window !== 'undefined' ? window : globalThis);
